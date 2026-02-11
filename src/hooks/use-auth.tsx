
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
import { getUserProfileAction, validateCredentialsAction } from "@/lib/actions";

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

  const logout = useCallback(() => {
    sessionStorage.removeItem("greenlane_role");
    sessionStorage.removeItem("greenlane_userId");
    setRole(null);
    setUser(null);
  }, []);

  const fetchUser = useCallback(async (currentRole: UserRole, currentUserId: string) => {
    setIsLoading(true);
    try {
      const userProfile = await getUserProfileAction(currentRole, currentUserId);
      if (userProfile) {
        setUser(userProfile);
        setRole(currentRole);
      } else {
        // If no profile found, treat as logged out
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  // This effect runs once on mount to restore the session from sessionStorage.
  useEffect(() => {
    const storedRole = sessionStorage.getItem("greenlane_role") as UserRole | null;
    const storedUserId = sessionStorage.getItem("greenlane_userId");
    if (storedRole && storedUserId) {
        fetchUser(storedRole, storedUserId);
    } else {
        setIsLoading(false);
    }
  }, [fetchUser]);
  
  const login = useCallback(async (username, password): Promise<LoginResult> => {
    setIsLoading(true);
    try {
        const result = await validateCredentialsAction(username, password);
        if (result.success && result.role && result.userId) {
            sessionStorage.setItem("greenlane_role", result.role);
            sessionStorage.setItem("greenlane_userId", result.userId);
            // Fetch user directly instead of just setting role
            await fetchUser(result.role, result.userId);
            return { success: true, role: result.role };
        } else {
            setIsLoading(false);
            return { success: false, error: result.error };
        }
    } catch (error) {
        setIsLoading(false);
        return { success: false, error: "An unexpected error occurred." };
    }
  }, [fetchUser]);

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
