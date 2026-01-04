
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

  // This effect runs once on mount to restore the session from sessionStorage.
  useEffect(() => {
    const storedRole = sessionStorage.getItem("greenlane_role") as UserRole | null;
    if (storedRole) {
        // If a role is found in storage, set it in the component's state.
        // This will trigger the next useEffect to fetch the user data.
        setRole(storedRole);
    } else {
        // If no role is found, we can conclude the initial loading.
        setIsLoading(false);
    }
  }, []);

  // This effect runs whenever the 'role' state changes.
  useEffect(() => {
    const fetchUser = async () => {
      // Don't start fetching if the role is not yet determined.
      if (!role) {
        setUser(null);
        setIsLoading(false); // Ensure loading is false if there's no role.
        return;
      }

      setIsLoading(true);
      try {
        const mockUser = await getMockUserAction(role);
        setUser(mockUser);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        // If fetching fails, clear the invalid session.
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const login = useCallback(async (username, password): Promise<LoginResult> => {
    setIsLoading(true);
    try {
        const result = await validateCredentialsAction(username, password);
        if (result.success && result.role && result.userId) {
            sessionStorage.setItem("greenlane_role", result.role);
            sessionStorage.setItem("greenlane_userId", result.userId);
            setRole(result.role); // Set role to trigger user fetching
            return { success: true, role: result.role };
        } else {
            return { success: false, error: result.error };
        }
    } catch (error) {
        return { success: false, error: "An unexpected error occurred." };
    } finally {
        // Loading state will be handled by the user-fetching useEffect
    }
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem("greenlane_role");
    sessionStorage.removeItem("greenlane_userId");
    setRole(null);
    setUser(null);
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
