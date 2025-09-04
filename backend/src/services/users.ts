import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import db from "../db";
import * as table from "../db/schema/schema";
import { UserType } from "../db/models/users";

export const getUsers = async () => {
  const users = await db.query.users.findMany({
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });

  return users;
};

export const getUserByEmail = async (email: string) => {
  const user = await db.query.users.findFirst({
    where: eq(table.users.email, email),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

export const getUserWithPasswordByEmail = async (email: string) => {
  const user = await db.query.users.findFirst({
    where: eq(table.users.email, email),
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      password: true,
    },
  });
  return user;
};

export const createUser = async (user: UserType) => {
  const hashed = await bcrypt.hash(user.password, 10);
  const newUser = await db
    .insert(table.users)
    .values({ ...user, password: hashed })
    .returning();
  return newUser;
};

export const deleteUser = async (email: string) => {
  const deletedUser = await db
    .delete(table.users)
    .where(eq(table.users.email, email))
    .returning();
  return deletedUser;
};

export const updateUser = async (email: string, user: Partial<UserType>) => {
  const data: Partial<UserType> = { ...user };
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  const updatedUser = await db
    .update(table.users)
    .set(data)
    .where(eq(table.users.email, email))
    .returning();
  return updatedUser;
};
