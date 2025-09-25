import type { Conversation, User } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new ApiError(response.status, errorData.error || "Request failed");
  }

  const data = await response.json();
  return data;
}

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await apiRequest<{ token: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
    );

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.token);
    }

    return response;
  },

  register: async (data: {
    email: string;
    password: string;
    username: string;
    name: string;
  }) => {
    const response = await apiRequest<{ token: string; user: User }>(
      "/api/auth/register",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", response.token);
    }

    return response;
  },

  logout: async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  },
};

export const userApi = {
  getCurrentUser: () => apiRequest<{ user: User }>("/api/users/me"),
  getUserById: (id: string) => apiRequest<{ user: User }>(`/api/users/${id}`),
  getUserByUsername: (username: string) =>
    apiRequest<{ user: User }>(`/api/users/username/${username}`),
  updateProfile: (data: { username?: string; name?: string }) =>
    apiRequest<{ user: User }>("/api/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export const conversationApi = {
  getConversations: () =>
    apiRequest<{ conversations: Conversation[] }>("/api/conversations"),
  createConversation: (data: {
    type: "direct" | "group";
    name?: string;
    member_ids: string[];
  }) =>
    apiRequest<{ conversation: Conversation }>("/api/conversations", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export { ApiError };
