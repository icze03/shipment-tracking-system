"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth.tsx";
import { useRouter } from "next/navigation";
import { placeholderImages } from "@/lib/placeholder-images";
import { LogOut, User, Shield, Loader2 } from "lucide-react";

export function UserNav() {
  const { user, setRole, isLoading } = useAuth();
  const router = useRouter();
  const avatarImage = placeholderImages.find(img => img.id === (user?.role === 'admin' ? 'avatar-1' : 'avatar-2'));

  const handleLogout = () => {
    setRole(null);
    router.push("/login");
    router.refresh();
  };

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin" />;
  }
  
  if (!user) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            {avatarImage && <AvatarImage src={avatarImage.imageUrl} alt={user.name} />}
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            {user.role === 'admin' ? <Shield className="mr-2 h-4 w-4" /> : <User className="mr-2 h-4 w-4" />}
            <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
