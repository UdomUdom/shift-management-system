import { Hono } from "hono";
import { LeaveSchema, LeaveType } from "../db/models/leave";

export const leaveRouter = new Hono();

leaveRouter.get("/", (c) => {
  return c.json({ message: "List of leaves" });
});

leaveRouter.post("/", async (c) => {
  const body = await c.req.json();
  const result = LeaveSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  const leave: LeaveType = result.data;
  return c.json({ message: "Leave created", leave });
});

export default leaveRouter;
