import { Context } from "hono";
import { Bindings } from "../../../src";
import { BlankInput } from "hono/types";
import { nanoid } from "nanoid";

import { createTokens } from "../../services/createTokens";
import prismaClients from "../../lib/prismaClient";
import { totp } from "otplib";

// Configura otplib para que los códigos duren 5 minutos (300 segundos)
totp.options = {
  step: 300, // Duración del OTP en segundos (5 minutos)
  digits: 6, // Longitud del OTP
};

// ✅ Generar OTP usando el email como "secret"
function generateOTP(email: string): string {
  // IMPORTANTE: en producción deberías usar un secreto más seguro,
  // como un HMAC del email + una clave del servidor.
  const otp = totp.generate(email);
  return otp;
}

// ✅ Verificar OTP
function verifyOTP(email: string, userInputOTP: string): boolean {
  const isValid = totp.check(userInputOTP, email);
  return isValid;
}

// handler.ts
export const magicLinkProviderPut = async (
  c: Context<{ Bindings: Bindings }, "/", BlankInput>
) => {
  const { email, created } = await c.req.json();
  //@ts-ignore
  const sendNotifications = c.var.sendNotifications;
  if (!sendNotifications) {
    return c.json({ status: false }, 404);
  }

  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  const userCollection = prisma.userRegister;

  let user = await userCollection.findUnique({ where: { email } });

  if (!user) {
    await userCollection.create({
      data: {
        userId: nanoid(10),
        email,
        password: "",
        type: "magic-link",
        confirmed: false,
        created,
      },
    });
  }

  const confirmationCode = generateOTP(email);
  await sendNotifications(email, confirmationCode);

  return c.json({ status: true });
};

export const magicLinkProviderPost = async (
  c: Context<
    {
      Bindings: Bindings;
    },
    "/",
    BlankInput
  >
) => {
  const { email, confirmationCode, created } = await c.req.json();

  const kv = c.env["2fa"] as KVNamespace;
  const key = `otp_attempts:${email}`;

  // Verificar si el usuario está bloqueado (si existe y ha fallado 3 veces)
  const attemptRaw = await kv.get(key);
  const attempts = attemptRaw ? parseInt(attemptRaw) : 0;

  if (attempts >= 3) {
    return c.json(
      {
        status: false,
        message: `Demasiados intentos fallidos. Intenta de nuevo en 5 minutos.`,
      },
      401
    );
  }

  const isValid = verifyOTP(email, confirmationCode);

  if (!isValid) {
    const newAttempts = attempts + 1;

    // Si alcanzó 3 intentos, bloqueamos por 5 minutos (300 segundos)
    if (newAttempts >= 3) {
      await kv.put(key, newAttempts.toString(), { expirationTtl: 300 }); // 5 min
    } else {
      await kv.put(key, newAttempts.toString(), { expirationTtl: 300 });
    }

    return c.json(
      {
        status: false,
        message: `Código inválido. Intento ${newAttempts} de 3.`,
      },
      401
    );
  }

  // OTP válido: limpiar intentos fallidos
  await kv.delete(key);

  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  const userCollection = prisma.userRegister;

  let user = await userCollection.findUnique({ where: { email } });

  if (!user) {
    user = await userCollection.create({
      data: {
        userId: nanoid(10),
        email,
        password: "",
        type: "passwordLess",
        confirmed: true,
        created,
      },
    });
  } else if (!user.confirmed) {
    await userCollection.update({
      where: { email },
      data: { confirmed: true },
    });
  }

  const { accessToken, refreshToken } = await createTokens(
    c,
    user.userId,
    user.email
  );

  return c.json({
    status: true,
    accessToken,
    refreshToken,
  });
};
