import { z } from "zod";

export const ShiftSchema = z.object({
  date: z.coerce.date({ message: "invalid date" }),
  start_time: z.string().datetime({ message: "invalid date" }),
  end_time: z.string().datetime({ message: "invalid date" }),
});

export type ShiftType = z.infer<typeof ShiftSchema>;
