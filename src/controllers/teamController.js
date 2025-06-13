// src/controllers/teamController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTeam = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id; // ID do usuário autenticado

    if (!name) {
      return res.status(400).json({ error: "Nome da equipe é obrigatório" });
    }

    const newTeam = await prisma.team.create({
      data: {
        name,
        createdBy: userId,
        members: {
          connect: { id: userId }, // Adiciona o criador como membro
        },
      },
      include: { members: true },
    });

    res.status(201).json({
      team: newTeam,
      message: "Equipe criada com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao criar equipe:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const listTeams = async (req, res) => {
  try {
    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: { id: req.user.id }, // Lista apenas equipes do usuário
        },
      },
      include: { members: true },
    });

    res.status(200).json(teams);
  } catch (err) {
    console.error("Erro ao listar equipes:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};
