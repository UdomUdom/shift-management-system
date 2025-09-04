import { createMiddleware } from "hono/factory";
import { verify, sign } from "hono/jwt";
import { env } from "../env";

export type JwtUser = { id: string; role: "nurse" | "head_nurse" };

declare module "hono" {
  interface ContextVariableMap {
    user: JwtUser | null;
  }
}

export const auth = createMiddleware(async (c, next) => {
  const header = c.req.header("authorization");
  if (!header?.startsWith("Bearer "))
    return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  const token = header.slice(7);
  try {
    const payload = await verify(token, env.JWT_SECRET);
    c.set("user", payload as JwtUser);
    await next();
  } catch {
    return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
  }
});

export const requireRole = (role: JwtUser["role"]) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");
    if (!user) return c.json({ error: { code: "UNAUTHORIZED" } }, 401);
    if (user.role !== role)
      return c.json({ error: { code: "FORBIDDEN" } }, 403);
    await next();
  });

export const signToken = (u: JwtUser): Promise<string> => {
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    ...u,
    exp: now + 24 * 60 * 60,
  };
  return sign(payload, env.JWT_SECRET, "HS256");
};
