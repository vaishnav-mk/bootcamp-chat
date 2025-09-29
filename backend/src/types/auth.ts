import { SerializedUser } from "./serialized";

export interface AuthResult {
  user: SerializedUser;
  token: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  username: string;
  name: string;
}

export interface UpdateUserData {
  username?: string;
  name?: string;
}