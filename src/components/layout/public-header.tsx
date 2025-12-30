import Link from "next/link";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Logo />
        <nav className="ml-auto flex items-center space-x-2">
          <Button variant="ghost" asChild>
            <Link href="/track">Track Shipment</Link>
          </Button>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
