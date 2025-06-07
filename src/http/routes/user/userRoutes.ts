import { authorize } from "@/http/middlewares/authorize";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

export async function userRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    "/users",
    {
      preHandler: [authorize('read', "all")],
      schema: {
        tags: ["Users"],
        summary: "Return all Users",
        description: "This route returns all users",
      },
    },
    async (request, reply) => {
      const result = await db.select().from(users);
      return result;
    }
  );

  app
    .withTypeProvider<ZodTypeProvider>()
    .post("/users", { schema: { tags: ["Users"] } }, async (request, reply) => {
      // Logic to create a new user
      return { message: "User created" };
    });

  app
    .withTypeProvider<ZodTypeProvider>()
    .get(
      "/users/:id",
      { schema: { tags: ["Users"] } },
      async (request, reply) => {
        const { id } = request.params as { id: string };
        // Logic to fetch a user by ID
        return { message: `User with ID ${id}` };
      }
    );

  app
    .withTypeProvider<ZodTypeProvider>()
    .put(
      "/users/:id",
      { schema: { tags: ["Users"] } },
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
