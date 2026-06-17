import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
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
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
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
      { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      consultancy: user.consultancy
        ? { id: user.consultancy.id, name: user.consultancy.name, plan: user.consultancy.plan }
        : null,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /forgot-password — gera token e (em prod) envia e-mail. Resposta neutra (não revela e-mail).
router.post('/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      res.status(400).json({ error: 'Email é obrigatório' });
      return;
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt: new Date(Date.now() + 60 * 60 * 1000) },
      });
      const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      // TODO produção: enviar e-mail. Sem SMTP, registra no log do servidor.
      console.log(`[reset-senha] ${email}: ${link}`);
    }
    res.json({ message: 'Se o e-mail existir, enviaremos as instruções de redefinição.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /reset-password — troca a senha usando token válido
router.post('/reset-password', async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body || {};
    if (!token || !password || String(password).length < 8) {
      res.status(400).json({ error: 'Token e nova senha (mín. 8 caracteres) são obrigatórios' });
      return;
    }
    const prt = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!prt || prt.usedAt || prt.expiresAt < new Date()) {
      res.status(400).json({ error: 'Link inválido ou expirado.' });
      return;
    }
    await prisma.user.update({
      where: { id: prt.userId },
      data: { password: await bcrypt.hash(password, 10) },
    });
    await prisma.passwordResetToken.update({ where: { id: prt.id }, data: { usedAt: new Date() } });
    res.json({ message: 'Senha redefinida com sucesso.' });
  } catch (error) {
    console.error('Reset password error:', error);
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
      consultancy: user.consultancy
        ? {
            id: user.consultancy.id,
            name: user.consultancy.name,
            plan: user.consultancy.plan,
            logoUrl: user.consultancy.logoUrl,
            primaryColor: user.consultancy.primaryColor,
          }
        : null,
    });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
