import type { AppAbility } from "@/lib/casl/abilities";
import type { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyRequest {
    ability: AppAbility;
  }
}

const caslPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest("ability", undefined as unknown as AppAbility);
};

export default fp(caslPlugin);
