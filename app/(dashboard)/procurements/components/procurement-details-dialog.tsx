"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ProcurementWithRelations } from "../lib/types";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProcurementDetailsDialogProps {
  procurement: ProcurementWithRelations;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProcurementDetailsDialog({
  procurement,
  open,
  onOpenChange,
}: ProcurementDetailsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl flex items-center gap-2">
            <span>Procurement Details</span>
            <span className="text-muted-foreground text-base">
              - {procurement.procurementNumber}
            </span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-grow pr-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <h3 className="text-base font-semibold mb-3">
                  Item Information
                </h3>
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Procurement No.
                    </span>
                    <p className="font-medium truncate">
                      {procurement.procurementNumber}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">Crop</span>
                    <p className="font-medium">{procurement.crop}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Procured Form
                    </span>
                    <p className="font-medium">{procurement.procuredForm}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Speciality
                    </span>
                    <p className="font-medium">{procurement.speciality}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Quantity
                    </span>
                    <p className="font-medium">{procurement.quantity} kg</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Lot Number
                    </span>
                    <p className="font-medium">{procurement.lotNo}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <h3 className="text-base font-semibold mb-3">
                  Procurement Details
                </h3>
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">Date</span>
                    <p className="font-medium">
                      {format(new Date(procurement.date), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">Time</span>
                    <p className="font-medium">
                      {format(new Date(procurement.time), "hh:mm a")}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Procured By
                    </span>
                    <p className="font-medium">{procurement.procuredBy}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Vehicle Number
                    </span>
                    <p className="font-medium">
                      {procurement.vehicleNo || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <h3 className="text-base font-semibold mb-3">
                  Farmer Information
                </h3>
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">Name</span>
                    <p className="font-medium">{procurement.farmer.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Village
                    </span>
                    <p className="font-medium">{procurement.farmer.village}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Panchayath
                    </span>
                    <p className="font-medium">
                      {procurement.farmer.panchayath}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Mandal
                    </span>
                    <p className="font-medium">{procurement.farmer.mandal}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-lg border p-5 shadow-sm">
                <h3 className="text-base font-semibold mb-3">
                  System Information
                </h3>
                <Separator className="mb-3" />
                <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Created At
                    </span>
                    <p className="font-medium">
                      {format(
                        new Date(procurement.createdAt),
                        "dd/MM/yyyy hh:mm a"
                      )}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-xs">
                      Last Updated
                    </span>
                    <p className="font-medium">
                      {format(
                        new Date(procurement.updatedAt),
                        "dd/MM/yyyy hh:mm a"
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
