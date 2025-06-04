import { Context } from "hono";
import { handleError } from "../../services/handleError";
import { createTokens } from "../../services/createTokens";
import { verify } from "hono/jwt";

export const refreshToken = async (c: Context<any>) => {
  const authHeader = await c.req.header("Authorization");
  if (!authHeader) {
    return handleError(c, 401, "Falta token de autorización");
  }
  const token = authHeader.replace("Bearer ", ""); // ✅ token completo

  const payloadPreview = JSON.parse(atob(authHeader.split(".")[1]));
  const userId = payloadPreview.userId;

  const KV = c.env["2fa"];
  let JWT_SECRET = await KV.get(`secret:${userId}`);

  if (!JWT_SECRET) {
    JWT_SECRET = crypto.randomUUID(); // Puedes usar crypto.subtle si necesitas algo más fuerte
    await KV.put(`secret:${userId}`, JWT_SECRET);
  }
  try {
    const refreshPayload = (await verify(token, JWT_SECRET)) as {
      userId: string;
      email: string;
      type: string;
    };

    const { accessToken } = await createTokens(
      c,
      refreshPayload.userId,
      refreshPayload.email,
      false
    );
    return c.json({
      status: true,
      message: "Tokens renovados",
      accessToken,
    });
  } catch (err) {
    return handleError(
      c,
      401,
      "Refresh token inválido o revocado, debes iniciar sesión nuevamente"
    );
  }
};

export const logoutAllSesion = async (c: Context<any>) => {
  const authHeader = await c.req.header("Authorization");
  if (!authHeader) {
    return handleError(c, 401, "Falta token de autorización");
  }

  const payloadPreview = JSON.parse(atob(authHeader.split(".")[1]));
  const userId = payloadPreview.userId;

  const KV = c.env["2fa"];
  await KV.delete(`secret:${userId}`);
  c.status(200);
  c.json({
    status: true,
    message: "Todas las sesiones han sido cerradas",
    userId: userId,
  });
};
