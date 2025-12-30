"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function TrackShipmentForm({ currentOrderCode }: { currentOrderCode?: string }) {
  const [orderCode, setOrderCode] = useState(currentOrderCode || "");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (orderCode.trim()) {
      router.push(`/track?orderCode=${orderCode.trim()}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        value={orderCode}
        onChange={(e) => setOrderCode(e.target.value)}
        placeholder="Enter your order code (e.g., TT-A4B6C8)"
        className="flex-grow"
        aria-label="Order Code"
      />
      <Button type="submit" aria-label="Track Shipment">
        <Search className="mr-2 h-4 w-4" /> Track
      </Button>
    </form>
  );
}
