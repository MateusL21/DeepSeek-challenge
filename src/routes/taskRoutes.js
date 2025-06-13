// src/routes/taskRoutes.js
import express from "express";
import { listTasks, createTask } from "../controllers/taskController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:teamId/tasks", authenticate, listTasks); // GET /teams/:teamId/tasks (protegida)
router.post("/:teamId/tasks", authenticate, createTask); // POST /teams/:teamId/tasks (protegida)

export default router;
