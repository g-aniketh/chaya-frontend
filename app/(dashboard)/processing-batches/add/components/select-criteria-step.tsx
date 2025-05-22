"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useProcessingBatchFormStore } from "@/app/stores/processing-batch-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";

const CROP_OPTIONS = ["Turmeric", "Coffee", "Ginger", "Pepper"] as const;

const criteriaSchema = z
  .object({
    crop: z.string().optional().nullable(),
    lotNo: z.coerce
      .number()
      .int()
      .min(1, "Lot number must be a positive integer")
      .max(3, "Only 1, 2, 3 Lot Numbers are available")
      .optional()
      .nullable(),
  })
  .refine(
    (data) =>
      !!data.crop || (typeof data.lotNo === "number" && !isNaN(data.lotNo)),
    {
      message: "Either Crop or Lot Number (or both) must be provided.",
      path: ["crop"],
    }
  );

type CriteriaFormValues = z.infer<typeof criteriaSchema>;

export function SelectCriteriaStep() {
  const { initialCrop, initialLotNo, setForm } = useProcessingBatchFormStore();

  const form = useForm<CriteriaFormValues>({
    resolver: zodResolver(criteriaSchema),
    defaultValues: {
      crop: initialCrop || null,
      lotNo: initialLotNo || null,
    },
  });

  useEffect(() => {
    if (setForm) {
      setForm(form);
    }
    return () => {
      if (setForm) {
        setForm(null);
      }
    };
  }, [form, setForm]);

  useEffect(() => {
    form.reset({
      crop: initialCrop || null,
      lotNo: initialLotNo || null,
    });
  }, [initialCrop, initialLotNo, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Select Initial Criteria</CardTitle>
        <CardDescription>
          Specify Crop and/or Lot Number to pre-filter procurements. If both are
          left blank, youll define criteria based on your first procurement
          choice in the next step. To pre-filter, at least one field must be
          entered.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <FormField
              control={form.control}
              name="crop"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="crop">Crop Name</Label>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(
                        value === "NONE_SELECTED_VALUE" ? null : value
                      )
                    }
                    value={field.value || undefined}
                  >
                    <FormControl>
                      <SelectTrigger id="crop">
                        <SelectValue placeholder="Select a crop" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CROP_OPTIONS.map((cropName) => (
                        <SelectItem key={cropName} value={cropName}>
                          {cropName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lotNo"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="lotNo">Lot Number</Label>
                  <FormControl>
                    <Input
                      id="lotNo"
                      type="number"
                      placeholder="Enter lot number"
                      value={
                        field.value === null || field.value === undefined
                          ? ""
                          : String(field.value)
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(
                          val === ""
                            ? null
                            : isNaN(parseInt(val, 4))
                              ? null
                              : parseInt(val, 4)
                        );
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.crop &&
              form.formState.errors.crop.type === "manual" && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.crop.message}
                </p>
              )}
            {form.formState.errors.crop &&
              Object.keys(form.formState.errors.crop).length === 1 &&
              form.formState.errors.crop.message && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.crop.message}
                </p>
              )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
