import { Hono } from "hono";
import { Bindings } from "..";

const admin = new Hono<{ Bindings: Bindings }>();
const KV_NAME = "adminIsmac";

// Obtener datos de un admin
admin.get("/v1/admin/:id", async (c) => {
  const id = c.req.param("id");
  const admin = await c.env["2fa"].get(`${KV_NAME}:${id}`);
  if (!admin) {
    return c.text("Not Found", 404);
  }
  return c.json({ admin }, 202);
});

// Crear nuevo admin
admin.post("/v1/admin", async (c) => {
  const body = await c.req.json();
  if (!body.id) {
    return c.text("Bad Request: Missing 'id'", 400);
  }
  await c.env["2fa"].put(`${KV_NAME}:${body.id}`, body.id);
  return c.text("Admin inserted successfully", 201);
});

// Guardar datos estructurados
admin.post("/v1/data", async (c) => {
  const body = await c.req.json();

  if (!body.cupon || !body.ai) {
    return c.text("Bad Request: Missing fields", 400);
  }

  await Promise.all([
    c.env["2fa"].put(`${KV_NAME}:cupons`, body.cupon),
    c.env["2fa"].put(`${KV_NAME}:ai`, body.ai),
  ]);

  return c.text("Data saved successfully", 201);
});

export default admin;
