import cors from "cors";
import express, { Express } from "express";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "../config/env";

export const setupMiddleware = (app: Express) => {
  app.use(helmet());
  app.use(cors());
  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
  app.use(express.json());

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        message: "Too many requests, please try again later.",
      },
    })
  );
};
