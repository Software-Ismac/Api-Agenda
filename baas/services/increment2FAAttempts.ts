import { Context } from "hono";

const increment2FAAttempts = async (
  c: Context<any>,
  KV: KVNamespace,
  key: string
) => {
  const attempts = JSON.parse((await KV.get(`${key}:attempts`)) ?? "");
  const attemptsCount = attempts.attemptsCount ? parseInt(attempts) : 0;
  const MAX_2FA_ATTEMPTS = c.var.MAX_2FA_ATTEMPTS;
  const KV_EXPIRATION = c.var.KV_EXPIRATION;
  if (attemptsCount >= MAX_2FA_ATTEMPTS) {
    return false; // Reached max attempts
  }

  await KV.put(
    `${key}:attempts`,
    JSON.stringify({
      expirationTtl: KV_EXPIRATION,
      attemptsCount: attemptsCount + 1,
    })
  );
  return true;
};
export { increment2FAAttempts };
