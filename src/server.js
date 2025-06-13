import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import logger from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 5000;

    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddlewares() {
    // Security
    this.app.use(helmet());
    this.app.use(
      cors({
        origin: process.env.CLIENT_URL || "http://localhost:3000",
      })
    );

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    });
    this.app.use(limiter);

    // Static files and body parsing
    this.app.use(express.json());
    this.app.use(express.static(path.join(__dirname, "../public")));
  }

  initializeRoutes() {
    // API Routes
    this.app.use("/auth", authRoutes);
    this.app.use("/teams", teamRoutes);
    this.app.use("/tasks", taskRoutes);

    // Frontend route
    // Adicione esta rota
    this.app.get("/", (req, res) => {
      // Se for uma requisição API, retorne JSON
      if (
        req.headers.accept &&
        req.headers.accept.includes("application/json")
      ) {
        return res.json({
          status: "online",
          endpoints: {
            auth: ["POST /auth/register", "POST /auth/login"],
            teams: ["GET /teams", "POST /teams"],
            tasks: ["GET /teams/:teamId/tasks", "POST /teams/:teamId/tasks"],
          },
        });
      }

      // Caso contrário, sirva o frontend
      res.sendFile(path.join(__dirname, "../public", "index.html"));
    });

    // Adicione isso após as rotas
    this.app.use((err, req, res, next) => {
      logger.error("Erro não tratado:", {
        error: err,
        body: req.body,
        url: req.originalUrl,
        stack: err.stack,
      });

      res.status(500).json({
        error: "Erro interno no servidor",
        requestId: req.id, // Adicione um request ID se estiver usando
        ...(process.env.NODE_ENV === "development" && {
          message: err.message,
          stack: err.stack,
        }),
      });
    });
  }

  initializeErrorHandling() {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
  }

  start() {
    this.app.listen(this.port, "0.0.0.0", () => {
      logger.info(`🚀 Server running on port ${this.port}`);
      logger.info(`🔗 Access: http://localhost:${this.port}`);
    });
  }
}

const server = new Server();
server.start();
