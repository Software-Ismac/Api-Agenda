import { createMiddleware } from "hono/factory";
import { handleError } from "../services/handleError";
import { verify } from "hono/jwt";
export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token: string = (authHeader && authHeader.split(" ")[1]) ?? "";

  try {
    const payloadPreview = JSON.parse(atob(token.split(".")[1]));
    console.log("Payload Preview:", payloadPreview);
    const userId = payloadPreview.userId;

    const KV = c.env["2fa"];
    let JWT_SECRET = await KV.get(`secret:${userId}`);

    if (!JWT_SECRET) {
      JWT_SECRET = crypto.randomUUID(); // Puedes usar crypto.subtle si necesitas algo más fuerte
      await KV.put(`secret:${userId}`, JWT_SECRET);
    }

    const decodedPayload = await verify(token, JWT_SECRET);
    const { email, userId: realUserId } = decodedPayload;

    c.set("email", email);
    c.set("userId", realUserId);
    await next();
  } catch (error) {
    console.log(error);
    return handleError(c, 401, "Token no válido");
  }
});
