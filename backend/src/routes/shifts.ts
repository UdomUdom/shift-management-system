import { Hono } from "hono";
import { ShiftSchema, ShiftType } from "../db/models/shifts";

export const shiftRouter = new Hono();

shiftRouter.get("/", (c) => {
  return c.json({ message: "List of shifts" });
});

shiftRouter.post("/", async (c) => {
  const body = await c.req.json();
  const result = ShiftSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  const shift: ShiftType = result.data;
  return c.json({ message: "Shift created", shift });
});

export default shiftRouter;
