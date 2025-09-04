import { Hono } from "hono";
import { userRouter } from "./users";
import shiftRouter from "./shifts";
import leaveRouter from "./leave";
import authRouter from "./auth";
import leaveRequestsRouter from "./leaveRequests";
import shiftAssignmentsRouter from "./shiftAssignments";
import scheduleRouter from "./schedule";

export default new Hono()
  .route("/users", userRouter)
  .route("/auth", authRouter)
  .route("/shifts", shiftRouter)
  .route("/shift-assignments", shiftAssignmentsRouter)
  .route("/my-schedule", scheduleRouter)
  // legacy path kept for compatibility
  .route("/leave", leaveRouter)
  // spec-compliant path
  .route("/leave-requests", leaveRequestsRouter);
