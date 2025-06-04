import { createMiddleware } from "hono/factory";
import { googleProvider } from "./authProvider/googleProvider";
import {
  magicLinkProviderPost,
  magicLinkProviderPut,
} from "./authProvider/magicLinkProvider";
import { logoutAllSesion, refreshToken } from "./authProvider/refreshToken";
const routeHandlers = {
  "/v1/auth/google": {
    POST: googleProvider,
  },
  "/v1/auth/magic-link": {
    POST: magicLinkProviderPost,
    PUT: magicLinkProviderPut,
  },
  "/v1/auth/refresh-token": {
    POST: refreshToken,
  },
  "v1/sesions/logoutAllSessions": {
    POST: logoutAllSesion,
  },
};

export const authProvider = createMiddleware(async (c, next) => {
  const path = c.req.path;
  const method = c.req.method;

  //@ts-ignore
  const handlers = routeHandlers[path];
  if (!handlers) {
    return await next();
  }
  //@ts-ignore
  const handler = handlers[method];
  if (!handler) {
    return await next();
  }
  return await handler(c);
});
