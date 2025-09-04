import { Hono } from "hono";
import { userRouter } from "./users";

export default new Hono().route("/", userRouter);
