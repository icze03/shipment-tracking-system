"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import type { Driver } from "@/lib/types";
import { createShipmentAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  origin: z.string().min(2, {
    message: "Origin must be at least 2 characters.",
  }),
  destination: z.string().min(2, {
    message: "Destination must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  driverId: z.string().nonempty({ message: "Please select a driver." }),
  notes: z.string().optional(),
});

type CreateShipmentFormProps = {
  drivers: Driver[];
};

export function CreateShipmentForm({ drivers }: CreateShipmentFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      description: "",
      driverId: "",
      notes: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await createShipmentAction(values);
      if (result.error) {
        toast({
          title: "Error creating shipment",
          description: result.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Shipment Created!",
          description: `Order ${result.shipment?.orderCode} has been created and assigned.`,
        });
        router.push("/admin/shipments");
      }
    });
  }

  return (
    <Card className="max-w-2xl">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2 Pallets of Electronics" {...field} />
                  </FormControl>
                  <FormDescription>
                    A brief description of the shipment contents.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Origin</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Los Angeles, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Phoenix, AZ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="driverId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign Driver</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a driver" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the driver responsible for this shipment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Fragile items, handle with care. Delivery window is 9 AM - 12 PM."
                      {...field}
                    />
                  </FormControl>
                   <FormDescription>
                    Any special instructions or notes for this shipment.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Shipment
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
