import { Context } from "hono";
import { User } from "../interface";
import { handleError } from "../services/handleError";
import { createTokens } from "../services/createTokens";
import { customAlphabet, nanoid } from "nanoid";

const generate2FACode = () => {
  return customAlphabet("0987654321", 6)();
};

const passwordLessEmail = async (c: Context<any>) => {
  const { email } = await c.req.json();

  const DB = (await c.env.DB) as D1Database;

  const user = await DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();

  // Crear usuario automáticamente si no existe
  if (!user) {
    const userId = nanoid(10);
    await DB.prepare(
      "INSERT INTO users (userId, email, password, type, confirmed) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(userId, email, "", "passwordLess", "false")
      .run();
  }

  const confirmationCode = generate2FACode();
  const KV = await c.env["2fa"];

  const KV_2FA_PREFIX = c.var.KV_2FA_PREFIX;
  const expirationTime = new Date().getTime() + 5 * 60 * 1000; // 5 minutos en milisegundos

  await KV.put(
    `${KV_2FA_PREFIX}${email}:${confirmationCode}`,
    JSON.stringify({ expirationTtl: expirationTime, confirmationCode })
  );
  return { confirmationCode, email };
};

// Valida el código de 2FA, crea tokens, y confirma al usuario si es necesario.
const passwordLessConfirmationCode = async (c: Context<any>) => {
  const { email, confirmationCode } = await c.req.json();
  const DB = (await c.env.DB) as D1Database;
  const KV = await c.env["2fa"];
  const KV_2FA_PREFIX = c.var.KV_2FA_PREFIX;

  // Verificar el código de 2FA
  const storedCodeData = await KV.get(
    `${KV_2FA_PREFIX}${email}:${confirmationCode}`
  );

  if (!storedCodeData) {
    return handleError(c, 401, "Código de 2FA inválido o expirado");
  }

  const { expirationTtl } = JSON.parse(storedCodeData);

  if (new Date().getTime() > expirationTtl) {
    await KV.delete(`${KV_2FA_PREFIX}${email}:${confirmationCode}`);
    return handleError(c, 401, "El código de 2FA ha expirado");
  }

  // Eliminar el código de KV después de su uso
  await KV.delete(`${KV_2FA_PREFIX}${email}:${confirmationCode}`);

  // Buscar al usuario en la base de datos
  let user = await DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();

  if (!user) {
    // Crear usuario automáticamente si no existe
    const userId = nanoid(10);
    user = {
      userId,
      email,
      password: "",
      type: "passwordLess",
      confirmed: "true",
    };
    await DB.prepare(
      "INSERT INTO users (userId, email, password, type, confirmed) VALUES (?, ?, ?, ?, ?)"
    )
      .bind(userId, email, "", "passwordLess", "true")
      .run();
  } else if (user.confirmed === "false") {
    // Confirmar al usuario si no estaba confirmado
    await DB.prepare("UPDATE users SET confirmed = 'true' WHERE email = ?")
      .bind(email)
      .run();
  }

  // Generar tokens de acceso
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

export { passwordLessEmail, passwordLessConfirmationCode };
