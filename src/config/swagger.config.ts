// config/swagger.config.ts
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";
import config from "./env.config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Umurava AI Hackathon API Documentation",
      version: "1.0.0",
      description:
        "A complete REST API for a job screening-focused implementation",
    },
    servers: [
      {
        url: `http://localhost:${config.port}`,
        description: "Local development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/Decorators/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
