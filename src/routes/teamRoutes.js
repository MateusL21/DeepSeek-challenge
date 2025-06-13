// src/routes/teamRoutes.js
import express from "express";
import { listTeams, createTeam } from "../controllers/teamController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, listTeams); // GET /teams (protegida)
router.post("/", authenticate, createTeam); // POST /teams (protegida)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    await prisma.team.delete({
      where: { id: req.params.id, createdBy: req.user.id },
    });
    res.json({ message: "Time excluído com sucesso" });
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir time" });
  }
});

export default router;
