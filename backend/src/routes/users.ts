import { Hono } from "hono";
import { UserSchema, UserType } from "../db/models/users";
import * as service from "../services/users";
import { auth, signToken } from "../middlewares/auth";

export const userRouter = new Hono();

// Public: Sign up
userRouter.post("/", async (c) => {
  try {
    const body = await c.req.json();
    const parsed = UserSchema.safeParse(body);
    if (!parsed.success) {
      return c.json(
        { message: "Invalid user payload", issues: parsed.error.issues },
        400
      );
    }
    const newUser = await service.createUser(parsed.data);
    return c.json(newUser, 201);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "CREATE_USER_FAILED",
          message: err instanceof Error ? err.message : "Failed to create user",
        },
      },
      500
    );
  }
});

// Public: Login -> returns JWT
userRouter.post("/login", async (c) => {
  try {
    const body = (await c.req.json()) as { email?: string; password?: string };
    if (!body?.email || !body?.password) {
      return c.json({ message: "email and password are required" }, 400);
    }
    const user = await service.getUserWithPasswordByEmail(body.email);
    if (!user) return c.json({ message: "Invalid credentials" }, 401);
    const ok = await (await import("bcrypt")).default.compare(
      body.password,
      user.password!
    );
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

// Protect the routes below with JWT
userRouter.use("/*", auth);

userRouter.get("/", async (c) => {
  try {
    const users = await service.getUsers();
    return c.json(users);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "LIST_USERS_FAILED",
          message: err instanceof Error ? err.message : "Failed to list users",
        },
      },
      500
    );
  }
});

// moved above as public route

userRouter.get("/:email", async (c) => {
  try {
    const { email } = c.req.param();
    const user = await service.getUserByEmail(email);
    if (!user) {
      return c.json({ message: "User not found" }, 404);
    }
    return c.json(user);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "GET_USER_FAILED",
          message: err instanceof Error ? err.message : "Failed to get user",
        },
      },
      500
    );
  }
});

userRouter.put("/:email", async (c) => {
  try {
    const { email } = c.req.param();
    const userUpdates = (await c.req.json()) as Partial<UserType>;
    const updatedUser = await service.updateUser(email, userUpdates);
    if (updatedUser.length === 0) {
      return c.json({ message: "User not found" }, 404);
    }
    return c.json(updatedUser);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "UPDATE_USER_FAILED",
          message: err instanceof Error ? err.message : "Failed to update user",
        },
      },
      500
    );
  }
});

userRouter.delete("/:email", async (c) => {
  try {
    const { email } = c.req.param();
    const deletedUser = await service.deleteUser(email);
    if (deletedUser.length === 0) {
      return c.json({ message: "User not found" }, 404);
    }
    return c.json(deletedUser);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "DELETE_USER_FAILED",
          message: err instanceof Error ? err.message : "Failed to delete user",
        },
      },
      500
    );
  }
});
