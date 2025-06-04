import { Context } from "hono";
import { handleError } from "../services/handleError";
import { hashPassword } from "../services/hashPassword";
import { customAlphabet, nanoid } from "nanoid";
import { User } from "../interface";
export const registerUser = async (c: Context<any>) => {
  const { password, email } = await c.req.json();
  const DB = (await c.env.DB) as D1Database;

  const user = await DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();

  if (user) {
    if (user.confirmed == "true") {
      return handleError(c, 400, "Usuario ya existe");
    }
    return handleError(
      c,
      400,
      "El correro de confirmacion se envio por correo"
    );
  }
  const hashedPassword = await hashPassword(password);

  const userData: User = {
    userId: nanoid(10),
    password: hashedPassword,
    email,
    confirmed: "false",
    type: "bypass",
  };
  await DB.prepare(
    "INSERT INTO users (userId, email, password, type, confirmed) VALUES (?, ?, ?, ?, ?)"
  )
    .bind(
      userData.userId,
      userData.email,
      userData.password,
      userData.type,
      userData.confirmed
    )
    .run();
  const confirmationCode = customAlphabet("0987654321")(6);
  const KV = await c.env["2fa"];
  const KV_2FA_PREFIX = c.var.KV_2FA_PREFIX;
  const KV_EXPIRATION = c.var.KV_EXPIRATION;
  await KV.put(
    `${KV_2FA_PREFIX}${userData.userId}:${confirmationCode}`,
    JSON.stringify({ expirationTtl: KV_EXPIRATION, confirmationCode })
  );
  return c.json({ confirmationCode, message: "User Register" });
};
