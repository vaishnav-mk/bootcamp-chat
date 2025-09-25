import { Request, Response } from "express";
import * as userService from "@/services/userService";
import { UserParamsData, UpdateProfileData, UsernameParamsData } from "../models/userSchemas.js";
import { ErrorMessage } from "../constants/errors.js";
import { SuccessMessage } from "../constants/messages.js";

export const getCurrentUser = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: ErrorMessage.UNAUTHORIZED });
  
  try {
    const user = await userService.fetchUserById(userId);
    if (!user) {
      return res.status(404).json({ error: ErrorMessage.USER_NOT_FOUND });
    }
    
    res.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        avatarPath: user.avatarPath,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.FAILED_TO_FETCH_USER });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const params = req.validatedParams as UserParamsData;
  
  try {
    const user = await userService.fetchUserById(params.id);
    if (!user) {
      return res.status(404).json({ error: ErrorMessage.USER_NOT_FOUND });
    }
    
    res.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
        avatarPath: user.avatarPath,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.FAILED_TO_FETCH_USER });
  }
};

export const getUserByUsername = async (req: Request, res: Response) => {
  const params = req.validatedParams as UsernameParamsData;
  
  try {
    const user = await userService.fetchUserByUsername(params.username);
    if (!user) {
      return res.status(404).json({ error: ErrorMessage.USER_NOT_FOUND });
    }
    
    res.json({
      user: {
        id: user.id.toString(),
        username: user.username,
        name: user.name,
        avatarPath: user.avatarPath,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.FAILED_TO_FETCH_USER });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: ErrorMessage.UNAUTHORIZED });

  const data = req.validatedData as UpdateProfileData;

  try {
    if (data.username) {
      const existingUser = await userService.fetchUserByUsername(data.username);
      if (existingUser && existingUser.id.toString() !== userId) {
        return res.status(409).json({ error: ErrorMessage.USERNAME_EXISTS });
      }
    }

    const updates: any = {};
    if (data.username) updates.username = data.username;
    if (data.name) updates.name = data.name;

    const updatedUser = await userService.updateUserProfile(userId, updates);
    
    res.json({
      message: SuccessMessage.PROFILE_UPDATED,
      user: {
        id: updatedUser.id.toString(),
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        avatarPath: updatedUser.avatarPath,
        status: updatedUser.status,
      },
    });
  } catch (error) {
    res.status(500).json({ error: ErrorMessage.FAILED_TO_UPDATE_PROFILE });
  }
};
