import { Hono } from "hono";
import { swaggerUI } from "@hono/swagger-ui";
import routes from "./routes/index";

const openApiDoc = {
  openapi: "3.0.0",
  info: {
    title: "API Documentation",
    version: "1.0.0",
    description: "API documentation for your service",
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string" },
              message: { type: "string" },
            },
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          name: { type: "string" },
          email: { type: "string", format: "email" },
          role: { type: "string", enum: ["nurse", "head_nurse"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      UserCreate: {
        type: "object",
        required: ["name", "email", "password", "role"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          role: { type: "string", enum: ["nurse", "head_nurse"] },
        },
      },
      UserUpdate: {
        type: "object",
        properties: {
          name: { type: "string" },
          password: { type: "string", minLength: 8 },
          role: { type: "string", enum: ["nurse", "head_nurse"] },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      LoginResponse: {
        type: "object",
        properties: {
          token: { type: "string" },
          user: { $ref: "#/components/schemas/User" },
        },
      },
      Shift: {
        type: "object",
        properties: {
          date: { type: "string", format: "date" },
          start_time: { type: "string", format: "date-time" },
          end_time: { type: "string", format: "date-time" },
        },
      },
      Leave: {
        type: "object",
        properties: {
          shift_assignment_id: { type: "integer" },
          reason: { type: "string" },
          status: { type: "string", enum: ["pending", "approved", "rejected"] },
          approved_by: { type: "string", nullable: true },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/users": {
      post: {
        summary: "Create a new user (sign up)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreate" },
            },
          },
        },
        responses: {
          "201": { description: "User created", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "400": { description: "Invalid payload", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
          "500": { description: "Server error", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
      get: {
        summary: "Get all users",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": {
            description: "List of users",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/User" } } } },
          },
          "401": { description: "Unauthorized" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/login": {
      post: {
        summary: "Login and receive JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          "200": { description: "Login success", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
          "400": { description: "Invalid payload" },
          "401": { description: "Invalid credentials" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/users/{email}": {
      parameters: [
        {
          name: "email",
          in: "path",
          required: true,
          schema: { type: "string", format: "email" },
        },
      ],
      get: {
        summary: "Get user by email",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": { description: "User", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
      put: {
        summary: "Update user by email",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/UserUpdate" } } },
        },
        responses: {
          "200": { description: "Updated user(s)" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
      delete: {
        summary: "Delete user by email",
        security: [{ BearerAuth: [] }],
        responses: {
          "200": { description: "Deleted user(s)" },
          "401": { description: "Unauthorized" },
          "404": { description: "Not found" },
          "500": { description: "Server error" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserCreate" },
            },
          },
        },
        responses: { "201": { description: "User created" } },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login and receive JWT",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginRequest" } } },
        },
        responses: {
          "200": { description: "Login success", content: { "application/json": { schema: { $ref: "#/components/schemas/LoginResponse" } } } },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/api/shifts": {
      get: {
        summary: "Get all shifts",
        responses: { "200": { description: "List of shifts" } },
      },
      post: {
        summary: "Create a new shift (head nurse)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Shift" } } },
        },
        responses: { "201": { description: "Shift created" }, "403": { description: "Forbidden" }, "401": { description: "Unauthorized" } },
      },
    },
    "/api/shift-assignments": {
      post: {
        summary: "Assign shift to nurse (head nurse)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { user_id: { type: "string", format: "uuid" }, shift_id: { type: "integer" } },
                required: ["user_id", "shift_id"],
              },
            },
          },
        },
        responses: { "201": { description: "Assignment created" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } },
      },
    },
    "/api/my-schedule": {
      get: {
        summary: "Get my schedule (nurse)",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "Schedule list" }, "401": { description: "Unauthorized" } },
      },
    },
    "/api/leave-requests": {
      get: {
        summary: "Get all leave requests (head nurse)",
        security: [{ BearerAuth: [] }],
        responses: { "200": { description: "List of leave requests" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } },
      },
      post: {
        summary: "Create a new leave request (nurse)",
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Leave" } } },
        },
        responses: { "201": { description: "Leave request created" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } },
      },
    },
    "/api/leave-requests/{id}/approve": {
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "integer" } },
      ],
      patch: {
        summary: "Approve or reject a leave request (head nurse)",
        security: [{ BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", enum: ["approved", "rejected"] } }, required: ["status"] } } } },
        responses: { "200": { description: "Updated leave request" }, "401": { description: "Unauthorized" }, "403": { description: "Forbidden" } },
      },
    },
  },
};

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello, World!");
});

// Health check endpoint (actual route)
app.get("/health", (c) => c.text("ok"));

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
