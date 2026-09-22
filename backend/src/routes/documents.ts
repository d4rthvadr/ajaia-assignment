import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.use(requireAuth);

// Tracer bullet: create/get/save a single document. List + sharing land in Phase 2.
router.post("/", async (req, res) => {
  const title = typeof req.body?.title === "string" && req.body.title.trim() ? req.body.title : "Untitled document";
  const document = await prisma.document.create({
    data: { ownerId: req.userId!, title },
  });
  res.status(201).json({ document });
});

router.get("/:id", async (req, res) => {
  const document = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!document) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  if (document.ownerId !== req.userId) {
    res.status(403).json({ error: "You do not have access to this document" });
    return;
  }
  res.status(200).json({ document: { ...document, access: "owner" } });
});

router.put("/:id", async (req, res) => {
  const { content } = req.body ?? {};
  if (typeof content !== "string") {
    res.status(400).json({ error: "content is required" });
    return;
  }

  const existing = await prisma.document.findUnique({ where: { id: req.params.id } });
  if (!existing) {
    res.status(404).json({ error: "Document not found" });
    return;
  }
  if (existing.ownerId !== req.userId) {
    res.status(403).json({ error: "You do not have access to this document" });
    return;
  }

  // Last-write-wins: overwrite and bump version, no conflict check (ADR-0001).
  const document = await prisma.document.update({
    where: { id: req.params.id },
    data: { content, version: { increment: 1 } },
  });
  res.status(200).json({ document });
});

export default router;
