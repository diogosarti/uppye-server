
import { FastifyInstance } from "fastify";
import { db } from "@/lib/db";
import { userTokens } from "@/lib/schema";
import { lt } from "drizzle-orm";

export async function cleanExpiredTokens(app: FastifyInstance) {
  app.addHook("onReady", async () => {
    // roda a cada 12h (em produção use cron via lib tipo node-cron para mais controle)
    setInterval(async () => {
      const now = new Date();
      await db.delete(userTokens).where(lt(userTokens.expiresAt, now));
      app.log.info("Tokens expirados limpos");
    }, 1000 * 60 * 60 * 12); // 12 horas
  });
}
