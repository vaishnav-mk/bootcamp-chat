import { Request, Response } from "express";
import * as authService from "../services/authService.js";
import * as userService from "../services/userService.js";
import { RegisterData, LoginData } from "../validations/userSchemas.js";
import { ErrorMessage } from "../constants/errors.js";
import { SuccessMessage } from "../constants/messages.js";
import { sendSuccess, sendError, sendUnauthorized, sendServerError } from "../utils/responseHelpers";
import { asyncWrap } from "../middleware/asyncWrap.js";
import { HttpError } from "@/utils/httpError";

const registerHandler = async (req: Request, res: Response) => {
  const data = req.validatedData as RegisterData;
  
  const existingUser = await userService.fetchUserByEmail(data.email);
  if (existingUser) {
    return sendError(res, ErrorMessage.EMAIL_EXISTS, 409);
  }

  const existingUsername = await userService.fetchUserByUsername(data.username);
  if (existingUsername) {
    return sendError(res, ErrorMessage.USERNAME_EXISTS, 409);
  }

  const result = await authService.registerUser({
    email: data.email,
    password: data.password,
    username: data.username,
    name: data.name,
  });

  if (!result) throw new HttpError(500, ErrorMessage.REGISTRATION_FAILED);

  sendSuccess(res, { user: result.user, token: result.token }, SuccessMessage.USER_REGISTERED, 201);
};

const loginHandler = async (req: Request, res: Response) => {
  const data = req.validatedData as LoginData;

  const result = await authService.authenticateUser(data.email, data.password);

  if (!result) {
    return sendUnauthorized(res, ErrorMessage.INVALID_CREDENTIALS);
  }

  sendSuccess(res, { user: result.user, token: result.token }, SuccessMessage.LOGIN_SUCCESSFUL);
};

const logoutHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  sendSuccess(res, { userId: userId?.toString() }, SuccessMessage.LOGOUT_SUCCESSFUL);
};

export const register = asyncWrap(registerHandler);
export const login = asyncWrap(loginHandler);
export const logout = asyncWrap(logoutHandler);