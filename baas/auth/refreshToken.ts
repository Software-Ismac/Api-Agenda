import { Context } from "hono";
import { handleError } from "../services/handleError";
import { verify } from "hono/jwt";
import { createTokens } from "../services/createTokens";

const refreshToken = async (c: Context<any>) => {
  const authHeader = await c.req.header("Authorization");
  if (!authHeader) {
    return handleError(c, 401, "Falta token de autorización");
  }

  const token = authHeader.split(" ")[1];

  try {
    // Temporalmente usa cualquier clave (la real vendrá después de verificar el payload parcialmente)
    const partialPayload = JSON.parse(atob(token.split(".")[1]));
    const userId = partialPayload.userId;

    const KV = c.env["2fa"];
    const JWT_SECRET = await KV.get(`secret:${userId}`);
    if (!JWT_SECRET) {
      return handleError(c, 401, "No se encontró JWT_SECRET para el usuario");
    }

    const refreshPayload = await verify(token, JWT_SECRET);

    const { accessToken, refreshToken } = await createTokens(
      c,
      //@ts-ignore
      refreshPayload.userId,
      refreshPayload.email,
      true
    );

    return c.json({ message: "Tokens renovados", accessToken, refreshToken });
  } catch (err) {
    return handleError(c, 401, "Token inválido o revocado");
  }
};
