import { PrismaClient } from "@prisma/client";

// Reuse a single client across ts-node-dev restarts to avoid exhausting Postgres connections.
export const prisma = new PrismaClient();
