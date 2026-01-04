
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getShipments } from "@/lib/data/shipments";
import { ShipmentDataTable } from "@/components/admin/shipment-data-table";
import { columns } from "@/components/admin/shipment-columns";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

// This is now a client component to handle refresh
export default function AdminShipmentsPage() {
  const router = useRouter();
  const [shipments, setShipments] = React.useState<Awaited<ReturnType<typeof getShipments>>>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchShipments = React.useCallback(async () => {
    try {
      const data = await getShipments();
      setShipments(data);
    } catch (error) {
      console.error("Failed to fetch shipments:", error);
      toast({
        title: "Error",
        description: "Failed to load shipment data. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    fetchShipments();
  }, [fetchShipments]);


  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh();
      fetchShipments();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [router, fetchShipments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight font-headline">Shipment Overview</h2>
          <p className="text-muted-foreground">
            Monitor and manage all ongoing and completed shipments.
          </p>
        </div>
        <div className="flex-shrink-0">
          <Button asChild>
            <Link href="/admin/shipments/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Shipment
            </Link>
          </Button>
        </div>
      </div>
      <ShipmentDataTable columns={columns} data={shipments} />
    </div>
  );
}
