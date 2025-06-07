import { FastifyInstance } from "fastify";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "@/lib/jwt";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { UnauthorizedError } from "@/lib/errors";

export async function authRoutes(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post("/auth/login", {
    schema: {
      tags: ["Auth"],
      summary: "Realiza login com email e senha",
      description:
        "Retorna accessToken e refreshToken caso as credenciais estejam corretas.",
      body: z.object({
        email: z.string().email().describe("E-mail do usuário"),
        password: z.string().min(6).describe("Senha (mínimo 6 caracteres)"),
      }),
      response: {
        200: z.object({
          accessToken: z.string().describe("JWT de acesso"),
          refreshToken: z.string().describe("JWT de atualização"),
        }),
        401: z.object({
          statusCode: z.literal(401),
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { email, password } = request.body;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new UnauthorizedError("Credenciais inválidas");
      }

      if (!user.passwordHash) {
        throw new UnauthorizedError(
          "Você utilizou um login social, por favor, utilize o botão de login social"
        );
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        throw new UnauthorizedError("Credenciais inválidas");
      }

      const accessToken = generateAccessToken(user.id);
      const refreshToken = generateRefreshToken(user.id);

      return reply.send({ accessToken, refreshToken });
    },
  });

  app.withTypeProvider<ZodTypeProvider>().post("/auth/refresh", {
    schema: {
      tags: ["Auth"],
      summary: "Renova o token de acesso",
      description:
        "Recebe um refresh token válido e retorna um novo access token.",
      body: z.object({
        refreshToken: z
          .string()
          .describe("JWT de atualização emitido anteriormente"),
      }),
      response: {
        200: z.object({
          accessToken: z.string().describe("Novo JWT de acesso"),
        }),
        401: z.object({
          statusCode: z.literal(401),
          message: z.string(),
        }),
      },
    },
    handler: async (request, reply) => {
      const { refreshToken } = request.body;

      try {
        const payload = verifyRefreshToken(refreshToken) as { sub: string };
        const accessToken = generateAccessToken(payload.sub);
        return reply.send({ accessToken });
      } catch {
        throw new UnauthorizedError("Refresh token inválido ou expirado");
      }
    },
  });
}
