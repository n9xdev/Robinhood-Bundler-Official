import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
import type { IncomingMessage, ServerResponse } from "node:http";
import react from "@vitejs/plugin-react";
import { defineConfig, type Connect } from "vite";

function downloadsNoSpaFallback() {
  const handle: Connect.NextHandleFunction = (
    req: IncomingMessage,
    res: ServerResponse,
    next: Connect.NextFunction,
  ) => {
    const path = req.url?.split("?")[0] ?? "";
    if (!path.startsWith("/downloads/") || path === "/downloads/") {
      next();
      return;
    }
    const file = join(process.cwd(), "public", path);
    if (!existsSync(file) || !statSync(file).isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain; charset=utf-8");
      res.end("Not found");
      return;
    }
    next();
  };

  return {
    name: "downloads-no-spa-fallback",
    configureServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handle);
    },
    configurePreviewServer(server: { middlewares: Connect.Server }) {
      server.middlewares.use(handle);
    },
  };
}

export default defineConfig({
  plugins: [react(), downloadsNoSpaFallback()],
});
