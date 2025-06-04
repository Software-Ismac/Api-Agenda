import { createMiddleware } from "hono/factory";
import { envMiddleware } from "./envMiddleware";
import { authProvider } from "./authProvider";
import { authMiddleware } from "../auth/middlewareAuth";

export const openbaas = createMiddleware(async (c, next) => {
  // Primero, ejecuta el middleware de configuración de variables
  await envMiddleware(c, async () => {
    // Luego, ejecuta el middleware de autenticación
    await authProvider(c, async () => {
      // Finalmente, ejecuta el middleware de autenticación adicional (authMiddleware)
      await authMiddleware(c, next);
    });
  });
});
