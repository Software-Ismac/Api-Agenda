import prismaClients from "./prismaClient";

export const d1Client = async (c: any) => {
  //@ts-ignore
  const DB = (await c.env.DB) as D1Database;
  return await prismaClients.fetch(DB);
};

export type D1PrismaClient = Awaited<ReturnType<typeof d1Client>>;
