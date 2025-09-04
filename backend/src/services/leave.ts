import { eq } from "drizzle-orm";
import db from "../db";
import * as table from "../db/schema/schema";
import { LeaveType } from "../db/models/leave";

export const getLeaves = async () => {
  const leaves = await db.query.leaveRequests.findMany({
    columns: {
      id: true,
      shiftAssignmentId: true,
      reason: true,
      status: true,
      approvedBy: true,
      createdAt: true,
    },
  });

  return leaves;
};

export const getLeaveById = async (id: number) => {
  const leave = await db.query.leaveRequests.findFirst({
    where: eq(table.leaveRequests.id, id),
  });

  return leave;
};

export const createLeave = async (leave: LeaveType) => {
  const formattedLeave = {
    shiftAssignmentId: leave.shift_assignment_id,
    reason: leave.reason,
    status: leave.status,
    approvedBy: leave.approved_by,
  };
  const newLeave = await db
    .insert(table.leaveRequests)
    .values(formattedLeave)
    .returning();
  return newLeave;
};

export const deleteLeave = async (id: number) => {
  const deletedLeave = await db
    .delete(table.leaveRequests)
    .where(eq(table.leaveRequests.id, id))
    .returning();
  return deletedLeave;
};
