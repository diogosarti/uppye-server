import type { FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";
import { users } from "@/lib/schema"; // ou onde estiver sua tabela
import { eq } from "drizzle-orm";

// declare a forma do payload no token
interface JWTPayload {
  sub: string; // user id
}

// esse é o tipo de usuário retornado
export type LoggedUser = {
  id: string;
  email: string;
  role: string;
};

export async function getLoggedUser(
  request: FastifyRequest
): Promise<LoggedUser | null> {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.replace("Bearer ", "");

  let decoded: JWTPayload;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }

  const [user] = await db.select().from(users).where(eq(users.id, decoded.sub));

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}
