
"use client";

import { useState, useTransition } from "react";
import { Loader2, Sparkles, AlertTriangle } from "lucide-react";
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
import type { Shipment, StatusLog } from "@/lib/types";
import { correctTimestampAction } from "@/lib/actions";
import type { CorrectTimestampOutput } from "@/ai/flows/admin-assisted-timestamp-correction";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type TimestampCorrectionModalProps = {
  shipment: Shipment;
  logToCorrect: StatusLog;
};

export function TimestampCorrectionModal({ shipment, logToCorrect }: TimestampCorrectionModalProps) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [aiSuggestion, setAiSuggestion] = useState<CorrectTimestampOutput | null>(null);

  const incorrectTimestamp = logToCorrect.timestamp;
  if (!incorrectTimestamp) return null;

  const handleSubmit = async () => {
    setAiSuggestion(null);
    startTransition(async () => {
      const result = await correctTimestampAction({
        shipmentId: shipment.id,
        statusType: logToCorrect.status,
        logIdToCorrect: logToCorrect.id,
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
        <Button variant="outline" size="sm">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Resolve
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resolve Flagged Status</DialogTitle>
          <DialogDescription>
            Correct the timestamp for this flagged entry. Add notes to document the change.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="current-ts" className="text-right">
              Flagged
            </Label>
            <Input id="current-ts" value={new Date(incorrectTimestamp).toLocaleString()} readOnly className="col-span-3" />
          </div>
          {logToCorrect.correctionReason && (
             <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right text-xs mt-1">Driver Reason</Label>
                 <p className="col-span-3 text-sm text-muted-foreground border-l-2 pl-3 py-1">{logToCorrect.correctionReason}</p>
            </div>
          )}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Admin Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., 'Corrected based on GPS data.'"
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
            Suggest & Apply Correction
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
