import { Hono } from "hono";
import { cors } from "hono/cors";
import { sendEmail } from "../services/sendEmail";
import {
  authMiddleware,
  authProvider,
  d1Client,
  envMiddleware,
  getDataEnv,
} from "../baas";
import images from "./images/images";
import { ismac } from "./ai/Ismac";
import album from "./album/album";
import admin from "./admin/admin";
import { prismaClients } from "../baas";
import { createWorkersAI } from "workers-ai-provider";
import { streamText } from "ai";
import { notes } from "./notes/notes";
import { authenticator, totp } from "otplib";
import TOPT from "./topt";
import { calendar } from "../baas/calendar";

export type Bindings = {
  AI: Ai;
  DB: D1Database;
  "2fa": KVNamespace;
  R2: R2Bucket;
  ALBUM_DO: any;
  NOTE_SESSION: DurableObjectNamespace;
};

const app = new Hono<{ Bindings: Bindings }>();
const KV_NAME = "adminIsmac";
app.use(cors());
app.get("/v1/images/:id", (c) => {
  const accountHash = "Z6uUFT3xWbycdRxHWf6QLQ";
  const id = c.req.param("id");
  const queries = c.req.queries();
  const que = new URLSearchParams(queries as any);
  return fetch(
    `https://wsrv.nl/?url=https://imagedelivery.net/${accountHash}/${id}/public&${que}`
  );
});
app.get("/v1/images", (c) => {
  const queries = c.req.queries();
  const que = new URLSearchParams(queries as any);
  return fetch(`https://wsrv.nl?${que}`);
});
app.get("/v1/data", async (c) => {
  const cupons = await c.env["2fa"].get(`${KV_NAME}:cupons`);
  // const response = await fetch(
  //   "https://calendarioacademico-production.up.railway.app"
  // );
  // const html = await response?.text();
  // // Extraemos los datos usando regex
  // const regex = /window\.eventosData\s*=\s*(\[.*?\]);/s;
  // const match = html?.match(regex);

  // if (match && match[1]) {
  //   const eventosData = JSON.parse(match[1]);

  //   return c.json({
  //     cupons: cupons ?? "[]",
  //     calendar:
  //       JSON.stringify(
  //         eventosData.map((c: any) => {
  //           return {
  //             date: c.start,
  //             description: c.title,
  //           };
  //         })
  //       ) ?? "[]",
  //   });
  // }
  return c.json({
    cupons: cupons ?? "[]",
    calendar: JSON.stringify(calendar),
  });
});
app.get("/v1/dev/images", async (c) => {
  const queries = c.req.queries();
  const que = new URLSearchParams({ ...queries } as any);
  const response = await fetch(`https://wsrv.nl/?${que}`);
  return new Response(response.body, response);
});
app.route("/", TOPT);

app.use("/v1/auth/magic-link", async (c, next) => {
  
  //@ts-ignore
  c.set("sendNotifications", sendEmail, c.var.TOKEN);
  await next();
});

app.use(envMiddleware);
app.use(authProvider);
app.use("*", authMiddleware);

app.post("/v1/users", async (c) => {
  const { email, userId } = getDataEnv(c);
  const prisma = await d1Client(c);
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      galery: {},
    },
  });
  console.log(user);
  if (!user) {
    try {
      const body = (await c.req.json()) ?? {};
      await prisma.user.create({
        data: { ...body, userId, email, created: new Date() },
      });
      return c.json({ ...body, userId, email }, 201);
    } catch (error) {
      c.status(404);
      return c.json({ staus: false }, 404);
    }
  }
  return c.json(user, 200);
});
app.put("/v1/users", async (c) => {
  try {
    const { userId } = getDataEnv(c);
    const DB = (await c.env.DB) as D1Database;
    const prisma = await prismaClients.fetch(DB);
    const body = await c.req.json();

    const updatedUser = await prisma.user.update({
      where: { userId },
      data: { ...(body ?? {}) },
    });

    return c.json(updatedUser, 200);
  } catch (error) {
    return c.json({ error: "Failed to update user" }, 400);
  }
});
app.route("/", notes);

app.post("/v1/ai/text", async (c) => {
  const { messages } = await c.req.json();
  if (!messages) {
    c.status(404);
    c.json({ status: false });
  }
  const workersai = createWorkersAI({ binding: c.env.AI });
  const result = await streamText({
    model: workersai("@cf/meta/llama-3.3-70b-instruct-fp8-fast"),
    messages,
  });
  return result.toTextStreamResponse({
    headers: {
      "Content-Type": "text/x-unknown",
      "content-encoding": "identity",
      "transfer-encoding": "chunked",
    },
  });
});
app.post("/v1/ai/ismac", async (c) => {
  const { messages } = await c.req.json();
  if (!messages) {
    c.status(404);
    c.json({ status: false });
  }
  const messagesPrompt = [
    {
      role: "system",
      content: `
        Ten encuenta que solo puedes responder con una sola palabra de acuerdo con el contexto que entiendas al usuario en base a este informacion
        Responde de la siguiente manera:  
        - Información sobre visión, misión, objetivos, etc. → 'proposito'  
        - Preguntas sobre eventos,consultas sobre fechas o planificación → 'eventos'
        - Cupones → 'cupones' 
      `,
    },

    ...messages,
  ];

  const stream = await c.env.AI.run(
    "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    {
      messages: messagesPrompt,
    }
  );

  //@ts-ignore
  return await ismac(c, messages, stream?.response);
});
app.post("/v1/ai/images", async (c) => {
  try {
    const { prompt } = await c.req.json();

    if (!prompt) {
      c.status(404);
      c.json({ status: false });
    }
    const { AI } = c.env;
    const response = await AI.run("@cf/black-forest-labs/flux-1-schnell", {
      prompt,
    });

    return new Response(`data:image/jpeg;base64,${response.image}`, {
      headers: {
        "Content-Type": "image/jpeg",
      },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
});

app.route("/", images);
app.route("/", album);
app.route("/", admin);
export default app;
