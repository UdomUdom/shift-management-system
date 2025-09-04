import { z } from "zod";
import { strongPasswordSchema } from "../../utils/strongpassword";

export const UserSchema = z.object({
  name: z.string().min(1, "more than 1 character"),
  email: z.string().email("invalid email address"),
  password: strongPasswordSchema,
  role: z.enum(["nurse", "head_nurse"], {
    message: 'role is required and must be either "nurse" or "head_nurse"',
  }),
});

export type UserType = z.infer<typeof UserSchema>;
