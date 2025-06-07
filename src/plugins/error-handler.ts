import { FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { AppError } from "@/lib/errors";

const errorHandler: FastifyPluginAsync = async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message,
        statusCode: error.statusCode,
      });
    }

    // Zod / validation errors
    if (Array.isArray(error.validation)) {
      return reply.status(422).send({
        message: "Erro de validação nos dados enviados",
        statusCode: 422,
        issues: error.validation,
      });
    }

    // fallback para erros desconhecidos
    request.log.error(error);
    return reply
      .status(500)
      .send({
        message: "Erro interno do servidor",
        statusCode: 500,
      });
  });
};

export default fp(errorHandler);
