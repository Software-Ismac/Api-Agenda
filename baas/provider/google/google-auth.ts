import { Context } from "hono";

export const googleAuthBaas = async function verifyToken(c: Context<any>) {
  const token = c.get("token");
  const grantedScopes = c.get("granted-scopes");
  const user = c.get("user-google");
  console.log(token);
  // const DB = (await c.env.DB) as D1Database;
  // if (!authHeader) {
  //   return handleError(c, 401, "Falta token de autorización");
  // }
  // const token = authHeader.split(" ")[1];
  // const ticket = await client.verifyIdToken({
  //   idToken: token,
  //   audience:
  //     "703510913713-t7v4eq8q7jil319buekgsasqkib2ma17.apps.googleusercontent.com",
  // });
  // const payload = ticket.getPayload();
  // const email = payload?.email ?? "";

  // let user = await DB.prepare("SELECT * FROM users WHERE email = ?")
  //   .bind(email)
  //   .first<User>();

  // if (!user) {
  //   // Crear usuario automáticamente si no existe
  //   const userId = nanoid(10);
  //   user = {
  //     userId,
  //     email,
  //     password: "",
  //     type: "google",
  //     confirmed: "true",
  //   };
  //   await DB.prepare(
  //     "INSERT INTO users (userId, email, password, type, confirmed) VALUES (?, ?, ?, ?, ?)"
  //   )
  //     .bind(userId, email, "", "passwordLess", "true")
  //     .run();
  // } else if (user.confirmed === "false") {
  //   // Confirmar al usuario si no estaba confirmado
  //   await DB.prepare("UPDATE users SET confirmed = 'true' WHERE email = ?")
  //     .bind(email)
  //     .run();
  // }

  // // Generar tokens de acceso
  // const { accessToken, refreshToken } = await createTokens(
  //   c,
  //   user.userId,
  //   user.email
  // );

  // return c.json({
  //   status: true,
  //   accessToken,
  //   refreshToken,
  // });
};
