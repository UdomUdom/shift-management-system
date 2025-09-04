import { Hono } from "hono";
import { ShiftSchema, ShiftType } from "../db/models/shifts";
import { auth, requireRole } from "../middlewares/auth";
import * as service from "../services/shifts";

export const shiftRouter = new Hono();

shiftRouter.get("/", async (c) => {
  const shifts = await service.getShifts();
  return c.json(shifts);
});

// protect create shift: head nurse only
shiftRouter.post("/", auth, requireRole("head_nurse"), async (c) => {
  const body = await c.req.json();
  const result = ShiftSchema.safeParse(body);
  if (!result.success) {
    return c.json({ error: result.error }, 400);
  }
  const shift: ShiftType = result.data;
  const created = await service.createShift(shift);
  return c.json({ message: "Shift created", shift: created }, 201);
});

export default shiftRouter;
