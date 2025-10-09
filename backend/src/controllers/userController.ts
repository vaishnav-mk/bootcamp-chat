import { Request, Response } from "express";
import * as userService from "@/services/userService";
import { UserParamsData, UpdateProfileData, UsernameParamsData } from "../validations/userSchemas.js";
import { ErrorMessage } from "../constants/errors.js";
import { SuccessMessage } from "../constants/messages.js";
import { serializeUser } from "../utils/userSerializer";
import { asyncWrap } from "../middleware/asyncWrap.js";
import { HttpError } from "@/utils/httpError";

const getCurrentUserHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new HttpError(401, ErrorMessage.UNAUTHORIZED);

  const user = await userService.fetchUserById(userId);
  if (!user) {
    throw new HttpError(404, ErrorMessage.USER_NOT_FOUND);
  }

  res.json({ user: serializeUser(user, true) });
};

const getUserByIdHandler = async (req: Request, res: Response) => {
  const params = req.validatedParams as UserParamsData;

  const user = await userService.fetchUserById(params.id);
  if (!user) {
    throw new HttpError(404, ErrorMessage.USER_NOT_FOUND);
  }

  res.json({ user: serializeUser(user, true) });
};

const getUserByUsernameHandler = async (req: Request, res: Response) => {
  const params = req.validatedParams as UsernameParamsData;

  const user = await userService.fetchUserByUsername(params.username);
  if (!user) {
    throw new HttpError(404, ErrorMessage.USER_NOT_FOUND);
  }

  res.json({ user: serializeUser(user) });
};

const updateProfileHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new HttpError(401, ErrorMessage.UNAUTHORIZED);

  const data = req.validatedData as UpdateProfileData;

  if (data.username) {
    const existingUser = await userService.fetchUserByUsername(data.username);
    if (existingUser && existingUser.id.toString() !== userId) {
      throw new HttpError(409, ErrorMessage.USERNAME_EXISTS);
    }
  }

  const updates: any = {};
  if (data.username) updates.username = data.username;
  if (data.name) updates.name = data.name;

  const updatedUser = await userService.updateUserProfile(userId, updates);

  res.json({
    message: SuccessMessage.PROFILE_UPDATED,
    user: serializeUser(updatedUser),
  });
};

export const getCurrentUser = asyncWrap(getCurrentUserHandler);
export const getUserById = asyncWrap(getUserByIdHandler);
export const getUserByUsername = asyncWrap(getUserByUsernameHandler);
export const updateProfile = asyncWrap(updateProfileHandler);
