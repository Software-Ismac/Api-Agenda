import { Context } from "hono";
import { sign } from "hono/jwt";

export const createTokens = async (
  c: Context<any>,
  userId: string,
  email: string,
  both: boolean = true
) => {
  const JWT_EXPIRES_IN = parseInt(await c.var.JWT_EXPIRES_IN, 10);
  const LONG_LIVED_REFRESH_EXPIRATION = parseInt(
    await c.var.LONG_LIVED_REFRESH_EXPIRATION,
    10
  );
  console.log(userId);
  const KV = c.env["2fa"];
  let JWT_SECRET = await KV.get(`secret:${userId}`);
  console.log(JWT_SECRET);
  if (!JWT_SECRET) {
    JWT_SECRET = crypto.randomUUID(); // Puedes usar crypto.subtle si necesitas algo más fuerte
    await KV.put(`secret:${userId}`, JWT_SECRET);
  }

  const now = Math.floor(Date.now() / 1000);
  const accessTokenExp = now + JWT_EXPIRES_IN;
  const refreshTokenExp = now + LONG_LIVED_REFRESH_EXPIRATION;

  const accessToken = await sign(
    { userId, email, type: "access-token", exp: accessTokenExp },
    JWT_SECRET
  );

  if (both) {
    const refreshToken = await sign(
      { userId, email, type: "refresh-token", exp: refreshTokenExp },
      JWT_SECRET
    );
    return { accessToken, refreshToken };
  }

  return { accessToken };
};
