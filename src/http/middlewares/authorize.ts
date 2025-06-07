import type { FastifyRequest, FastifyReply } from "fastify";
import {
  defineAbilityFor,
  type Actions,
  type Subjects,
} from "@/lib/casl/abilities";
import { getLoggedUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { institutionUsers, teachersInstitutions } from "@/lib/schema";
import { eq } from "drizzle-orm";

// função utilitária de cota de professor (implante como quiser)
async function checkTeacherQuota(userId: string): Promise<boolean> {
  // lógica fictícia — substitua pelo real
  const classroomsCount = await db
    .select()
    .from(teachersInstitutions)
    .where(eq(teachersInstitutions.teacherId, userId));
  return classroomsCount.length < 1; // limite de 1 turma se for individual
}

export function authorize(action: Actions, subject: Subjects) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = await getLoggedUser(request);

    if (!user) {
      return reply.code(401).send({ message: "Unauthorized" });
    }

    let institutionRole: "admin" | "secretary" | "finance" | undefined;

    if (user.role === "institution_user") {
      const [instUser] = await db
        .select()
        .from(institutionUsers)
        .where(eq(institutionUsers.userId, user.id))
        .limit(1);

      institutionRole = instUser?.role as typeof institutionRole;
    }

    const isLinkedToInstitution =
      user.role === "teacher"
        ? await db
            .select()
            .from(teachersInstitutions)
            .where(eq(teachersInstitutions.teacherId, user.id))
            .limit(1)
            .then(([r]) => !!r)
        : false;

    const ability = defineAbilityFor({
      role: user.role as "student" | "admin" | "institution_user" | "teacher",
      institutionRole,
      isLinkedToInstitution,
      canCreateMoreClassrooms:
        user.role === "teacher" ? await checkTeacherQuota(user.id) : false,
    });

    if (!ability.can(action, subject)) {
      return reply.code(403).send({ message: "Forbidden" });
    }

    request.ability = ability;
  };
}
