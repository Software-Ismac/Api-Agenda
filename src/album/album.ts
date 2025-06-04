import { Env, Hono } from "hono";
import { prismaClients } from "../../baas";
import { Bindings } from "..";

const album = new Hono<{ Bindings: Bindings }>();
album.get("/v1/album/:id", async (c) => {
  const albumId = await c.req.param("id");

  const doId = c.env.ALBUM_DO.idFromName(albumId);
  const stub = c.env.ALBUM_DO.get(doId);
  return stub.fetch(c.req.raw);
});
album.post("/v1/album", async (c) => {
  const data = await c.req.json();
  const prisma = await prismaClients.fetch(c.env.DB);
  await prisma.album.create({
    data: data,
  });

  return c.json({});
});
album.post("/v1/album/user", async (c) => {
  const { albumId, userId } = await c.req.json();
  const prisma = await prismaClients.fetch(c.env.DB);
  await prisma.userAlbum.create({
    data: {
      userId,
      albumId,
    },
  });
  const doId = c.env.ALBUM_DO.idFromName(albumId);
  const stub = c.env.ALBUM_DO.get(doId);
  await stub.fetch("/update", { method: "POST" });

  return c.json({});
});
album.delete("/v1/album/user", async (c) => {
  const { albumId, userId } = await c.req.json();
  const prisma = await prismaClients.fetch(c.env.DB);
  await prisma.userAlbum.delete({
    where: {
      userId_albumId: { userId, albumId },
    },
  });
  const doId = c.env.ALBUM_DO.idFromName(albumId);
  const stub = c.env.ALBUM_DO.get(doId);
  await stub.fetch("/update", { method: "POST" });

  return c.json({});
});
album.post("/v1/album/img", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const { albumId, imageId } = await c.req.json();
  await prisma.albumImage.create({
    data: {
      albumId,
      imageId,
    },
  });
  const doId = c.env.ALBUM_DO.idFromName(albumId);
  const stub = c.env.ALBUM_DO.get(doId);
  await stub.fetch("/update", { method: "POST" });

  return c.json({});
});
album.delete("/v1/album/img", async (c) => {
  const { imageId, albumId } = await c.req.json();
  const prisma = await prismaClients.fetch(c.env.DB);
  await prisma.albumImage.delete({
    where: {
      albumId_imageId: { albumId, imageId },
    },
  });
  const doId = c.env.ALBUM_DO.idFromName(albumId);
  const stub = c.env.ALBUM_DO.get(doId);
  await stub.fetch("/update", { method: "POST" });

  return c.json({});
});
album.put("/v1/album", async (c) => {
  const prisma = await prismaClients.fetch(c.env.DB);
  const { albumId, ...data } = await c.req.json();
  const updateAlbum = await prisma.album.update({
    where: {
      albumId,
    },
    data: data,
  });
  const doId = c.env.ALBUM_DO.idFromName(albumId);
  const stub = c.env.ALBUM_DO.get(doId);
  await stub.fetch("/update", { method: "POST" });

  return c.json({});
});

export default album;
