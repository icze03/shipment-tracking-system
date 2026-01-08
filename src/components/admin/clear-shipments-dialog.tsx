
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, FileDown, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clearAllShipmentsAction } from "@/lib/actions";

type ClearShipmentsDialogProps = {
  onClear: () => void;
};

export function ClearShipmentsDialog({ onClear }: ClearShipmentsDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"initial" | "confirmDelete">(
    "initial"
  );

  const handleClearRecords = () => {
    startTransition(async () => {
      const result = await clearAllShipmentsAction();
      if (result.error) {
        toast({
          title: "Error Clearing Records",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "All completed shipment records have been cleared.",
        });
        onClear(); // Re-fetch the data on the parent page
      }
      setOpen(false); // Close dialog on completion
      setStep("initial"); // Reset step
    });
  };

  const onOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      // Reset to initial step when dialog is closed
      setTimeout(() => setStep("initial"), 200);
    }
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="mr-2 h-4 w-4" />
          Clear Records
        </Button>
      </AlertDialogTrigger>
      {step === "initial" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-destructive h-6 w-6" />
                Backup Your Data First!
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete all completed and cancelled shipment records. Before
              proceeding, it is highly recommended that you export the data for
              your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-between items-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/admin/reports">
                <FileDown className="mr-2 h-4 w-4" />
                Go to Reports
              </Link>
            </Button>
            <div className="flex gap-2">
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                {/* Use a regular button to prevent auto-closing */}
                <Button onClick={() => setStep("confirmDelete")}>
                  I have a backup, proceed
                </Button>
            </div>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
      {step === "confirmDelete" && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This is your final confirmation. This action cannot be
              undone and will permanently delete all completed and cancelled shipment data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending} onClick={() => setStep("initial")}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              disabled={isPending}
              onClick={handleClearRecords}
            >
              {isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Yes, delete completed shipments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
