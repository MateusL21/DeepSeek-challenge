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
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "../public", "index.html"));
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
