import { Request, Response, NextFunction } from "express";
import { logger } from "@/middleware/logger";
import { HttpError } from "./httpError";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const status = err instanceof HttpError ? err.statusCode : 500;
  const message = err && err.message ? err.message : "Internal Server Error";

  logger.error(message, {
    status,
    method: req.method,
    url: req.originalUrl,
    body: req.body,
    params: req.params,
    query: req.query,
    stack: err?.stack,
    timestamp: new Date().toISOString(),
  });

  const payload: any = { error: message };

  res.status(status).json(payload);
}
