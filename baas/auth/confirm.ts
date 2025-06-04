import { Context } from "hono";
import { getKVCode } from "../services/getKVCode";
import { handleError } from "../services/handleError";
import { increment2FAAttempts } from "../services/increment2FAAttempts";
import { reset2FAAttempts } from "../services/reset2FAAttempts";

const confirmUser = async (c: Context<any>) => {
  const confirmationCode = await c.req.query("confirmationCode");
  const userId = await c.req.query("userId");
  if (!userId || !confirmationCode) {
    return;
  }
  const KV = await c.env["2fa"];
  const KV_2FA_PREFIX = c.var.KV_2FA_PREFIX;
  const validCode = await getKVCode(
    KV,
    `${KV_2FA_PREFIX}${userId}:${confirmationCode}`,
    confirmationCode
  );
  if (!validCode) {
    const attemptsValid = await increment2FAAttempts(
      c,
      KV,
      `${KV_2FA_PREFIX}${userId}`
    );
    if (!attemptsValid) {
      return handleError(
        c,
        400,
        "Demasiados intentos, por favor inténtalo más tarde"
      );
    }
    return handleError(c, 400, "Código de confirmación inválido o expirado");
  }

  const DB = await c.env.DB;
  const user = await DB.prepare("SELECT * FROM users WHERE userId = ?")
    .bind(userId)
    .first();

  if (!user) {
    return handleError(c, 404, "Usuario no encontrado");
  }

  if (user.confirmed === "true") {
    return handleError(c, 400, "Usuario ya confirmado");
  }

  await DB.prepare("UPDATE users SET confirmed = 'true' WHERE userId = ?")
    .bind(user)
    .run();

  await reset2FAAttempts(KV, `${KV_2FA_PREFIX}${userId}`);
  await KV.delete(`${KV_2FA_PREFIX}${userId}:${confirmationCode}`);
  return true;
};
export { confirmUser };
