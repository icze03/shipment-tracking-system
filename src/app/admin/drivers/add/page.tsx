import { AddDriverForm } from "@/components/admin/add-driver-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddDriverPage() {
  return (
    <div className="space-y-6">
        <div>
            <Button variant="outline" size="sm" asChild>
            <Link href="/admin/drivers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Drivers
            </Link>
            </Button>
        </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight font-headline">Add New Driver</h2>
        <p className="text-muted-foreground">
          Fill in the details below to add a new driver to the system.
        </p>
      </div>
      <AddDriverForm />
    </div>
  );
}
