import { Context } from "hono";
import { handleError } from "../services/handleError";

const logoutUser = async (c: Context<any>) => {
  const authHeader = await c.req.header("Authorization");
  if (!authHeader) {
    return handleError(c, 401, "Falta token de autorización");
  }
  const token = authHeader.split(" ")[1];
};
export { logoutUser };
