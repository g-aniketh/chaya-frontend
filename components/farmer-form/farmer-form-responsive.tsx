"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFarmerFormStore } from "@/lib/stores/farmer-form-store";
import { useCreateFarmer, useUpdateFarmer } from "@/lib/hooks/use-farmers";
import { createFarmerSchema } from "@ankeny/chaya-prisma-package/client";
// import { PersonalInfoSection } from "./personal-info-section";
// import { AddressSection } from "./address-section";
// import { BankDetailsSection } from "./bank-details-section";
// import { FieldsSection } from "./fields-section";
import { User, MapPin, CreditCard, TreePine, CheckCircle } from "lucide-react";

interface FarmerFormProps {
  mode: "add" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  farmerId?: number;
}

const tabs = [
  { id: "personal", label: "Personal", icon: User, description: "Basic information" },
  { id: "address", label: "Address", icon: MapPin, description: "Location details" },
  { id: "bank", label: "Bank", icon: CreditCard, description: "Banking information" },
  { id: "fields", label: "Fields", icon: TreePine, description: "Land details" },
];

export function FarmerFormResponsive({
  mode,
  open,
  onOpenChange,
  farmerId,
}: FarmerFormProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const { formData, resetForm, setIsDirty } = useFarmerFormStore();
  const createFarmer = useCreateFarmer();
  const updateFarmer = useUpdateFarmer();

  const form = useForm<any>({
    resolver: zodResolver(createFarmerSchema),
    defaultValues: formData,
    mode: "onChange",
  });

  const { handleSubmit, formState: { errors, isValid }, trigger } = form;

  const onSubmit = async (data: any) => {
    try {
      if (mode === "add") {
        await createFarmer.mutateAsync(data);
      } else if (farmerId) {
        await updateFarmer.mutateAsync({ id: farmerId, data });
      }
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleTabChange = async (newTab: number) => {
    // Validate current tab before switching
    const currentTabFields = getTabFields(currentTab);
    const isValid = await trigger(currentTabFields);
    
    if (isValid || newTab < currentTab) {
      setCurrentTab(newTab);
    } else {
      toast.error("Please fix the errors in the current tab before proceeding");
    }
  };

  const getTabFields = (tabIndex: number): any[] => {
    switch (tabIndex) {
      case 0:
        return ["farmer.surveyNumber", "farmer.name", "farmer.gender", "farmer.relationship"];
      case 1:
        return ["farmer.state", "farmer.district", "farmer.mandal", "farmer.village"];
      case 2:
        return ["bankDetails.ifscCode", "bankDetails.bankName", "bankDetails.accountNumber"];
      case 3:
        return ["fields"];
      default:
        return [];
    }
  };

  const getTabErrors = (tabIndex: number) => {
    const fields = getTabFields(tabIndex);
    return fields.some(field => {
      const fieldErrors = field.split('.').reduce((obj: any, key: string) => obj?.[key], errors);
      return fieldErrors;
    });
  };

  const isTabValid = (tabIndex: number) => {
    return !getTabErrors(tabIndex);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-xl font-semibold">
            {mode === "add" ? "Add New Farmer" : "Edit Farmer"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Mobile Tab Navigation */}
          <div className="lg:hidden border-b">
            <Tabs value={currentTab.toString()} onValueChange={(value) => handleTabChange(parseInt(value))}>
              <TabsList className="grid w-full grid-cols-4 h-auto p-1">
                {tabs.map((tab, index) => (
                  <TabsTrigger
                    key={tab.id}
                    value={index.toString()}
                    className="flex flex-col items-center gap-1 p-2 text-xs"
                  >
                    <tab.icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 border-r bg-muted/30">
            <div className="p-4 space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground mb-4">Form Sections</h3>
              {tabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  onClick={() => handleTabChange(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    currentTab === index
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-muted"
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${
                      currentTab === index ? "bg-primary-foreground/20" : "bg-muted"
                    }`}>
                      <tab.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tab.label}</span>
                        {isTabValid(index) && currentTab !== index && (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {tab.description}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="h-full">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="p-6"
                >
                  {currentTab === 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="h-5 w-5" />
                          Personal Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">Personal information form will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentTab === 1 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          Address Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">Address information form will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentTab === 2 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CreditCard className="h-5 w-5" />
                          Bank Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">Bank details form will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {currentTab === 3 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TreePine className="h-5 w-5" />
                          Field Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">Field information form will be implemented here.</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Form Actions */}
              <div className="border-t p-6 bg-muted/30">
                <div className="flex flex-col sm:flex-row gap-3 justify-between">
                  <div className="flex gap-2">
                    {currentTab > 0 && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleTabChange(currentTab - 1)}
                        className="flex-1 sm:flex-none"
                      >
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {currentTab < tabs.length - 1 ? (
                      <Button
                        type="button"
                        onClick={() => handleTabChange(currentTab + 1)}
                        className="flex-1 sm:flex-none"
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={!isValid || createFarmer.isPending || updateFarmer.isPending}
                        className="flex-1 sm:flex-none"
                      >
                        {createFarmer.isPending || updateFarmer.isPending
                          ? "Saving..."
                          : mode === "add"
                          ? "Create Farmer"
                          : "Update Farmer"}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Progress Indicator */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                    <span>Progress</span>
                    <span>{currentTab + 1} of {tabs.length}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentTab + 1) / tabs.length) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
