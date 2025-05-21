"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createDryingEntrySchema,
  type CreateDryingEntryInput,
  type Drying,
} from "@fyzanshaik/chaya-prisma-package";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios, { AxiosError } from "axios"; // Keep axios for its conciseness in client components
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDryingEntriesForStage } from "../../lib/actions";

interface AddDryingDialogProps {
  processingStageId: number;
  batchCode: string;
  processingCount: number;
  stageInitialQuantity: number; // Added this prop
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddDryingDialog({
  processingStageId,
  batchCode,
  processingCount,
  stageInitialQuantity,
  open,
  onOpenChange,
  onSuccess,
}: AddDryingDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingDryingEntries, setExistingDryingEntries] = useState<Drying[]>(
    []
  );
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);

  const form = useForm<CreateDryingEntryInput>({
    resolver: zodResolver(createDryingEntrySchema),
    // Default values are important; currentQuantity will be updated in useEffect
    defaultValues: {
      processingStageId: processingStageId,
      day: 1,
      temperature: 25, // Sensible default
      humidity: 60, // Sensible default
      pH: 7.0, // Sensible default
      moisturePercentage: 15, // Sensible default
      currentQuantity: parseFloat(stageInitialQuantity.toFixed(2)) || 0, // Initialize from prop
    },
  });

  useEffect(() => {
    if (open && processingStageId) {
      // Reset relevant fields upon opening/stageId change to ensure fresh defaults
      form.reset({
        processingStageId: processingStageId,
        day: 1,
        temperature: 25,
        humidity: 60,
        pH: 7.0,
        moisturePercentage: 15,
        currentQuantity: parseFloat(stageInitialQuantity.toFixed(2)) || 0, // Initial value for the first entry
      });

      const fetchExistingEntries = async () => {
        setIsLoadingEntries(true);
        try {
          const entries = await getDryingEntriesForStage(processingStageId);
          setExistingDryingEntries(entries);
          const nextDay =
            entries.length > 0 ? Math.max(...entries.map((d) => d.day)) + 1 : 1;
          form.setValue("day", nextDay);

          const lastEntry =
            entries.length > 0
              ? entries.sort((a, b) => b.day - a.day)[0]
              : null;

          const quantityToSet = lastEntry
            ? lastEntry.currentQuantity
            : stageInitialQuantity;
          form.setValue(
            "currentQuantity",
            parseFloat(quantityToSet.toFixed(2))
          );
        } catch (error) {
          const err = error as AxiosError<{ error?: string }>;
          const errorMessage =
            err.response?.data?.error ||
            err.message ||
            "Failed to load existing drying entries.";
          toast.error(errorMessage);
          form.setValue(
            "currentQuantity",
            parseFloat(stageInitialQuantity.toFixed(2))
          );
        } finally {
          setIsLoadingEntries(false);
        }
      };
      fetchExistingEntries();
    }
  }, [open, processingStageId, form, stageInitialQuantity]); // stageInitialQuantity dependency

  const onSubmit = async (data: CreateDryingEntryInput) => {
    setIsSubmitting(true);
    try {
      await axios.post(
        `/api/processing-stages/${processingStageId}/drying`,
        data,
        { withCredentials: true }
      );
      toast.success(`Drying data for Day ${data.day} added successfully.`);
      onSuccess(); // Refresh table
      onOpenChange(false); // Close current dialog
    } catch (error) {
      console.error("Error adding drying data:", error);
      const err = error as AxiosError<{ error?: string; details?: Array<{ path: string[]; message: string }> }>;
      let errorMessage = "Failed to add drying data";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      const errorDetails = err.response?.data?.details
        ?.map((d) => `${d.path.join(".")}: ${d.message}`)
        .join("; ");
      toast.error(errorMessage, { description: errorDetails });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            Add Drying Data for Batch {batchCode} - P{processingCount}
          </DialogTitle>
          <DialogDescription>
            Enter the drying parameters for the specified day. Stage P
            {processingCount} started with {stageInitialQuantity.toFixed(2)}kg.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Day Number</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseInt(e.target.value, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature (°C)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="humidity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Humidity (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pH"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>pH Level</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="moisturePercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Moisture (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Quantity (kg)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : parseFloat(e.target.value)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingEntries}>
                {isSubmitting ? "Adding..." : "Add Entry"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        {isLoadingEntries && (
          <p className="text-sm text-center py-4">
            Loading existing entries...
          </p>
        )}
        {!isLoadingEntries && existingDryingEntries.length > 0 && (
          <div className="mt-6">
            <h4 className="text-md font-semibold mb-2">
              Previous Drying Entries (P{processingCount})
            </h4>
            <ScrollArea className="h-[200px] border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Day</TableHead>
                    <TableHead>Temp</TableHead>
                    <TableHead>Hum</TableHead>
                    <TableHead>pH</TableHead>
                    <TableHead>Moist%</TableHead>
                    <TableHead className="text-right">Qty(kg)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {existingDryingEntries.map(
                    (
                      entry // Should already be sorted by day 'asc' from action
                    ) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.day}</TableCell>
                        <TableCell>{entry.temperature}°C</TableCell>
                        <TableCell>{entry.humidity}%</TableCell>
                        <TableCell>{entry.pH}</TableCell>
                        <TableCell>{entry.moisturePercentage}%</TableCell>
                        <TableCell className="text-right">
                          {entry.currentQuantity.toFixed(2)}kg
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
