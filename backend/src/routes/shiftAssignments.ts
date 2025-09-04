import { Hono } from "hono";
import { auth, requireRole } from "../middlewares/auth";
import * as service from "../services/assignments";

export const shiftAssignmentsRouter = new Hono();

shiftAssignmentsRouter.post("/", auth, requireRole("head_nurse"), async (c) => {
  try {
    const body = (await c.req.json()) as {
      user_id?: string;
      shift_id?: number;
    };
    if (!body?.user_id || typeof body.shift_id !== "number") {
      return c.json({ message: "user_id and shift_id are required" }, 400);
    }
    const created = await service.createAssignment(body.user_id, body.shift_id);
    return c.json(created, 201);
  } catch (err) {
    return c.json(
      {
        error: {
          code: "ASSIGN_SHIFT_FAILED",
          message:
            err instanceof Error ? err.message : "Failed to assign shift",
        },
      },
      500
    );
  }
});

export default shiftAssignmentsRouter;
