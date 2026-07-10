import express, { Request, Response } from "express";
import { env } from "./config/env";
import { prisma } from "./config/database";
import { setupMiddleware } from "./middleware/setupMiddleware";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { successResponse } from "./utils/response";
import apiRoutes from "./routes";

const app = express();

setupMiddleware(app);

app.get("/health", (_req: Request, res: Response) => {
  res.json(successResponse(null, "EduNomad API is running"));
});

app.use("/api/v1", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

// Bind to 0.0.0.0 so the Fly.io proxy (and any container host) can reach the
// app — Fly warns "app not listening on expected address" otherwise.
const server = app.listen(Number(env.port), "0.0.0.0", () => {
  console.log(`EduNomad backend running on port ${env.port}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
