import bcrypt from 'bcrypt';
import * as userService from './userService.js';
import { generateToken } from '../lib/jwt.js';

export interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string;
    name: string;
    avatarPath: string | null;
  };
  token: string;
}

export const hashPassword = async (password: string): Promise<string> => {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const registerUser = async (userData: {
  email: string;
  password: string;
  username: string;
  name: string;
}): Promise<AuthResult> => {
  const hashedPassword = await hashPassword(userData.password);
  
  const user = await userService.createUser({
    email: userData.email,
    passwordHash: hashedPassword,
    username: userData.username,
    name: userData.name,
  });

  const token = generateToken(user.id.toString(), user.email);

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      avatarPath: user.avatarPath,
    },
    token,
  };
};

export const authenticateUser = async (email: string, password: string): Promise<AuthResult | null> => {
  const user = await userService.fetchUserByEmail(email);
  
  if (!user) {
    return null;
  }

  const isValidPassword = await comparePassword(password, user.passwordHash);
  
  if (!isValidPassword) {
    return null;
  }

  const token = generateToken(user.id.toString(), user.email);

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      username: user.username,
      name: user.name,
      avatarPath: user.avatarPath,
    },
    token,
  };
};



