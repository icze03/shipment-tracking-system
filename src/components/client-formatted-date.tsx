"use client";

import { useState, useEffect } from "react";
import { formatDate } from "@/lib/utils";

type ClientFormattedDateProps = {
  date: string | Date | undefined | null;
};

export function ClientFormattedDate({ date }: ClientFormattedDateProps) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    // We only format the date on the client side to avoid hydration mismatches.
    setFormattedDate(formatDate(date));
  }, [date]);
  
  // Return the client-formatted date, or a placeholder while waiting.
  // Using a consistent placeholder or even an empty string prevents mismatch.
  return <>{formattedDate || "..."}</>;
}
