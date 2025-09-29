import { Request, Response } from "express";
import { sendUnauthorized } from "./responseHelpers";
import { ErrorMessage } from "../constants/errors";

export const requireAuth = (req: Request, res: Response): string | null => {
  const userId = req.user?.id;
  if (!userId) {
    sendUnauthorized(res);
    return null;
  }
  return userId;
};

export const getUserId = (req: Request): string => {
  return req.user!.id;
};