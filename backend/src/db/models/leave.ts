import { z } from "zod";

export const LeaveSchema = z.object({
  shift_assignment_id: z.int(),
  reason: z.string().min(5).max(255),
  status: z.enum(["pending", "approved", "rejected"]),
  approved_by: z.string().nullable(),
});

export type LeaveType = z.infer<typeof LeaveSchema>;
