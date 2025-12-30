import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { AuthSwitcher } from "@/components/auth-switcher";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TruckTrack - Modern Logistics Monitoring",
  description:
    "Replacing manual reporting with an automated timestamp system for trucking logistics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`font-body bg-background text-foreground antialiased ${inter.variable}`}>
        <Providers>
          {children}
          <Toaster />
          <AuthSwitcher />
        </Providers>
      </body>
    </html>
  );
}
