import { z } from "zod";

export const signupBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(8),
});

export const loginBodySchema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

export const createDocumentBodySchema = z.object({
  title: z.string().optional(),
});

export const shareDocumentBodySchema = z.object({
  email: z.string().min(1),
});

export const saveDocumentBodySchema = z.object({
  content: z.string(),
});
