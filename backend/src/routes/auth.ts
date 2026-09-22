import bcrypt from "bcrypt";
import { Router } from "express";
import { prisma } from "../lib/prisma";
import { SESSION_COOKIE_NAME, signSession } from "../lib/jwt";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";
import { loginBodySchema, signupBodySchema } from "../lib/schemas";

const router = Router();

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

router.post(
  "/signup",
  validateBody(signupBodySchema, "email and a password of at least 8 characters are required"),
  async (req, res) => {
  const { email, password } = req.body;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    res.status(400).json({ error: "An account with that email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  const token = signSession({ userId: user.id });
  res.cookie(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(201).json({ user: { id: user.id, email: user.email } });
  },
);

router.post(
  "/login",
  validateBody(loginBodySchema, "email and password are required"),
  async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = signSession({ userId: user.id });
  res.cookie(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);
  res.status(200).json({ user: { id: user.id, email: user.email } });
  },
);

router.post("/logout", requireAuth, (_req, res) => {
  res.clearCookie(SESSION_COOKIE_NAME);
  res.status(204).send();
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } });
  if (!user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }
  res.status(200).json({ user: { id: user.id, email: user.email } });
});

export default router;
