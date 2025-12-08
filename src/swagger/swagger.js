import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dharashiv Loksabha API Documentation",
      version: "1.0.0",
      description: "Official API documentation for Dharashiv Loksabha Project. \n\n**Authentication**: Most endpoints require a Bearer Token. Use `/api/auth/login` to get one.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {} // Will be populated by files
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    path.join(__dirname, "./routes/*.js"), // Scan local swagger definitions
    path.join(__dirname, "./components/schemas/*.js"),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerDocs = (app) => {
  // Setup Swagger UI
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customSiteTitle: "Dharashiv Loksabha API"
    })
  );

  console.log("Swagger Docs available at http://localhost:4000/api-docs");
};
