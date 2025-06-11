import express from "express";
const router = express.Router();

// Suas rotas aqui
router.get("/", (req, res) => {
  res.json({ message: "Task routes working" });
});

export default router;
