import { authorize } from "@/http/middlewares/authorize";
import { db } from "@/lib/db";
import { UnauthorizedError } from "@/lib/errors";
import { users } from "@/lib/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

export async function userRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      preHandler: [authorize("read", "User")],
      schema: {
        tags: ["Users"],
        summary: "Listar todos os usuários",
        description: "Retorna todos os usuários cadastrados no sistema.",
        security: [{ bearerAuth: [] }],
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.string().nullable(),
              email: z.string().email(),
              role: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
          ),
          401: z.object({
            statusCode: z.literal(401),
            message: z.string({ message: "Usuário não autenticado" }),
          }),
          403: z.object({
            statusCode: z.literal(403),
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await db.select().from(users);
      return result;
    }
  );

  app.withTypeProvider<ZodTypeProvider>().get("/users/me", {
    schema: {
      tags: ["Users"],
      summary: "Obter o usuário autenticado",
      description:
        "Retorna os dados básicos do usuário autenticado com base no token JWT.",
      security: [{ bearerAuth: [] }],
      response: {
        200: z.object({
          id: z.string(),
          email: z.string().email(),
        }),
        401: z.object({
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const user = request.user;
      if (!user) {
        throw new UnauthorizedError("Usuário não autenticado");
      }

      return {
        id: user.id,
        email: user.email,
      };
    },
  });

  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/users",
      { schema: { tags: ["Users"], summary: "Criar novo usuário" } },
      async (request, reply) => {
        // Logic to create a new user
        return reply.code(201).send({ message: "User created" });
      }
    );

  app.withTypeProvider<ZodTypeProvider>().get(
    "/users/:id",
    {
      schema: {
        tags: ["Users"],
        summary: "Buscar usuário por ID",
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      // Logic to fetch a user by ID
      return { message: `User with ID ${id}` };
    }
  );

  app.withTypeProvider<ZodTypeProvider>().put(
    "/users/:id",
    {
      schema: {
        tags: ["Users"],
        summary: "Atualizar usuário por ID",
        params: z.object({ id: z.string() }),
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string };
      // Logic to update a user by ID
      return { message: `User with ID ${id} updated` };
    }
  );

  app
    .withTypeProvider<ZodTypeProvider>()
    .delete(
      "/users/:id",
      { schema: { tags: ["Users"] } },
      async (request, reply) => {
        const { id } = request.params as { id: string };
        // Logic to delete a user by ID
        return { message: `User with ID ${id} deleted` };
      }
    );
}
