
"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, Trash2 } from "lucide-react";
import type { Expense } from "@/lib/types";

type ExpenseTrackerDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenses: Expense[]) => void;
  isSaving: boolean;
};

const EXPENSE_TYPES = ["RFID", "Gas", "Food", "Repairs", "Other"];

export function ExpenseTrackerDialog({
  isOpen,
  onClose,
  onSave,
  isSaving,
}: ExpenseTrackerDialogProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [otherType, setOtherType] = useState("");

  const addExpense = () => {
    setExpenses([...expenses, { id: uuidv4(), type: "Gas", amount: 0 }]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setExpenses(
      expenses.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };
  
  const handleSave = () => {
    // Filter out expenses with 0 amount
    const validExpenses = expenses.filter(exp => exp.amount > 0);
    onSave(validExpenses);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Log Trip Expenses</DialogTitle>
          <DialogDescription>
            Add any expenses incurred during this shipment. This is your final
            step before completing the trip.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {expenses.length === 0 && (
            <div className="text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                <p>No expenses logged yet.</p>
            </div>
          )}
          {expenses.map((expense, index) => (
            <div key={expense.id} className="flex items-end gap-2 p-3 border rounded-lg">
              <div className="grid flex-1 gap-2">
                <Label htmlFor={`type-${index}`}>Type</Label>
                <Select
                  value={expense.type}
                  onValueChange={(value) => updateExpense(expense.id, "type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 {expense.type === 'Other' && (
                    <Input
                        placeholder="Specify other expense"
                        onChange={(e) => setOtherType(e.target.value)}
                    />
                )}
              </div>
              <div className="grid gap-2">
                 <Label htmlFor={`amount-${index}`}>Amount</Label>
                <Input
                  id={`amount-${index}`}
                  type="number"
                  placeholder="0.00"
                  value={expense.amount || ""}
                  onChange={(e) =>
                    updateExpense(expense.id, "amount", parseFloat(e.target.value) || 0)
                  }
                  className="w-28"
                />
              </div>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => removeExpense(expense.id)}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remove</span>
              </Button>
            </div>
          ))}
        </div>

        <Button variant="outline" onClick={addExpense} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Expense Item
        </Button>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isSaving}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Confirm Expenses & Complete Trip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
