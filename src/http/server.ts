import "dotenv/config";
import Fastify from "fastify";
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { routes } from "./routes";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import caslPlugin from "@/plugins/casl";
import errorHandler from "@/plugins/error-handler";
import { cleanExpiredTokens } from "@/plugins/clean-expired-tokens";
import { authPlugin } from "@/plugins/auth";

const app = Fastify({
  logger: true,
});

app.register(authPlugin);

app.register(caslPlugin);
app.register(errorHandler);
app.register(cleanExpiredTokens);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Uppye API Documentation",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform,
});

app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(routes, { prefix: "/api/v1" });

app.listen({ port: 3000 }, () => {
  app.log.info("Server is running on http://localhost:3000");
});
