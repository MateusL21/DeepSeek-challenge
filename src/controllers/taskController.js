// src/controllers/taskController.js
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createTask = async (req, res) => {
  try {
    const { teamId } = req.params;
    const { title, description } = req.body;
    const userId = req.user.id;

    // Verifica se o usuário é membro da equipe
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: { some: { id: userId } },
      },
    });

    if (!team) {
      return res
        .status(403)
        .json({ error: "Acesso negado ou equipe não encontrada" });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description,
        teamId,
        createdBy: userId,
      },
    });

    res.status(201).json({
      task: newTask,
      message: "Tarefa criada com sucesso!",
    });
  } catch (err) {
    console.error("Erro ao criar tarefa:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};

export const listTasks = async (req, res) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    // Verifica se o usuário é membro da equipe
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        members: { some: { id: userId } },
      },
    });

    if (!team) {
      return res
        .status(403)
        .json({ error: "Acesso negado ou equipe não encontrada" });
    }

    const tasks = await prisma.task.findMany({
      where: { teamId },
    });

    res.status(200).json(tasks);
  } catch (err) {
    console.error("Erro ao listar tarefas:", err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
};
