import { Request, Response, NextFunction } from "express";

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
type Handler = (req: Request, res: Response, next: NextFunction) => any;

export const asyncWrap = (fn: AsyncHandler | Handler) => 
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
