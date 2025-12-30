import type { Metadata } from "next";
import "./globals.css";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { AuthSwitcher } from "@/components/auth-switcher";
import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SwiftTrack Logistics",
  description:
    "Streamlined shipment management and real-time tracking for modern logistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>
          {children}
          <Toaster />
          <AuthSwitcher />
        </Providers>
      </body>
    </html>
  );
}
