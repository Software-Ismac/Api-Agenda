import { Context } from "hono";

export const getDataEnv = (c: Context<any, string, {}>) => {
  const email = c.var.email;
  const userId = c.var.userId;
  return { email, userId };
};
export const getData = (c: Context<any, string, {}>) => {
  const email = c.var.email;
  const userId = c.var.userId;
  return { email, userId };
};
