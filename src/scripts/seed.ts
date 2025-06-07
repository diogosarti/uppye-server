import { faker } from "@faker-js/faker";
import { db } from "@/lib/db";
import {
  users,
  institutions,
  institutionUsers,
  teachersInstitutions,
  classrooms,
  classroomStudents,
  classroomTeachers,
} from "@/lib/schema";
import { createId } from "@paralleldrive/cuid2";
import bcrypt from 'bcryptjs';

async function seed() {
  console.log("🚀 Seeding database...");

  const password = "123456";
  const passwordHash = await bcrypt.hash(password, 6);
  // ADMIN USER
  const adminUser = {
    id: createId(),
    name: "Admin",
    email: "admin@uppye.com",
    passwordHash,
    role: "admin",
    avatarUrl: faker.image.avatar(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.insert(users).values(adminUser);

  // INSTITUTION
  const institution = {
    id: createId(),
    name: "Universidade Uppye",
    email: "contato@uppye.edu.br",
    planType: "pay-per-class",
    activeUntil: faker.date.future(),
    createdAt: new Date(),
  };

  await db.insert(institutions).values(institution);

  // INSTITUTION USERS
  const institutionUsersData = ["admin", "secretary", "finance"].map(
    (role) => ({
      userId: createId(),
      institutionId: institution.id,
      role,
    })
  );

  await db.insert(users).values(
    institutionUsersData.map((iu) => ({
      id: iu.userId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash,
      role: "institution_user",
      avatarUrl: faker.image.avatar(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );

  await db.insert(institutionUsers).values(institutionUsersData);

  // TEACHER LINKED TO INSTITUTION
  const linkedTeacherId = createId();
  await db.insert(users).values({
    id: linkedTeacherId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash,
    role: "teacher",
    avatarUrl: faker.image.avatar(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await db.insert(teachersInstitutions).values({
    teacherId: linkedTeacherId,
    institutionId: institution.id,
  });

  // TEACHER INDEPENDENT
  const soloTeacherId = createId();
  await db.insert(users).values({
    id: soloTeacherId,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash,
    role: "teacher",
    avatarUrl: faker.image.avatar(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // CLASSROOM
  const classroomId = createId();
  await db.insert(classrooms).values({
    id: classroomId,
    name: "Turma A",
    createdBy: linkedTeacherId,
    institutionId: institution.id,
    billingOwnerType: "institution",
    billingOwnerId: institution.id,
    createdAt: new Date(),
  });

  await db.insert(classroomTeachers).values({
    classroomId,
    teacherId: linkedTeacherId,
  });

  // STUDENTS
  const students = Array.from({ length: 5 }).map(() => ({
    id: createId(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    passwordHash,
    role: "student",
    avatarUrl: faker.image.avatar(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  await db.insert(users).values(students);

  await db.insert(classroomStudents).values(
    students.map((s) => ({
      classroomId,
      studentId: s.id,
      invitedAt: new Date(),
    }))
  );

  console.log("✅ Seed finalizado com sucesso.");
}

seed()
  .catch((err) => {
    console.error("❌ Seed falhou:", err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
