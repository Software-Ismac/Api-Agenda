import { Hono } from "hono";
import { getDataEnv } from "../baas";
import { authenticator, totp } from "otplib";
import { sendEmail } from "../services/sendEmail";
import { decode, sign, verify } from "hono/jwt";
import { Bindings } from ".";

const TOPT = new Hono<{ Bindings: Bindings }>();

const issuer = "Ismac Agenda"; // Replace with your app's name

TOPT.get("/v1/2fa", async (c) => {
  const { token } = c.req.query();
  if (!token) return c.text("Token requerido", 400);

  try {
    const decodedData = decode(token); // Solo lees el contenido

    const decoded = await verify(token, decodedData.payload.email);
    const { email } = decoded as { email: string };
    const key = `2fa:${email}`;

    // Verificar si ya existe información de 2FA
    const existing = await c.env["2fa"].get(key);
    if (existing) {
      const otpauth = authenticator.keyuri(
        email,
        issuer,
        JSON.parse(existing).secret
      );
      return c.json({ otpauth });
    }

    // Generar nueva clave 2FA si no existe
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(email, issuer, secret);
    const data = { secret, otpauth, token };
    const dataReturn = { otpauth };
    // Guardar en el KV store
    await c.env["2fa"].put(key, JSON.stringify(data));

    return c.json(dataReturn);
  } catch (e) {
    console.error(e);
    return c.text("Token inválido", 401);
  }
});

TOPT.post("/v1/2fa/generate", async (c) => {
  const { email } = c.req.query();
  if (!email) return c.text("Email requerido", 400);

  // Generate token with 24-hour expiration
  const exp = Math.floor(Date.now() / 1000) + 24 * 60 * 60; // 24 hours in seconds
  const token = await sign({ email: email, exp: exp }, email);

  await sendEmail(email, token);
  return c.json({ status: true });
});

TOPT.post("/2fa/confirm", async (c) => {
  const { opt, token } = await c.req.json();

  if (!token || !opt) {
    return c.text("Faltan datos", 400);
  }

  try {
    const decodedData = decode(token); // Solo lees el contenido
    //@ts-ignore
    const decoded = await verify(token, decodedData.payload.email);

    const { email } = decoded as { email: string };

    const dataStr = await c.env["2fa"].get(`2fa:${email}`);
    if (!dataStr) {
      return c.text("No se encontró configuración 2FA para este usuario", 404);
    }

    let data;
    try {
      data = JSON.parse(dataStr);
    } catch {
      return c.text("Formato de datos inválido", 500);
    }

    const { secret } = data;

    const isTokenValid = totp.check(opt, secret);
    if (!isTokenValid) {
      return c.text("Código TOTP inválido", 403);
    }

    await c.env["2fa"].put(
      `2fa:${email}`,
      JSON.stringify({ secret, isValid: true })
    );

    return c.json({ ok: true, message: "2FA confirmado exitosamente" });
  } catch (e) {
    console.error(e);
    return c.text("Token inválido", 401);
  }
});

TOPT.get("/v1/2fa/verify", async (c) => {
  const { email } = c.req.query();
  if (!email) return c.text("Email requerido", 400);

  const dataStr = await c.env["2fa"].get(`2fa:${email}`);
  if (!dataStr) {
    return c.text("No se encontró configuración 2FA para este usuario", 400);
  }

  let data;
  try {
    data = JSON.parse(dataStr);
  } catch {
    return c.text("Formato de datos inválido", 500);
  }

  const { isValid } = data;
  if (isValid) {
    return c.status(200);
  } else {
    return c.status(400);
  }
});

export default TOPT;
