"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import { ApiError, authApi, userApi } from "@/lib/api";
import type { AuthState, User } from "@/types";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    username: string;
    name: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { user } = await userApi.getCurrentUser();
      setUser(user);
    } catch (_error) {
      localStorage.removeItem("auth_token");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const { user } = await authApi.login(email, password);
      setUser(user);
      toast.success("Welcome back!");
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Login failed. Please try again.";
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: {
    email: string;
    password: string;
    username: string;
    name: string;
  }) => {
    try {
      setError(null);
      setIsLoading(true);
      const { user } = await authApi.register(data);
      setUser(user);
      toast.success(`Welcome, ${user.name}!`);
    } catch (error) {
      const message =
        error instanceof ApiError
          ? error.message
          : "Registration failed. Please try again.";
      setError(message);
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
    } catch (_error) {
    } finally {
      setUser(null);
      localStorage.removeItem("auth_token");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
