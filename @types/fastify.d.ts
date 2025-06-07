import type { AppAbility } from '@/lib/casl/abilities';
import 'fastify'

declare module "fastify" {
  interface FastifyInstance {
    config: EnvSchema;
  }
}
