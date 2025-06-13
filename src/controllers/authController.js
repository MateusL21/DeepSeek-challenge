// src/controllers/authController.js
import { PrismaClient } from "@prisma/client";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { generateToken } from "../utils/token.js";

const prisma = new PrismaClient();

export const register = async (req, res, next) => {
  console.log("Recebida requisição de registro", req.body);

  try {
    const { name, email, password } = req.body;

    // Validação básica
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Nome, email e senha são obrigatórios",
        details: {
          missing_fields: { name: !name, email: !email, password: !password },
        },
      });
    }

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("Usuário já existe:", email);
      return res.status(409).json({
        error: "Usuário já cadastrado",
        suggestion: "Tente fazer login ou use outro email",
      });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Criar novo usuário
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: { id: true, name: true, email: true },
    });

    console.log("Usuário registrado com sucesso:", newUser.email);

    // Gerar token JWT
    const token = generateToken(newUser);

    res.status(201).json({
      user: newUser,
      token,
      message: "Registro realizado com sucesso!",
    });
  } catch (err) {
    console.error("Erro no registro:", {
      error: err,
      body: req.body,
      stack: err.stack,
    });

    res.status(500).json({
      error: "Erro interno no servidor",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: err.message,
              stack: err.stack,
            }
          : undefined,
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validação básica
    if (!email || !password) {
      return res.status(400).json({
        error: "Email e senha são obrigatórios",
        details: {
          missing_fields: { email: !email, password: !password },
        },
      });
    }

    console.log("Tentativa de login para:", email);
    // Buscar usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, password: true },
    });

    // Verificar se usuário existe e senha está correta
    if (!user || !(await comparePassword(password, user.password))) {
      console.log("Credenciais inválidas para:", email);
      return res.status(401).json({
        error: "Credenciais inválidas",
        suggestion: "Verifique seu email e senha",
      });
    }

    // Gerar token JWT (removendo a senha do objeto user)
    const { password: _, ...userWithoutPassword } = user;
    const token = generateToken(userWithoutPassword);

    console.log("Login bem-sucedido para:", user.email);

    res.status(200).json({
      user: userWithoutPassword,
      token,
      message: "Login realizado com sucesso!",
    });
  } catch (err) {
    console.error("Erro no login:", {
      error: err,
      body: req.body,
      stack: err.stack,
    });

    res.status(500).json({
      error: "Erro interno no servidor",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: err.message,
              stack: err.stack,
            }
          : undefined,
    });
  }
};

export const me = async (req, res) => {
  try {
    // O middleware de autenticação já adicionou o usuário no req.user
    if (!req.user) {
      return res.status(401).json({
        error: "Não autorizado",
        details: "Token inválido ou expirado",
      });
    }

    console.log("Acesso aos dados do usuário:", req.user.id);

    // Buscar informações atualizadas do usuário
    const currentUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    if (!currentUser) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    res.status(200).json({
      user: currentUser,
      message: "Dados do usuário recuperados com sucesso",
    });
  } catch (err) {
    console.error("Erro ao buscar dados do usuário:", {
      error: err,
      user: req.user,
      stack: err.stack,
    });

    res.status(500).json({
      error: "Erro interno no servidor",
      details:
        process.env.NODE_ENV === "development"
          ? {
              message: err.message,
              stack: err.stack,
            }
          : undefined,
    });
  }
};
