import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import routes from "./routes/index";
import { param } from "drizzle-orm";

const openApiDoc = {
  openapi: "3.0.0", // This is the required version field
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "API documentation for your service",
  },
  paths: {
    // Add your API paths here
    "/health": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK",
          },
        },
      },
    },
    "/api/users": {
      get: {
        summary: "Get all users",
        responses: {
          "200": {
            description: "List of users",
          },
        },
      },
      post: {
        summary: "Create a new user",
        responses: {
          "201": {
            description: "User created",
          },
        },
      },
    },

    // Add more endpoints as needed
  },
};

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, World!");
});

app.get("/doc", (c) => c.json(openApiDoc));

app.get("/swagger", swaggerUI({ url: "/doc" }));

export default app;
