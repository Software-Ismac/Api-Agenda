import { Context } from "hono";
import { Bindings } from "../../../src";
import { BlankInput } from "hono/types";
import { handleError } from "../../services/handleError";
import { nanoid } from "nanoid";
import { createTokens } from "../../services/createTokens";
import prismaClients from "../../lib/prismaClient";

export const googleProvider = async (
  c: Context<
    {
      Bindings: Bindings;
    },
    "/",
    BlankInput
  >
) => {
  const DB = c.env.DB;
  const authHeader = await c.req.header("Authorization");

  if (!authHeader) {
    return handleError(c, 401, "Falta token de autorización");
  }
  const token = authHeader.split(" ")[1];

  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?access_token=${token}`
  );
  const { email } = (await response.json()) as {
    email: string;
    email_verified: boolean;
    family_name: string;
    given_name: string;
    locale: string;
    name: string;
    picture: string;
  };
  const prisma = await prismaClients.fetch(DB);
  const userCollection = prisma.userRegister;
  let user = await userCollection.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const userId = nanoid(10);
    const user = {
      userId,
      email,
      password: "",
      type: "google",
      confirmed: true,
    };
    await userCollection.create({ data: user });
  } else if (user?.confirmed === false) {
    await userCollection.update({
      where: {
        email,
      },
      data: {
        confirmed: true,
      },
    });
  }

  const { accessToken, refreshToken } = await createTokens(
    c,
    //@ts-ignore
    user?.userId,
    user?.email
  );
  console.log(accessToken);
  return c.json({
    status: true,
    accessToken,
    refreshToken,
  });
};
