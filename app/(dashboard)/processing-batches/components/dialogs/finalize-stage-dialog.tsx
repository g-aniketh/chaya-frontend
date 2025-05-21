"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isValid as isDateValid } from "date-fns";
import { toast } from "sonner";
import { getDryingEntriesForStage } from "../../lib/actions";

const finalizeStageFormSchema = z.object({
  dateOfCompletion: z.date({
    required_error: "Date of Completion is required",
    invalid_type_error: "That's not a valid date!",
  }),
  quantityAfterProcess: z.coerce // Use coerce for better UX with number inputs
    .number({
      required_error: "Final quantity is required",
      invalid_type_error: "Final quantity must be a number",
    })
    .positive("Final quantity must be a positive number")
    .min(0.01, "Quantity must be greater than 0"),
});

type FinalizeStageFormValues = z.infer<typeof finalizeStageFormSchema>;

interface FinalizeStageDialogProps {
  processingStageId: number;
  batchCode: string;
  processingCount: number;
  currentInitialQuantity: number; // Initial quantity of this stage
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FinalizeStageDialog({
  processingStageId,
  batchCode,
  processingCount,
  currentInitialQuantity,
  open,
  onOpenChange,
  onSuccess,
}: FinalizeStageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingDrying, setIsLoadingDrying] = useState(false);

  const form = useForm<FinalizeStageFormValues>({
    resolver: zodResolver(finalizeStageFormSchema),
    defaultValues: {
      dateOfCompletion: new Date(),
      quantityAfterProcess: undefined, // Start undefined, will be autofilled
    },
  });

  useEffect(() => {
    if (open && processingStageId) {
      setIsLoadingDrying(true);
      getDryingEntriesForStage(processingStageId)
        .then((dryingEntries) => {
          // Ensure dryingEntries is an array before proceeding
          const validEntries = Array.isArray(dryingEntries)
            ? dryingEntries
            : [];
          const latestDryingEntry =
            validEntries.length > 0
              ? validEntries.sort((a, b) => b.day - a.day)[0]
              : null;

          const autoFillQuantity =
            latestDryingEntry?.currentQuantity ?? currentInitialQuantity;

          form.reset({
            dateOfCompletion: new Date(),
            quantityAfterProcess:
              parseFloat(autoFillQuantity.toFixed(2)) || undefined,
          });
        })
        .catch((err) => {
          toast.error(
            err.message || "Could not load latest drying quantity for autofill."
          );
          console.error("Error fetching drying entries for autofill:", err);
          form.reset({
            // Fallback to initial quantity on error
            dateOfCompletion: new Date(),
            quantityAfterProcess:
              parseFloat(currentInitialQuantity.toFixed(2)) || undefined,
          });
        })
        .finally(() => {
          setIsLoadingDrying(false);
        });
    }
  }, [open, processingStageId, form, currentInitialQuantity]);

  const onSubmit = async (data: FinalizeStageFormValues) => {
    setIsSubmitting(true);
    try {
      // Ensure date is ISO string for backend Zod schema
      const payloadForBackend = {
        dateOfCompletion: data.dateOfCompletion.toISOString(),
        quantityAfterProcess: data.quantityAfterProcess,
      };

      const response = await fetch(
        `/api/processing-stages/${processingStageId}/finalize`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payloadForBackend),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        const errorMsg =
          result.error ||
          `Failed to finalize stage. Status: ${response.status}`;
        const errorDetails = result.details
          ?.map(
            (d: { path: string[]; message: string }) =>
              `${d.path.join(".")}: ${d.message}`
          )
          .join("; ");
        throw new Error(
          errorDetails ? `${errorMsg} - ${errorDetails}` : errorMsg
        );
      }

      toast.success(
        `Stage P${processingCount} for Batch ${batchCode} finalized successfully.`
      );
      document.dispatchEvent(new CustomEvent("processingBatchDataChanged"));
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error finalizing stage:", error);
      if (error instanceof Error) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error("Failed to finalize stage due to an unknown error.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Finalize Stage P{processingCount} for Batch {batchCode}
          </DialogTitle>
          <DialogDescription>
            Enter the completion details. Initial stage quantity:{" "}
            {currentInitialQuantity.toFixed(2)}kg.
            {isLoadingDrying && " Fetching latest drying quantity..."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="dateOfCompletion"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Completion</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value && isDateValid(field.value) ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date > new Date()} // Prevent future dates
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantityAfterProcess"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity After Process (kg)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Enter final yield for this stage"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value === ""
                            ? undefined
                            : parseFloat(e.target.value)
                        )
                      }
                      disabled={isLoadingDrying}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting || isLoadingDrying}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isLoadingDrying}>
                {isSubmitting ? "Finalizing..." : "Finalize Stage"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
