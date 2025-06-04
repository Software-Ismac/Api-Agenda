import { createMiddleware } from "hono/factory";

const envMiddleware = createMiddleware(async (c, next) => {
  const JWT_SECRET = c.var.JWT_SECRET ?? "supersecreto";
  const JWT_EXPIRES_IN = c.var.JWT_EXPIRES_IN ?? 60 * 60 * 24;
  const LONG_LIVED_REFRESH_EXPIRATION =
    c.var.LONG_LIVED_REFRESH_EXPIRATION ?? 60 * 60 * 24 * 365;
  const KV_2FA_PREFIX = c.var.KV_2FA_PREFIX ?? "2fa:";
  const KV_EXPIRATION = c.var.KV_EXPIRATION ?? 60 * 60 * 24;
  const MAX_2FA_ATTEMPTS = c.var.MAX_2FA_ATTEMPTS ?? 3;
  c.set("JWT_SECRET", JWT_SECRET);
  c.set("JWT_EXPIRES_IN", JWT_EXPIRES_IN);
  c.set("LONG_LIVED_REFRESH_EXPIRATION", LONG_LIVED_REFRESH_EXPIRATION);
  c.set("KV_2FA_PREFIX", KV_2FA_PREFIX);
  c.set("KV_EXPIRATION", KV_EXPIRATION);
  c.set("MAX_2FA_ATTEMPTS", MAX_2FA_ATTEMPTS);
  await next();
});
export { envMiddleware };
