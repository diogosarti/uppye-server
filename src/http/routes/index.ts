import type { FastifyInstance } from "fastify";
import { userRoutes } from "./user/userRoutes";
import { authRoutes } from "./auth/authRoutes";

export async function routes(app: FastifyInstance) {
  await userRoutes(app);
  await authRoutes(app);
}
