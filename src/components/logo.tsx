import { Truck } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "flex items-center gap-2 text-lg font-bold text-primary",
        className
      )}
    >
      <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
        <Truck className="h-5 w-5" />
      </div>
      <span className="hidden sm:inline-block">Greenlane Transporters Incorporated</span>
      <span className="sm:hidden">Greenlane</span>
    </Link>
  );
}
