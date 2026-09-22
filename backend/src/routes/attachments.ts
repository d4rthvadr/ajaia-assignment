import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
const uploadsDirectory = path.resolve(process.cwd(), "uploads");
const allowedMimeTypes = new Map([
  [".txt", new Set(["text/plain"])],
  [".md", new Set(["text/markdown", "text/plain"])],
]);

router.use(requireAuth);

async function findDocumentAccess(documentId: string, userId: string) {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return null;
  if (document.ownerId === userId) return { document, access: "owner" as const };

  const grant = await prisma.documentAccess.findUnique({
    where: { documentId_userId: { documentId, userId } },
  });
  return grant ? { document, access: "shared" as const } : null;
}

function validateFile(file: Express.Multer.File | undefined) {
  if (!file) return "file is required";
  const extension = path.extname(file.originalname).toLowerCase();
  const mimeTypes = allowedMimeTypes.get(extension);
  if (!mimeTypes || !mimeTypes.has(file.mimetype)) {
    return "only .txt and .md files with a matching MIME type are allowed";
  }
  return null;
}

router.post("/:documentId/attachments", upload.single("file"), async (req, res) => {
  const documentId = req.params.documentId as string;
  const access = await findDocumentAccess(documentId, req.userId!);
  if (!access) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    res.status(document ? 403 : 404).json({ error: document ? "You do not have access to this document" : "Document not found" });
    return;
  }
  if (access.access !== "owner") {
    res.status(403).json({ error: "Only the document owner can upload attachments" });
    return;
  }

  const fileError = validateFile(req.file);
  if (fileError) {
    res.status(400).json({ error: fileError });
    return;
  }

  const file = req.file!;
  const extension = path.extname(file.originalname).toLowerCase();
  const storedPath = path.join("uploads", `${randomUUID()}${extension}`);
  await mkdir(uploadsDirectory, { recursive: true });
  await writeFile(path.resolve(process.cwd(), storedPath), file.buffer);

  const attachment = await prisma.attachment.create({
    data: {
      documentId,
      filename: file.originalname,
      storedPath,
      mimeType: file.mimetype,
      size: file.size,
    },
  });
  res.status(201).json({ attachment });
});

router.get("/:documentId/attachments", async (req, res) => {
  const documentId = req.params.documentId as string;
  const access = await findDocumentAccess(documentId, req.userId!);
  if (!access) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    res.status(document ? 403 : 404).json({ error: document ? "You do not have access to this document" : "Document not found" });
    return;
  }

  const attachments = await prisma.attachment.findMany({
    where: { documentId },
    orderBy: { createdAt: "desc" },
  });
  res.status(200).json({ attachments });
});

router.post("/:documentId/import", upload.single("file"), async (req, res) => {
  const documentId = req.params.documentId as string;
  const access = await findDocumentAccess(documentId, req.userId!);
  if (!access) {
    const document = await prisma.document.findUnique({ where: { id: documentId } });
    res.status(document ? 403 : 404).json({ error: document ? "You do not have access to this document" : "Document not found" });
    return;
  }
  if (access.access !== "owner") {
    res.status(403).json({ error: "Only the document owner can import content" });
    return;
  }

  const fileError = validateFile(req.file);
  if (fileError) {
    res.status(400).json({ error: fileError });
    return;
  }

  const document = await prisma.document.update({
    where: { id: documentId },
    data: { content: req.file!.buffer.toString("utf8"), version: { increment: 1 } },
  });
  res.status(200).json({ document });
});

const downloadRouter = Router();
downloadRouter.use(requireAuth);

downloadRouter.get("/:id/download", async (req, res) => {
  const attachment = await prisma.attachment.findUnique({
    where: { id: req.params.id },
    include: { document: true },
  });
  if (!attachment) {
    res.status(404).json({ error: "Attachment not found" });
    return;
  }

  const access = await findDocumentAccess(attachment.documentId, req.userId!);
  if (!access) {
    res.status(403).json({ error: "You do not have access to this attachment" });
    return;
  }

  const file = await readFile(path.resolve(process.cwd(), attachment.storedPath));
  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(attachment.filename)}"`);
  res.status(200).send(file);
});

export { downloadRouter };
export default router;
