import { Hono } from "hono";
import { userRouter } from "./users";
import shiftRouter from "./shifts";
import leaveRouter from "./leave";

export default new Hono()
  .route("/users", userRouter)
  .route("/shifts", shiftRouter)
  .route("/leave", leaveRouter);
