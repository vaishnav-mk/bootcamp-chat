import { Request, Response } from "express";
import * as authService from "../services/authService.js";
import * as userService from "../services/userService.js";
import { RegisterData, LoginData } from "../validations/userSchemas.js";
import { ErrorMessage } from "../constants/errors.js";
import { SuccessMessage } from "../constants/messages.js";
import { asyncWrap } from "../middleware/asyncWrap.js";

const registerHandler = async (req: Request, res: Response) => {
  const data = req.validatedData as RegisterData;
  
  const existingUser = await userService.fetchUserByEmail(data.email);
  if (existingUser) {
    return res.status(409).json({ error: ErrorMessage.EMAIL_EXISTS });
  }

  const existingUsername = await userService.fetchUserByUsername(data.username);
  if (existingUsername) {
    return res.status(409).json({ error: ErrorMessage.USERNAME_EXISTS });
  }

  try {
    const result = await authService.registerUser({
      email: data.email,
      password: data.password,
      username: data.username,
      name: data.name,
    });

    res.status(201).json({
      message: SuccessMessage.USER_REGISTERED,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.REGISTRATION_FAILED });
  }
};

const loginHandler = async (req: Request, res: Response) => {
  const data = req.validatedData as LoginData;

  try {
    const result = await authService.authenticateUser(data.email, data.password);

    if (!result) {
      return res.status(401).json({ error: ErrorMessage.INVALID_CREDENTIALS });
    }

    res.json({
      message: SuccessMessage.LOGIN_SUCCESSFUL,
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.LOGIN_FAILED });
  }
};

const logoutHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  
  res.json({ 
    message: SuccessMessage.LOGOUT_SUCCESSFUL,
    userId: userId?.toString() 
  });
};

export const register = asyncWrap(registerHandler);
export const login = asyncWrap(loginHandler);
export const logout = asyncWrap(logoutHandler);