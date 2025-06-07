import "dotenv/config";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";
import { routes } from "./routes";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import caslPlugin from "@/plugins/casl";

const app = Fastify({
  logger: true,
});
app.register(caslPlugin);

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.register(fastifySwagger, {
  openapi: {
    info: { title: "Uppye API Documentation", version: "1.0.0" },
  },
});
app.register(fastifySwaggerUi, {
  routePrefix: "/docs",
});

app.register(routes, { prefix: "/api/v1" });

app.listen({ port: 3000 }, () => {
  app.log.info("Server is running on http://localhost:3000");
});
