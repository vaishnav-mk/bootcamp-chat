import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username too long'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username too long').optional(),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
});

export const userParamsSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
});

export const usernameParamsSchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type UpdateProfileData = z.infer<typeof updateProfileSchema>;
export type UserParamsData = z.infer<typeof userParamsSchema>;
export type UsernameParamsData = z.infer<typeof usernameParamsSchema>;