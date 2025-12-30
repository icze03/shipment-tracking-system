"use client";

import { useAuth } from "@/hooks/use-auth.tsx";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function AuthSwitcher() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/login");
    router.refresh();
  };
  
  // This component is now only for logging out during development
  if (process.env.NODE_ENV === 'production' || !user) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      <Button
        size="icon"
        variant={'outline'}
        onClick={handleLogout}
        title="Log Out"
        className="rounded-full"
      >
        <LogOut className="h-5 w-5" />
      </Button>
    </div>
  );
}
