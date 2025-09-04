import app from "./app";

Bun.serve({
  fetch: app.fetch,
});

console.log("Server started on http://localhost:3000");
