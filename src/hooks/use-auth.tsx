"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from "react";
import type { UserProfile, UserRole } from "@/lib/types";
import { getMockUserAction, validateCredentialsAction } from "@/lib/actions";

type LoginResult = {
    success: boolean;
    role?: UserRole;
    error?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("greenlane_role") as UserRole | null;
    const storedUserId = sessionStorage.getItem("greenlane_userId") as string | null;
    if (storedRole && storedUserId) {
        setRole(storedRole);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      if (role) {
        const mockUser = await getMockUserAction(role);
        setUser(mockUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [role]);

  const login = useCallback(async (username, password): Promise<LoginResult> => {
    setIsLoading(true);
    try {
        const result = await validateCredentialsAction(username, password);
        if (result.success) {
            setRole(result.role!);
            sessionStorage.setItem("greenlane_role", result.role!);
            sessionStorage.setItem("greenlane_userId", result.userId!);
            return { success: true, role: result.role };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        return { success: false, error: "An unexpected error occurred." };
    } finally {
        setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setUser(null);
    sessionStorage.removeItem("greenlane_role");
    sessionStorage.removeItem("greenlane_userId");
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, login, logout, isLoading }}>
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
