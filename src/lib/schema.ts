import "dotenv/config";
import {
  pgTable,
  text,
  varchar,
  timestamp,
  integer,
  boolean,
  primaryKey,
} from "drizzle-orm/pg-core";
import { createId } from "@paralleldrive/cuid2";

// USERS
export const users = pgTable("users", {
  id: varchar("id", { length: 24 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash"),
  avatarUrl: text("avatar_url"),
  role: varchar("role", { length: 50 }).notNull().default("student"), // admin | institution_user  | teacher | student
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdateFn(() => new Date()),
});

// ACCOUNTS
export const accounts = pgTable("accounts", {
  id: varchar("id", { length: 24 })
    .primaryKey()
    .$defaultFn(() => createId()),
  userId: varchar("user_id", { length: 24 })
    .notNull()
    .references(() => users.id),
  provider: varchar("provider", { length: 50 }).notNull(),
  providerAccountId: varchar("provider_account_id", { length: 255 }).notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
});

// INSTITUTIONS
export const institutions = pgTable("institutions", {
  id: varchar("id", { length: 24 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  planType: varchar("plan_type", { length: 50 }).default("pay-per-class"),
  activeUntil: timestamp("active_until", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// TEACHERS_INSTITUTIONS
export const teachersInstitutions = pgTable(
  "teachers_institutions",
  {
    teacherId: varchar("teacher_id", { length: 24 })
      .notNull()
      .references(() => users.id),
    institutionId: varchar("institution_id", { length: 24 })
      .notNull()
      .references(() => institutions.id),
  },
  (t) => [primaryKey({ columns: [t.teacherId, t.institutionId] })]
);

// CLASSROOMS
export const classrooms = pgTable("classrooms", {
  id: varchar("id", { length: 24 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 255 }).notNull(),
  institutionId: varchar("institution_id", { length: 24 }).references(
    () => institutions.id
  ),
  createdBy: varchar("created_by", { length: 24 })
    .notNull()
    .references(() => users.id),
  billingOwnerType: varchar("billing_owner_type", { length: 20 }).notNull(), // 'institution' ou 'teacher'
  billingOwnerId: varchar("billing_owner_id", { length: 24 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// CLASSROOM_TEACHERS
export const classroomTeachers = pgTable(
  "classroom_teachers",
  {
    classroomId: varchar("classroom_id", { length: 24 })
      .notNull()
      .references(() => classrooms.id),
    teacherId: varchar("teacher_id", { length: 24 })
      .notNull()
      .references(() => users.id),
  },
  (t) => [primaryKey({ columns: [t.classroomId, t.teacherId] })]
);

// CLASSROOM_STUDENTS
export const classroomStudents = pgTable(
  "classroom_students",
  {
    classroomId: varchar("classroom_id", { length: 24 })
      .notNull()
      .references(() => classrooms.id),
    studentId: varchar("student_id", { length: 24 })
      .notNull()
      .references(() => users.id),
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (t) => [primaryKey({ columns: [t.classroomId, t.studentId] })]
);

// INSTITUTION_USERS
export const institutionUsers = pgTable(
  "institution_users",
  {
    userId: varchar("user_id", { length: 24 })
      .notNull()
      .references(() => users.id),
    institutionId: varchar("institution_id", { length: 24 })
      .notNull()
      .references(() => institutions.id),
    role: varchar("role", { length: 50 }).notNull(), // ex: 'admin', 'finance', 'secretary'
  },
  (t) => [primaryKey({ columns: [t.userId, t.institutionId] })]
);
