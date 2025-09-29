import { Response } from "express";
import { ErrorMessage } from "../constants/errors";
import { SuccessMessage } from "../constants/messages";

export const sendSuccess = (res: Response, data: any, message?: string, statusCode = 200) => {
  const response: any = { ...data };
  if (message) response.message = message;
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: ErrorMessage, statusCode = 400) => {
  return res.status(statusCode).json({ error });
};

export const sendNotFound = (res: Response, error = ErrorMessage.USER_NOT_FOUND) => {
  return res.status(404).json({ error });
};

export const sendUnauthorized = (res: Response, error = ErrorMessage.UNAUTHORIZED) => {
  return res.status(401).json({ error });
};

export const sendForbidden = (res: Response, error = ErrorMessage.NOT_IN_CONVERSATION) => {
  return res.status(403).json({ error });
};

export const sendServerError = (res: Response, error = ErrorMessage.REGISTRATION_FAILED) => {
  return res.status(500).json({ error });
};