import { getDriverById } from "@/lib/data/drivers";
import { notFound } from "next/navigation";
import { EditDriverForm } from "@/components/admin/edit-driver-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type EditDriverPageProps = {
  params: {
    id: string;
  };
};

export default async function EditDriverPage({ params }: EditDriverPageProps) {
  const driver = await getDriverById(params.id);

  if (!driver) {
    notFound();
  }

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
        <h2 className="text-2xl font-bold tracking-tight font-headline">Edit Driver</h2>
        <p className="text-muted-foreground">
          Update the details for <span className="font-medium">{driver.name}</span>.
        </p>
      </div>
      <EditDriverForm driver={driver} />
    </div>
  );
}
