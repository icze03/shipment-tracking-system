import { Logo } from "@/components/logo";
import { UserNav } from "@/components/layout/user-nav";

export default function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <div className="flex items-center space-x-2">
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
