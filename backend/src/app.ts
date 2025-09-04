import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import routes from "./routes/index";

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
    "/api/shifts": {
      get: {
        summary: "Get all shifts",
        responses: {
          "200": {
            description: "List of shifts",
          },
        },
      },
      post: {
        summary: "Create a new shift",
        responses: {
          "201": {
            description: "Shift created",
          },
        },
      },
    },
    "/api/leave": {
      get: {
        summary: "Get all leave requests",
        responses: {
          "200": {
            description: "List of leave requests",
          },
        },
      },
      post: {
        summary: "Create a new leave request",
        responses: {
          "201": {
            description: "Leave request created",
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

app.route("/api", routes);

// Global error handling
app.onError((err, c) => {
  console.error(err);
  return c.json(
    {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: err instanceof Error ? err.message : "Unexpected error",
      },
    },
    500
  );
});

app.notFound((c) =>
  c.json(
    {
      error: { code: "NOT_FOUND", message: "Route not found" },
    },
    404
  )
);

export default app;
