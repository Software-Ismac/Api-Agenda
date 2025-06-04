import { Hono } from "hono";
import { totp } from "otplib";
//@ts-ignore
import qrcode from "qrcode";

type Bindings = {
  KV: KVNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();

const issuer = "Llampukaq Technology";

app.post("/2fa/generate", async (c) => {
  const { email } = await c.req.json();

  if (!email) return c.text("Email requerido", 400);

  // 1. Generar secreto
  const secret = totp.generate("e009c492-b1fd-4a20-9b2e-6213c2ddc9e5");

  // 2. Crear otpauth:// URI
  const otpauth = totp.keyuri(email, issuer, secret);

  // 3. Generar QR como Data URL (base64)
  const qr = await qrcode.toDataURL(otpauth);

  // 4. Guardar secreto en KV
  await c.env.KV.put(`2fa:${email}:v1`, secret);

  // 5. Devolver QR y secreto
  return c.json({ qr, secret });
});

export default app;
