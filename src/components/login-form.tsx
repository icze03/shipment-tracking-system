"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User, Shield, Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [roleLoggingIn, setRoleLoggingIn] = useState<"admin" | "driver" | null>(null);

  const handleLogin = async (role: "admin" | "driver") => {
    setRoleLoggingIn(role);
    await login(role);
    const path = role === "admin" ? "/admin/dashboard" : "/driver/dashboard";
    router.push(path);
    router.refresh(); 
  };

  const isLoggingInAsAdmin = isLoading && roleLoggingIn === 'admin';
  const isLoggingInAsDriver = isLoading && roleLoggingIn === 'driver';

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleLogin("admin")}
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoggingInAsAdmin ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
        Login as Admin
      </Button>
      <Button
        onClick={() => handleLogin("driver")}
        className="w-full"
        variant="secondary"
        size="lg"
        disabled={isLoading}
      >
        {isLoggingInAsDriver ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <User className="mr-2 h-4 w-4" />}
        Login as Driver
      </Button>
    </div>
  );
}
