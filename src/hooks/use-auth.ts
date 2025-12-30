"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile, UserRole } from "@/lib/types";
import { users } from "@/lib/data";

const AUTH_KEY = "trucktrack_auth_role";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const revalidate = useCallback(() => {
    setIsLoading(true);
    try {
      const storedRole = localStorage.getItem(AUTH_KEY) as UserRole | null;
      if (storedRole) {
        const foundUser = users.find((u) => u.role === storedRole);
        setUser(foundUser || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Could not read auth state from localStorage", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    revalidate();
    
    const handleStorageChange = () => {
      revalidate();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    }
  }, [revalidate]);

  const login = (role: UserRole) => {
    try {
      localStorage.setItem(AUTH_KEY, role);
      const foundUser = users.find((u) => u.role === role);
      setUser(foundUser || null);
    } catch (error) {
      console.error("Could not set auth state in localStorage", error);
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(AUTH_KEY);
      setUser(null);
    } catch (error) {
      console.error("Could not remove auth state from localStorage", error);
    }
  };

  return { user, isLoading, login, logout, revalidate };
}
