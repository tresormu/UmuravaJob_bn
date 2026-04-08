// config/swagger.config.ts
import swaggerJsdoc from "swagger-jsdoc";

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
        url: "https://localhost:5000",
        description: "Production server",
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
  apis: ["./src/decorators/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;