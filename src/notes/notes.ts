import { Hono } from "hono";
import { getDataEnv, prismaClients } from "../../baas";
import { Bindings } from "..";

const notes = new Hono<{ Bindings: Bindings }>();
notes.post("/v1/notes", async (c) => {
  const body = await c.req.json();
  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);

  const res = await prisma.note.create({ data: body });
  return c.json(res, 201);
});
notes.get("/v1/notes/share", async (c) => {
  const { userId } = getDataEnv(c);
  try {
    const DB = (await c.env.DB) as D1Database;
    const prisma = await prismaClients.fetch(DB);
    const sharedNotes = await prisma.note.findMany({
      where: {
        share: {
          some: { userId },
        },
      },
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    return c.json(sharedNotes);
  } catch (err) {
    console.error("Error fetching shared notes:", err);
    return c.json({ error: "Error fetching shared notes" }, 500);
  }
});
notes.get("/v1/notes", async (c) => {
  const DB = (await c.env.DB) as D1Database;
  const { userId } = await getDataEnv(c);
  const prisma = await prismaClients.fetch(DB);
  const notes = await prisma.note.findMany({
    where: {
      userId,
    },
  });
  return c.json(notes);
});

notes.put("/v1/notes", async (c) => {
  const body = await c.req.json();
  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  const { noteId, ...res } = body;
  const note = await prisma.note.update({
    where: {
      noteId,
    },
    data: res,
  });
  return c.json(note, 201);
});
notes.delete("/v1/notes/:noteId", async (c) => {
  const noteId = await c.req.param("noteId");
  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  await prisma.note.delete({
    where: {
      noteId,
    },
  });
  return c.json({});
});
notes.post("/v1/notes/:noteId/share", async (c) => {
  const noteId = await c.req.param("noteId");
  const { userId } = getDataEnv(c);
  const DB = (await c.env.DB) as D1Database;
  const prisma = await prismaClients.fetch(DB);
  await prisma.share.create({
    data: {
      userId,
      noteId,
    },
  });
  return c.json({});
});
export { notes };
