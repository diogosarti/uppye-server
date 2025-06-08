import type { FastifyInstance } from "fastify";
import { userRoutes } from "./user/userRoutes";
import { authRoutes } from "./auth/authRoutes";
import { institutionRoutes } from "./institution/institutionRoutes";

export async function routes(app: FastifyInstance) {
  await userRoutes(app);
  await authRoutes(app);
  await institutionRoutes(app);
}
