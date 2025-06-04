import { Context } from "hono";
import { Bindings } from "../..";
import { d1Client, getDataEnv } from "../../../baas";

export class userController {
  c: Context<
    {
      Bindings: Bindings;
    },
    "",
    {}
  >;
  constructor(c: any) {
    this.c = c;
  }
  createUser = async () => {
    const { email, userId } = getDataEnv(this.c);
    const prisma = await d1Client(this.c);
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        note: {},
        galery: {},
        albums: {
          include: {
            album: {},
          },
        },
        share: {
          include: {
            note: {
              include: {
                user: {},
              },
            },
          },
        },
      },
    });
    if (!user) {
      try {
        const body = (await this.c.req.json()) ?? {};
        await prisma.user.create({
          data: { ...body, userId, email, created: new Date() },
        });
        return this.c.json({ ...body, userId, email }, 201);
      } catch (error) {
        this.c.status(404);
        return this.c.json({ staus: false }, 404);
      }
    }
    return this.c.json(user, 200);
  };
  getUser = async () => {};
  updateUser = async () => {
    try {
      const { userId } = getDataEnv(this.c);

      const prisma = await d1Client(this.c);
      const body = await this.c.req.json();

      const updatedUser = await prisma.user.update({
        where: { userId },
        data: { ...(body ?? {}) },
      });

      return this.c.json(updatedUser, 200);
    } catch (error) {
      return this.c.json({ error: "Failed to update user" }, 400);
    }
  };
}
