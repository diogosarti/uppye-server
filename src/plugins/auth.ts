import fp from "fastify-plugin";
import type { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";

interface JWTPayload {
  sub: string;
}

export type LoggedUser = {
  id: string;
  email: string;
  role: string;
};

declare module "fastify" {
  interface FastifyRequest {
    user?: LoggedUser;
  }
}

export const authPlugin = fp(async function (app: FastifyInstance) {
  app.addHook("onRequest", async (request, reply) => {
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return;

    const token = authHeader.replace("Bearer ", "");

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, payload.sub))
        .limit(1);

      if (user) {
        request.user = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
      }
    } catch {
      // token inválido → ignora
    }
  });
});
