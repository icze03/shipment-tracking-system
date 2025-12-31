"use client";

import { useTransition } from "react";
import type { Driver } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { approveDriverAction, removeDriverAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DriverApprovalListProps = {
  drivers: Driver[];
};

export function DriverApprovalList({ drivers }: DriverApprovalListProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleApprove = (driverId: string) => {
    startTransition(async () => {
      const result = await approveDriverAction(driverId);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Driver Approved!", description: "The driver is now active." });
      }
    });
  };

  const handleRemove = (driverId: string) => {
    startTransition(async () => {
      const result = await removeDriverAction(driverId);
      if (result.error) {
        toast({ title: "Error", description: result.error, variant: "destructive" });
      } else {
        toast({ title: "Request Removed", description: "The sign-up request has been removed." });
      }
    });
  };

  if (drivers.length === 0) {
    return (
        <div className="text-center text-muted-foreground border-2 border-dashed rounded-lg p-12">
            <h3 className="text-lg font-semibold">No Pending Approvals</h3>
            <p className="text-sm">There are no new driver registrations to review at this time.</p>
        </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Driver</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drivers.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {driver.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="capitalize">{driver.name}</span>
                  </div>
                </TableCell>
                <TableCell>{driver.email}</TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(driver.id)}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(driver.id)}
                      disabled={isPending}
                    >
                      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      Remove
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
