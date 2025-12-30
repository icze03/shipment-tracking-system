"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UserProfile, UserRole } from "@/lib/types";
import { getMockUserAction } from "@/lib/actions";

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole | null;
  setRole: (role: UserRole | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedRole = sessionStorage.getItem("swifttrack_role") as UserRole | null;
    if (storedRole) {
      setRoleState(storedRole);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      if (role) {
        const mockUser = await getMockUserAction(role);
        setUser(mockUser);
        sessionStorage.setItem("swifttrack_role", role);
      } else {
        setUser(null);
        sessionStorage.removeItem("swifttrack_role");
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [role]);

  const setRole = (newRole: UserRole | null) => {
    setRoleState(newRole);
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, isLoading }}>
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
