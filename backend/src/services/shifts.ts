import { eq } from "drizzle-orm";
import db from "../db";
import * as table from "../db/schema/schema";
import { ShiftType } from "../db/models/shifts";

export const getShifts = async () => {
  const shifts = await db.query.shifts.findMany({
    columns: {
      id: true,
      date: true,
      startTime: true,
      endTime: true,
    },
  });

  return shifts;
};

export const getShiftById = async (id: number) => {
  const shift = await db.query.shifts.findFirst({
    where: eq(table.shifts.id, id),
  });

  return shift;
};

export const createShift = async (shift: ShiftType) => {
  const shiftToInsert = {
    ...shift,
    date:
      typeof shift.date === "object" && shift.date instanceof Date
        ? shift.date.toISOString().split("T")[0]
        : shift.date,
  };
  const newShift = await db
    .insert(table.shifts)
    .values(shiftToInsert)
    .returning();
  return newShift;
};

export const deleteShift = async (id: number) => {
  const deletedShift = await db
    .delete(table.shifts)
    .where(eq(table.shifts.id, id))
    .returning();
  return deletedShift;
};

export const updateShift = async (id: number, shift: Partial<ShiftType>) => {
  const shiftToUpdate = {
    ...shift,
    date:
      typeof shift.date === "object" && shift.date instanceof Date
        ? shift.date.toISOString().split("T")[0]
        : shift.date,
  };
  const updatedShift = await db
    .update(table.shifts)
    .set(shiftToUpdate)
    .where(eq(table.shifts.id, id))
    .returning();
  return updatedShift;
};
