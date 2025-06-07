import type { FastifyInstance } from "fastify";
import { userRoutes } from "./user/userRoutes";

export async function routes(app: FastifyInstance) {
  await userRoutes(app);
}
