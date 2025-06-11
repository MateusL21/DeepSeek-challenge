import express from "express";
const router = express.Router();

// Suas rotas aqui
router.get("/", (req, res) => {
  res.json({ message: "Team routes working" });
});

export default router;
