import { Hono } from "hono";
import { Bindings } from "..";

import { d1Client, getDataEnv, prismaClients } from "../../baas";

const images = new Hono<{ Bindings: Bindings }>();

images.get("/v1/images/galery", async (c) => {
  const { userId } = getDataEnv(c);
  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  const images = await prisma.image.findMany({
    where: {
      userId,
    },
  });

  return c.json(images);
});
images.post("/v1/images", async (c) => {
  try {
    const { userId } = getDataEnv(c);

    const size = c.req.query("size");
    const type = c.req.query("type");
    if (!type || !size) {
      c.status(400);
      return c.json({ status: false, message: "size and type are required" });
    }
    const url =
      "https://api.cloudflare.com/client/v4/accounts/48f505082d6f5aaf4510b5b995a42b14/images/v1";
    const apiKey = "98bd7948f256ad2d86690ca3f9a402de75529";

    const file = await c.req.formData();
    const formDataToSend = new FormData();
    //@ts-ignore
    formDataToSend.append("file", file);

    const cloudflareResponse = await fetch(url, {
      method: "POST",
      headers: {
        "X-Auth-Email": "luisgarrido0987@gmail.com",
        "X-Auth-Key": apiKey,
      },
      body: file,
    });
    const responseBody = (await cloudflareResponse.json()) as any;

    try {
      const src = `https://api.ismac.dev/v1/images/${responseBody.result.id}`;
      const re = {
        imageId: responseBody.result.id,
        name: responseBody.result.filename,
        uri: src,
      };

      const prisma = await d1Client(c);
      await prisma.image.create({
        data: { ...re, userId, size: Number(size), type },
      });

      //@ts-ignore
      return c.json({ ...re });
    } catch (error) {
      c.status(400);
      return c.json({ status: false, message: "Cloudfalre error" });
    }
  } catch (error) {
    console.log(error);
    c.status(400);
    return c.json({ status: false });
  }
});

images.delete("/v1/images/:id", async (c) => {
  const id = c.req.param("id");
  const url = `https://api.cloudflare.com/client/v4/accounts/48f505082d6f5aaf4510b5b995a42b14/images/v1/${id}`;
  const apiKey = "fd0vQ4kjYfvaoRgShEevoWUhR2BQ4l8oUXZfrx7T";
  const headers = {
    Authorization: `Bearer ${apiKey}`,
  };

  const cloudflareResponse = await fetch(url, {
    method: "DELETE",
    headers: headers,
  });
  if (cloudflareResponse.ok) {
    c.status(200);
    return c.json({ status: true });
  } else {
    c.status(400);
    return c.json({ status: false });
  }
});
images.get("/v1/images/:id/:type", (c) => {
  const accountHash = "Z6uUFT3xWbycdRxHWf6QLQ";
  const id = c.req.param("id");
  const type = c.req.param("type");
  const queries = c.req.queries();
  const que = new URLSearchParams(queries as any);
  return fetch(
    `https://wsrv.nl/?url=https://imagedelivery.net/${accountHash}/${id}/${type}&${que}`
  );
});
images.get("/v1/images/galery/:type", async (c) => {
  const { userId } = getDataEnv(c);
  const type = c.req.param("type");
  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  const images = await prisma.image.findMany({
    where: {
      userId,
      type,
    },
  });
  return c.json(images);
});

export default images;
