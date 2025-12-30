"use client";

import * as React from "react";
import { AuthProvider } from "@/hooks/use-auth.tsx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
      <AuthProvider>{children}</AuthProvider>
  );
}
