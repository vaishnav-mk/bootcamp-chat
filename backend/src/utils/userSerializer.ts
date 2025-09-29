import { SerializedUser } from "@/types";

export const serializeUser = (user: any, includeTimestamps = false): SerializedUser => {
  const serialized: SerializedUser = {
    id: user.id.toString(),
    email: user.email,
    username: user.username,
    name: user.name,
    avatar: user.avatarPath || user.avatar,
    status: user.status,
  };

  if (includeTimestamps) {
    serialized.createdAt = user.createdAt;
    serialized.updatedAt = user.updatedAt;
  }

  return serialized;
};

export const serializeUsers = (users: any[], includeTimestamps = false): SerializedUser[] => {
  return users.map(user => serializeUser(user, includeTimestamps));
};