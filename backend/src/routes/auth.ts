import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config';
import { startTrial } from '../services/billing';
import rateLimit from 'express-rate-limit';

const router = Router();

// Anti brute-force: máx 10 tentativas de login por IP a cada 15 min
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
});

// POST /register
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, consultancyName, cnpj } = req.body;

    if (!email || !password || !name || !consultancyName) {
      res.status(400).json({ error: 'Campos obrigatórios: email, password, name, consultancyName' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email já cadastrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const consultancy = await prisma.consultancy.create({
      data: {
        name: consultancyName,
        cnpj: cnpj || null,
        plan: 'STARTER',
      },
    });

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CONSULTANCY_ADMIN',
        consultancyId: consultancy.id,
      },
    });

    // Novo tenant começa com período de teste
    await startTrial(consultancy.id, 'STARTER');

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        consultancyId: consultancy.id,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      consultancy: {
        id: consultancy.id,
        name: consultancy.name,
        plan: consultancy.plan,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /login
router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email e senha são obrigatórios' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { consultancy: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        consultancyId: user.consultancyId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      consultancy: {
        id: user.consultancy.id,
        name: user.consultancy.name,
        plan: user.consultancy.plan,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// GET /me
router.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { consultancy: true },
    });

    if (!user) {
      res.status(404).json({ error: 'Usuário não encontrado' });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      consultancy: {
        id: user.consultancy.id,
        name: user.consultancy.name,
        plan: user.consultancy.plan,
        logoUrl: user.consultancy.logoUrl,
        primaryColor: user.consultancy.primaryColor,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
