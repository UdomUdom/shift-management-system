import { Hono } from "hono";
import { UserType } from "../db/models/users";
import * as service from "../services/users";

export const userRouter = new Hono();

userRouter.get("/", async (c) => {
  const users = await service.getUsers();
  return c.json(users);
});

userRouter.post("/", async (c) => {
  const user = (await c.req.json()) as UserType;
  const newUser = await service.createUser(user);
  return c.json(newUser);
});

userRouter.get("/:email", async (c) => {
  const { email } = c.req.param();
  const user = await service.getUserByEmail(email);
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json(user);
});

userRouter.put("/:email", async (c) => {
  const { email } = c.req.param();
  const userUpdates = (await c.req.json()) as Partial<UserType>;
  const updatedUser = await service.updateUser(email, userUpdates);
  if (updatedUser.length === 0) {
    return c.json({ message: "User not found" });
  }
  return c.json(updatedUser);
});

userRouter.delete("/:email", async (c) => {
  const { email } = c.req.param();
  const deletedUser = await service.deleteUser(email);
  if (deletedUser.length === 0) {
    return c.json({ message: "User not found" });
  }
  return c.json(deletedUser);
});
