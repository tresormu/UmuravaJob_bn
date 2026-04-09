// config/swagger.config.ts
import swaggerJsdoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..", "..");
const port = process.env.PORT || "5000";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Umurava API Documentation",
      version: "1.0.0",
      description:
        "A complete REST API for a job screening-focused implementation",
    },
    servers: [
      {
        url: `http://localhost:${port}`,
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
  apis: [
    path.join(rootDir, "src", "Decorators", "*.ts").replace(/\\/g, "/"),
    path.join(rootDir, "dist", "Decorators", "*.js").replace(/\\/g, "/"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
