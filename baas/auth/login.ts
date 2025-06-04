import { User } from "../interface";
import { Context } from "hono";
import { handleError } from "../services/handleError";
import { createTokens } from "../services/createTokens";
import { hashPassword } from "../services/hashPassword";

const loginUser = async (c: Context<any>) => {
  const { email, password } = await c.req.json();

  const DB = (await c.env.DB) as D1Database;
  const user = await DB.prepare("SELECT * FROM users WHERE email = ?")
    .bind(email)
    .first<User>();
  if (!user) {
    return handleError(c, 401, "Usuario no existe");
  }

  const isPassword = user.password == (await hashPassword(password));

  if (!isPassword) {
    return handleError(c, 401, "Usuario o contraseña inválidos");
  }
  if (user.confirmed === "false") {
    return handleError(c, 403, "Confirma tu cuenta antes de iniciar sesión");
  }

  const { accessToken, refreshToken } = await createTokens(
    c,
    user.userId,
    user.email
  );
  return {
    accessToken,
    refreshToken,
    status: true,
  };
};
export { loginUser };
