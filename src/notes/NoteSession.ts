// src/note-session.ts
import type { Note } from "@prisma/client";
import { d1Client } from "../../baas";

export class NoteSession {
  state: DurableObjectState;
  env: Env;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const { socket, response } = new WebSocketPair();
    const [client, server] = Object.values(socket);

    let buffer: Partial<Note> = {};

    server.accept();

    server.addEventListener("message", async (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data);
        if (data.noteId) {
          buffer = { ...buffer, ...data };
        }
      } catch (err) {
        console.error("Invalid message:", err);
      }
    });

    server.addEventListener("close", async () => {
      if (buffer?.noteId) {
        const DB = this.env.DB as D1Database;
        const prisma = await d1Client(DB);
        const { noteId, ...data } = buffer;
        await prisma.note.update({
          where: { noteId },
          data,
        });
      }
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }
}
