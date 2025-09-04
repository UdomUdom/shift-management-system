import { Hono } from "hono";
import { LeaveSchema } from "../db/models/leave";
import { auth, requireRole } from "../middlewares/auth";
import * as service from "../services/leave";

const leaveRequestsRouter = new Hono();

leaveRequestsRouter.get("/", auth, requireRole("head_nurse"), async (c) => {
  const leaves = await service.getLeaves();
  return c.json(leaves);
});

leaveRequestsRouter.post("/", auth, requireRole("nurse"), async (c) => {
  const body = await c.req.json();
  const parsed = LeaveSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: parsed.error }, 400);
  const created = await service.createLeave(parsed.data);
  return c.json(created, 201);
});

leaveRequestsRouter.patch(
  "/:id/approve",
  auth,
  requireRole("head_nurse"),
  async (c) => {
    const { id } = c.req.param();
    const body = (await c.req.json()) as { status?: "approved" | "rejected" };
    if (!body?.status || !["approved", "rejected"].includes(body.status)) {
      return c.json(
        { message: "status must be 'approved' or 'rejected'" },
        400
      );
    }
    const head = c.get("user");
    const updated = await service.updateLeaveStatus(
      Number(id),
      body.status!,
      head!.id
    );
    return c.json(updated);
  }
);

export default leaveRequestsRouter;
