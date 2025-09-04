import app from "./app";
import { env } from "./env";

const server = Bun.serve({
  port: env.PORT,
  fetch: app.fetch,
});

console.log(`Server started on http://localhost:${server.port}`);
