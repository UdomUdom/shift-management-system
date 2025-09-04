CREATE TYPE "user_role" AS ENUM (
  'nurse',
  'head_nurse'
);

CREATE TYPE "leave_status" AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "name" varchar(255) UNIQUE NOT NULL,
  "email" varchar(255) UNIQUE NOT NULL,
  "password" varchar(255) NOT NULL,
  "role" user_role,
  "created_at" timestamp
);

CREATE TABLE "shifts" (
  "id" integer PRIMARY KEY,
  "date" date,
  "start_time" timestamp,
  "end_time" timestamp
);

CREATE TABLE "shift_assignments" (
  "id" integer PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "shift_id" integer NOT NULL
);

CREATE TABLE "leave_requests" (
  "id" integer PRIMARY KEY,
  "shift_assignment_id" integer NOT NULL,
  "reason" varchar(255),
  "status" leave_status,
  "approved_by" uuid NOT NULL,
  "created_at" timestamp
);

ALTER TABLE "shift_assignments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "shift_assignments" ADD FOREIGN KEY ("shift_id") REFERENCES "shifts" ("id");

ALTER TABLE "leave_requests" ADD FOREIGN KEY ("shift_assignment_id") REFERENCES "shift_assignments" ("id");

ALTER TABLE "leave_requests" ADD FOREIGN KEY ("approved_by") REFERENCES "users" ("id");
