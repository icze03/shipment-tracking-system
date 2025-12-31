import { LoginForm } from "@/components/login-form";
import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-4 flex justify-center">
            <Logo />
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to sign in to your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
         <div className="mt-4 text-center text-sm text-muted-foreground">
            <p>
                Want to track a shipment?{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/track">
                    Track here
                    </Link>
                </Button>
            </p>
            <p>
                New driver?{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                    <Link href="/signup">
                    Sign up here
                    </Link>
                </Button>
            </p>
        </div>
      </div>
    </div>
  );
}
