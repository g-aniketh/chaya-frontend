"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { indianLocationData } from "@/lib/location-utils";

export function AddressSection() {
  const { control, watch, setValue } = useFormContext();
  const selectedState = watch("farmer.state");

  const initialRenderDone = useRef(false);
  const prevSelectedState = useRef(selectedState);

  useEffect(() => {
    if (initialRenderDone.current) {
      if (prevSelectedState.current !== selectedState) {
        setValue("farmer.district", "", {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    } else {
      initialRenderDone.current = true;
    }
    prevSelectedState.current = selectedState;
  }, [selectedState, setValue]);

  const statesList = useMemo(() => indianLocationData.getStates(), []);
  const districtsForSelectedState = useMemo(() => {
    return selectedState
      ? indianLocationData.getDistrictsByState(selectedState)
      : [];
  }, [selectedState]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="farmer.state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === "" ? null : value);
                }}
                value={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {statesList.length > 0 ? (
                    statesList.map((state, index) => (
                      <SelectItem
                        key={state.code || state.name || `state-${index}`}
                        value={state.name}
                      >
                        {state.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-sm text-center text-muted-foreground">
                      No states available.
                    </div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="farmer.district"
          render={({ field }) => (
            <FormItem>
              <FormLabel>District</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value === "" ? null : value);
                }}
                value={field.value || ""}
                disabled={
                  !selectedState || districtsForSelectedState.length === 0
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        !selectedState
                          ? "Select a state first"
                          : districtsForSelectedState.length === 0
                            ? "No districts for this state"
                            : "Select district"
                      }
                    />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {districtsForSelectedState.length > 0
                    ? districtsForSelectedState.map((district, index) => (
                        <SelectItem
                          key={
                            district.code || district.name || `dist-${index}`
                          }
                          value={district.name}
                        >
                          {district.name}
                        </SelectItem>
                      ))
                    : selectedState && (
                        <div className="p-2 text-sm text-center text-muted-foreground">
                          No districts found for the selected state.
                        </div>
                      )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="farmer.mandal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mandal</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter mandal"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="farmer.village"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Village</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter village"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="farmer.panchayath"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Panchayath</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter panchayath"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
