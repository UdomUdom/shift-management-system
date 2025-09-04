import { eq } from "drizzle-orm";
import db from "../db";
import * as table from "../db/schema/schema";

export const createAssignment = async (userId: string, shiftId: number) => {
  const row = await db
    .insert(table.shiftAssignments)
    .values({ userId, shiftId })
    .returning();
  return row;
};

export const getAssignmentsForUser = async (userId: string) => {
  const rows = await db
    .select({
      assignmentId: table.shiftAssignments.id,
      shiftId: table.shiftAssignments.shiftId,
      date: table.shifts.date,
      startTime: table.shifts.startTime,
      endTime: table.shifts.endTime,
    })
    .from(table.shiftAssignments)
    .leftJoin(
      table.shifts,
      eq(table.shiftAssignments.shiftId, table.shifts.id)
    )
    .where(eq(table.shiftAssignments.userId, userId));
  return rows;
};
