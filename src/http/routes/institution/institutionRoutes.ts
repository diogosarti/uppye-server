import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@/lib/db";
import { institutions, institutionUsers } from "@/lib/schema";
import { createId } from "@paralleldrive/cuid2";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { eq } from "drizzle-orm";
import { authorize } from "@/http/middlewares/authorize";
import { ConflictError } from "@/lib/errors";

export async function institutionRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/institutions", {
    schema: {
      tags: ["Institutions"],
      summary: "Cria uma nova instituição",
      security: [{ bearerAuth: [] }],
      body: z.object({
        name: z.string().min(1).describe("Nome da instituição"),
        email: z.string().email().describe("Email da instituição"),
      }),
      response: {
        201: z.object({ id: z.string().describe("ID da instituição criada") }),
        403: z.object({ statusCode: z.literal(403), message: z.string() }),
      },
    },
    preHandler: [authorize("create", "Institution")],
    handler: async (req, reply) => {
      const { name, email } = req.body;
      const user = req.user;

      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const [existing] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.email, email))
        .limit(1);

      if (existing) {
        throw new ConflictError("Já existe uma instituição com esse e-mail");
      }

      const id = createId();

      await db.transaction(async (tx) => {
        await tx.insert(institutions).values({ id, name, email });

        await tx.insert(institutionUsers).values({
          userId: user.id,
          institutionId: id,
          role: user.role,
        });
      });

      return reply.code(201).send({ id });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().get("/institutions/:id", {
    schema: {
      tags: ["Institutions"],
      summary: "Busca instituição por ID",
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().describe("ID da instituição"),
      }),
      response: {
        200: z.object({
          id: z.string(),
          name: z.string(),
          email: z.string().email(),
          planType: z.string().nullable(),
          activeUntil: z.date().nullable(),
        }),
        404: z.object({
          statusCode: z.literal(404),
          message: z.string(),
        }),
      },
    },
    preHandler: [authorize("read", "Institution")],
    handler: async (req, reply) => {
      const { id } = req.params;

      const [institution] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.id, id))
        .limit(1);

      if (!institution) {
        return reply.status(404).send({
          statusCode: 404,
          message: "Instituição não encontrada",
        });
      }

      return reply.send(institution);
    },
  });

  app.withTypeProvider<ZodTypeProvider>().delete("/institutions/:id", {
    schema: {
      tags: ["Institutions"],
      summary: "Deleta uma instituição pelo ID",
      security: [{ bearerAuth: [] }],
      params: z.object({
        id: z.string().describe("ID da instituição"),
      }),
      response: {
        204: z.null(),
        403: z.object({ statusCode: z.literal(403), message: z.string() }),
      },
    },
    preHandler: [authorize("delete", "Institution")],
    handler: async (req, reply) => {
      const { id } = req.params;

      await db.delete(institutions).where(eq(institutions.id, id));

      return reply.code(204).send();
    },
  });
}
