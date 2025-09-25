import { Request, Response, NextFunction } from "express";
import { logger } from "@/middleware/logger";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logger.error("Error occurred:", {
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    timestamp: new Date().toISOString()
  });

  logger.error("Full error object:", err);

  res.status(500).json({ message: err.message });
}
