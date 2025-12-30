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
import { getMockUserAction } from "@/lib/actions";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("swifttrack_role") as UserRole | null;
    if (storedRole) {
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

  const login = useCallback(async (username, password) => {
    setIsLoading(true);
    // Hardcoded credentials as requested
    if (username === "astraea millares" && password === "astraea1234") {
      const adminRole = "admin";
      setRole(adminRole);
      sessionStorage.setItem("swifttrack_role", adminRole);
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setUser(null);
    sessionStorage.removeItem("swifttrack_role");
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
