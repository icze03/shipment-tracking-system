"use client";

import { useState, useTransition } from "react";
import { Edit, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Shipment, ShipmentStatus } from "@/lib/types";
import { correctTimestampAction } from "@/lib/actions";
import type { CorrectTimestampOutput } from "@/ai/flows/admin-assisted-timestamp-correction";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type TimestampCorrectionModalProps = {
  shipment: Shipment;
  status: ShipmentStatus;
};

export function TimestampCorrectionModal({ shipment, status }: TimestampCorrectionModalProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [aiSuggestion, setAiSuggestion] = useState<CorrectTimestampOutput | null>(null);

  const incorrectTimestamp = shipment.statusTimestamps[status];
  if (!incorrectTimestamp) return null;

  const handleSubmit = async () => {
    setAiSuggestion(null);
    startTransition(async () => {
      const result = await correctTimestampAction({
        shipmentId: shipment.id,
        statusType: status,
        incorrectTimestamp: incorrectTimestamp,
        statusTimestamps: shipment.statusTimestamps as Record<string,string>,
        // For a real app, this would be a more sophisticated query
        shipmentHistory: "Avg. loading time: 1hr. Avg. travel segment: 4hrs.",
        notes,
      });

      if (result.error) {
        toast({ title: "Correction Failed", description: result.error, variant: "destructive" });
      } else if (result.success && result.aiSuggestion) {
        toast({ title: "Correction Applied", description: "The timestamp has been updated based on AI suggestion." });
        setAiSuggestion(result.aiSuggestion);
        // We'll leave the modal open to show the result, but you could close it.
        // setOpen(false);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit Timestamp</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Correct Timestamp</DialogTitle>
          <DialogDescription>
            Use AI to suggest a correction for this timestamp. Add any notes that might help.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-ts" className="text-right">
              Current
            </Label>
            <Input id="current-ts" value={new Date(incorrectTimestamp).toLocaleString()} readOnly className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 'Driver reported traffic delay'"
              className="col-span-3"
            />
          </div>
        </div>

        {aiSuggestion && (
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>AI Suggestion (Confidence: {(aiSuggestion.confidence * 100).toFixed(0)}%)</AlertTitle>
                <AlertDescription>
                    <p className="font-bold">New Timestamp: {new Date(aiSuggestion.suggestedTimestamp).toLocaleString()}</p>
                    <p className="mt-2 text-xs">{aiSuggestion.explanation}</p>
                </AlertDescription>
            </Alert>
        )}

        <DialogFooter>
          <Button type="button" onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate Suggestion & Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    