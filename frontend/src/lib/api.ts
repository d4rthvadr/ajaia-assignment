const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000/api";

export interface User {
  id: string;
  email: string;
}

export interface Document {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  version: number;
  updatedAt: string;
  access?: "owner" | "shared";
}

export type DocumentSummary = Pick<
  Document,
  "id" | "title" | "updatedAt" | "access"
>;

export interface ShareUser {
  id: string;
  email: string;
}

export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.error ?? `Request failed (${res.status})`,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export const api = {
  signup: (email: string, password: string) =>
    request<{ user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  login: (email: string, password: string) =>
    request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me"),
  createDocument: (title?: string) =>
    request<{ document: Document }>("/documents", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getDocuments: () => request<{ documents: DocumentSummary[] }>("/documents"),
  getSharedDocuments: () =>
    request<{ documents: DocumentSummary[] }>("/documents/shared-with-me"),
  getDocument: (id: string) =>
    request<{ document: Document }>(`/documents/${id}`),
  saveDocument: (id: string, content: string) =>
    request<{ document: Document }>(`/documents/${id}`, {
      method: "PUT",
      body: JSON.stringify({ content }),
    }),
  shareDocument: (id: string, email: string) =>
    request<{ grant: { id: string } }>(`/documents/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  getShares: (id: string) =>
    request<{ users: ShareUser[] }>(`/documents/${id}/shares`),
  getAttachments: (id: string) =>
    request<{ attachments: Attachment[] }>(`/documents/${id}/attachments`),
  uploadAttachment: (id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ attachment: Attachment }>(`/documents/${id}/attachments`, {
      method: "POST",
      body,
    });
  },
  importFile: (id: string, file: File) => {
    const body = new FormData();
    body.append("file", file);
    return request<{ document: Document }>(`/documents/${id}/import`, {
      method: "POST",
      body,
    });
  },
  attachmentDownloadUrl: (id: string) =>
    `${API_BASE}/attachments/${id}/download`,
};

export { ApiError };
