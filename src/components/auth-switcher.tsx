"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { Shield, User, LogOut } from "lucide-react";

export function AuthSwitcher() {
  const { login, logout, user } = useAuth();
  const router = useRouter();

  const handleSwitch = (role: "admin" | "driver" | null) => {
    if (role) {
      login(role);
      const path = role === "admin" ? "/admin/dashboard" : "/driver/dashboard";
      router.push(path);
    } else {
      logout();
      router.push("/login");
    }
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <Button
        size="icon"
        variant={user?.role === "admin" ? "default" : "outline"}
        onClick={() => handleSwitch("admin")}
        title="Switch to Admin"
        className="rounded-full"
      >
        <Shield className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant={user?.role === "driver" ? "default" : "outline"}
        onClick={() => handleSwitch("driver")}
        title="Switch to Driver"
        className="rounded-full"
      >
        <User className="h-5 w-5" />
      </Button>
      <Button
        size="icon"
        variant={!user ? "default" : "outline"}
        onClick={() => handleSwitch(null)}
        title="Log Out"
        className="rounded-full"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
