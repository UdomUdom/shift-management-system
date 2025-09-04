import { Hono } from "hono";
import * as service from "../services/users";
import { UserSchema } from "../db/models/users";
import { signToken } from "../middlewares/auth";

export const authRouter = new Hono();

authRouter.post("/register", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = UserSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { message: "Invalid user payload", issues: parsed.error.issues },
        400
      );
    }
    const created = await service.createUser(parsed.data);
    return c.json(created, 201);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "REGISTER_FAILED",
          message: err instanceof Error ? err.message : "Failed to register",
        },
      },
      500
    );
  }
});

authRouter.post("/login", async (c) => {
  try {
    const body = (await c.req.json()) as { email?: string; password?: string };
    if (!body?.email || !body?.password) {
      return c.json({ message: "email and password are required" }, 400);
    }
    const user = await service.getUserWithPasswordByEmail(body.email);
    if (!user) return c.json({ message: "Invalid credentials" }, 401);
    const ok = await (
      await import("bcrypt")
    ).default.compare(body.password, user.password!);
    if (!ok) return c.json({ message: "Invalid credentials" }, 401);
    const token = await signToken({ id: user.id, role: user.role });
    const { password, ...rest } = user as any;
    return c.json({ token, user: rest });
  } catch (err) {
    return c.json(
      {
        error: {
          code: "LOGIN_FAILED",
          message: err instanceof Error ? err.message : "Failed to login",
        },
      },
      500
    );
  }
});

export default authRouter;
