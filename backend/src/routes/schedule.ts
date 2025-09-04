import { Hono } from "hono";
import { auth, requireRole } from "../middlewares/auth";
import * as assignments from "../services/assignments";

const scheduleRouter = new Hono();

scheduleRouter.get("/", auth, requireRole("nurse"), async (c) => {
  const user = c.get("user");
  if (!user) return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  const rows = await assignments.getAssignmentsForUser(user.id);
  return c.json(rows);
});

export default scheduleRouter;
