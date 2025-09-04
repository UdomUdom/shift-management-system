import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  date,
  pgSchema,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["nurse", "head_nurse"]);
export const leaveStatus = pgEnum("leave_status", [
  "pending",
  "approved",
  "rejected",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: userRole("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const shifts = pgTable("shifts", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  date: date("date"),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
});

export const shiftAssignments = pgTable(
  "shift_assignments",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    shiftId: integer("shift_id")
      .notNull()
      .references(() => shifts.id, { onDelete: "cascade" }),
  },
  (t) => ({
    userShiftUnique: { unique: [t.userId, t.shiftId] } as const, // ป้องกันซ้ำ
  })
);

export const leaveRequests = pgTable("leave_requests", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  shiftAssignmentId: integer("shift_assignment_id")
    .notNull()
    .references(() => shiftAssignments.id, { onDelete: "cascade" }),
  reason: varchar("reason", { length: 255 }),
  status: leaveStatus("status").default("pending").notNull(),
  approvedBy: uuid("approved_by").references(() => users.id), // nullable ตอน pending
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
