"use client";

import { useAuth } from "@/hooks/use-auth.tsx";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { User, Shield } from "lucide-react";

export function LoginForm() {
  const { setRole } = useAuth();
  const router = useRouter();

  const handleLogin = (role: "admin" | "driver") => {
    setRole(role);
    const path = role === "admin" ? "/admin/dashboard" : "/driver/dashboard";
    router.push(path);
    router.refresh(); 
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={() => handleLogin("admin")}
        className="w-full"
        size="lg"
      >
        <Shield className="mr-2 h-4 w-4" />
        Login as Admin
      </Button>
      <Button
        onClick={() => handleLogin("driver")}
        className="w-full"
        variant="secondary"
        size="lg"
      >
        <User className="mr-2 h-4 w-4" />
        Login as Driver
      </Button>
    </div>
  );
}
