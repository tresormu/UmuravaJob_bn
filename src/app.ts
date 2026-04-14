import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import config from "./config/env.config.js";
import ApplicantsRoutes from "./Routes/Applicant.route.js";
import RecruitersRoutes from "./Routes/Recruiter.route.js"
import errorMiddleware from "./Middlewares/error.middleware.js";
import Jobrouter from "./Routes/Job.routes.js";
import ApplicationRoutes from "./Routes/Application.route.js";
import QuestionRoutes from "./Routes/Question.route.js";

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(helmet());
app.use(morgan("combined"));

app.use(
  cors({
    origin: config.corsOrigins ?? true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  }),
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Increased for testing and general use
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Product API Docs",
}));

app.use("/api/applicants", authLimiter, ApplicantsRoutes);
app.use("/api/recruiters", authLimiter, RecruitersRoutes);
app.use("/api/jobs", authLimiter, Jobrouter);
app.use("/api", authLimiter, QuestionRoutes);
app.use("/api", authLimiter, ApplicationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorMiddleware);

export default app;
