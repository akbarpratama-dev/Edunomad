import cors from "cors";
import express, { Express } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "../config/env";

export const setupMiddleware = (app: Express) => {
  app.use(helmet());
  // CORS: locked to a comma-separated allowlist when CORS_ORIGIN is set
  // (e.g. "https://edunomad.vercel.app"), otherwise open so local/demo setups
  // work out of the box. Set CORS_ORIGIN in production to restrict callers.
  const corsOrigin = process.env.CORS_ORIGIN?.trim();
  app.use(
    cors(
      corsOrigin
        ? { origin: corsOrigin.split(",").map((o) => o.trim()) }
        : undefined
    )
  );
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(express.json());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      // A single SPA page loads several resources in parallel (a project board
      // fires ~6 requests), so 100/15min was easily exhausted by ordinary
      // browsing — and once /auth/me got a 429 the client treated it as an
      // auth failure. 1000/15min leaves ample headroom for real usage while
      // still capping abuse. Skipped entirely in development so local testing
      // (hot reload + repeated navigation) never trips it.
      limit: 1000,
      skip: () => env.nodeEnv === "development",
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
    })
  );
};
