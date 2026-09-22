import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import authRoutes from "./routes/auth";
import attachmentRoutes, { downloadRouter } from "./routes/attachments";
import documentRoutes from "./routes/documents";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN ?? "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/documents", attachmentRoutes);
app.use("/api/attachments", downloadRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

const errorHandler: ErrorRequestHandler = (error, _req, res, next) => {
  if (res.headersSent) {
    next(error);
    return;
  }

  console.error("Unhandled server error", error);
  res.status(500).json({ error: "Internal server error" });
};

app.use(errorHandler);

export default app;
