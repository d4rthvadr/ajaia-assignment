import { Router } from "express";
import {
  createDocumentBodySchema,
  saveDocumentBodySchema,
  shareDocumentBodySchema,
} from "../lib/schemas";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";
import { validateBody } from "../middleware/validateBody";

const router = Router();

router.use(requireAuth);

router.get("/", async (req, res) => {
  const documents = await prisma.document.findMany({
    where: { ownerId: req.userId! },
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
  res.status(200).json({ documents });
});

router.post(
  "/",
  validateBody(createDocumentBodySchema, "title must be a string"),
  async (req, res) => {
    const title = req.body.title?.trim() || "Untitled document";
    const document = await prisma.document.create({
      data: { ownerId: req.userId!, title },
    });
    res.status(201).json({ document });
  },
);

router.get("/shared-with-me", async (req, res) => {
  const grants = await prisma.documentAccess.findMany({
    where: { userId: req.userId! },
    select: {
      document: { select: { id: true, title: true, updatedAt: true } },
    },
    orderBy: { document: { updatedAt: "desc" } },
  });
  res.status(200).json({
    documents: grants.map(({ document }) => ({
      ...document,
      access: "shared" as const,
    })),
  });
});

router.post(
  "/:id/share",
  validateBody(shareDocumentBodySchema, "email is required"),
  async (req, res) => {
    const documentId = req.params.id as string;
    const { email } = req.body;
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    if (document.ownerId !== req.userId) {
      res
        .status(403)
        .json({ error: "You do not have access to this document" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim() },
    });
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    if (user.id === req.userId) {
      res
        .status(400)
        .json({ error: "You cannot share a document with its owner" });
      return;
    }

    const existingGrant = await prisma.documentAccess.findUnique({
      where: {
        documentId_userId: { documentId: document.id, userId: user.id },
      },
    });
    if (existingGrant) {
      res
        .status(400)
        .json({ error: "Document is already shared with this user" });
      return;
    }

    const grant = await prisma.documentAccess.create({
      data: { documentId: document.id, userId: user.id },
    });
    res.status(201).json({ grant });
  },
);

router.get("/:id/shares", async (req, res) => {
  const documentId = req.params.id as string;
  const document = await prisma.document.findUnique({
    where: { id: documentId },
  });
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  if (document.ownerId !== req.userId) {
    res.status(403).json({ error: "You do not have access to this document" });
    return;
  }

  const grants = await prisma.documentAccess.findMany({
    where: { documentId: document.id },
    select: { user: { select: { id: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  res.status(200).json({ users: grants.map(({ user }) => user) });
});

router.get("/:id", async (req, res) => {
  const documentId = req.params.id as string;
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      OR: [
        { ownerId: req.userId! },
        { sharedWith: { some: { userId: req.userId! } } },
      ],
    },
  });
  if (!document) {
    const exists = await prisma.document.findUnique({
      where: { id: documentId },
      select: { id: true },
    });
    res.status(exists ? 403 : 404).json({
      error: exists
        ? "You do not have access to this document"
        : "Document not found",
    });
    return;
  }
  const access = document.ownerId === req.userId ? "owner" : "shared";
  res.status(200).json({ document: { ...document, access } });
});

router.put(
  "/:id",
  validateBody(saveDocumentBodySchema, "content is required"),
  async (req, res) => {
    const { content } = req.body;
    const documentId = req.params.id as string;
    const existing = await prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!existing) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    if (existing.ownerId !== req.userId) {
      res
        .status(403)
        .json({ error: "You do not have access to this document" });
      return;
    }

    // Last-write-wins: overwrite and bump version, no conflict check (ADR-0001).
    const document = await prisma.document.update({
      where: { id: documentId },
      data: { content, version: { increment: 1 } },
    });
    res.status(200).json({ document });
  },
);

export default router;
