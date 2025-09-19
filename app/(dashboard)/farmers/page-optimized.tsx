"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MobileInput } from "@/components/ui/mobile-input";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { TableSkeleton } from "@/components/ui/loading-skeleton";
import { ResponsiveLayout } from "@/components/layout/responsive-layout";
import { FarmersTableResponsive } from "@/components/farmers/farmers-table-responsive";
import { FarmerFormResponsive } from "@/components/farmer-form/farmer-form-responsive";
import { useFarmers } from "@/lib/hooks/use-farmers";
import { usePerformance } from "@/lib/hooks/use-performance";
import { PRODUCTION_CONFIG, formatNumber } from "@/lib/config/production";
import { Plus, Search, Filter, Download, Users, TrendingUp, MapPin, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function FarmersPageOptimized() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Performance tracking
  const { metrics: performanceMetrics } = usePerformance("FarmersPage");

  // Data fetching with TanStack Query
  const { 
    data: farmersData, 
    isLoading, 
    error, 
    refetch 
  } = useFarmers({
    search: searchQuery,
    limit: PRODUCTION_CONFIG.TABLES.DEFAULT_PAGE_SIZE,
  });

  // const deleteFarmer = useDeleteFarmer();

  // Handle farmer actions
  const handleEditFarmer = (farmer: any) => {
    setSelectedFarmer(farmer);
    setIsEditDialogOpen(true);
  };

  const handleViewFarmer = (farmer: any) => {
    // Navigate to farmer detail page
    console.log("View farmer:", farmer);
  };

  // const handleDeleteFarmer = async (farmerId: number) => {
  //   if (confirm("Are you sure you want to delete this farmer?")) {
  //     try {
  //       await deleteFarmer.mutateAsync(farmerId);
  //       toast.success("Farmer deleted successfully");
  //     } catch (error) {
  //       toast.error("Failed to delete farmer");
  //     }
  //   }
  // };

  // Search functionality with debouncing
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Export functionality
  const handleExport = () => {
    toast.info("Export functionality will be implemented");
  };

  // Stats calculation
  const stats = {
    totalFarmers: farmersData?.totalCount || 0,
    activeFarmers: farmersData?.farmers?.filter(f => f.isActive).length || 0,
    newThisMonth: farmersData?.farmers?.filter(f => {
      const createdAt = new Date(f.createdAt);
      const thisMonth = new Date();
      thisMonth.setDate(1);
      return createdAt >= thisMonth;
    }).length || 0,
    avgAge: farmersData?.farmers ? farmersData.farmers.reduce((sum, f) => sum + f.age, 0) / farmersData.farmers.length : 0,
  };

  return (
    <ErrorBoundary>
      <ResponsiveLayout
        title="Farmers Management"
        subtitle="Manage farmer profiles, documents, and field information"
        showSearch={true}
        onSearch={handleSearch}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="hidden sm:flex"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              size="sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Farmer
            </Button>
          </>
        }
      >
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Farmers
                      </p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        ) : (
                          formatNumber(stats.totalFarmers)
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Active Farmers
                      </p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        ) : (
                          formatNumber(stats.activeFarmers)
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        New This Month
                      </p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        ) : (
                          formatNumber(stats.newThisMonth)
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Average Age
                      </p>
                      <p className="text-2xl font-bold">
                        {isLoading ? (
                          <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                        ) : (
                          `${Math.round(stats.avgAge)} years`
                        )}
                      </p>
                    </div>
                    <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Search and Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <MobileInput
                      placeholder="Search farmers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 w-full sm:w-64"
                      variant="outlined"
                      size="md"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {farmersData?.totalCount || 0} farmers
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetch()}
                    disabled={isLoading}
                  >
                    Refresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Farmers Table */}
          {isLoading ? (
            <TableSkeleton rows={5} />
          ) : error ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-destructive">
                  <p className="text-lg font-semibold mb-2">Failed to load farmers</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {error.message || "Something went wrong"}
                  </p>
                  <Button onClick={() => refetch()} variant="outline">
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <FarmersTableResponsive
              onEdit={handleEditFarmer}
              onView={handleViewFarmer}
            />
          )}

          {/* Performance Metrics (Development Only) */}
          {process.env.NODE_ENV === "development" && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Performance Metrics (Dev Mode)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <p className="font-medium">Load Time</p>
                    <p className="text-muted-foreground">{performanceMetrics.loadTime}ms</p>
                  </div>
                  <div>
                    <p className="font-medium">Render Time</p>
                    <p className="text-muted-foreground">{performanceMetrics.renderTime}ms</p>
                  </div>
                  <div>
                    <p className="font-medium">Network Requests</p>
                    <p className="text-muted-foreground">{performanceMetrics.networkRequests}</p>
                  </div>
                  <div>
                    <p className="font-medium">Errors</p>
                    <p className="text-muted-foreground">{performanceMetrics.errors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add Farmer Dialog */}
        <FarmerFormResponsive
          mode="add"
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        {/* Edit Farmer Dialog */}
        <FarmerFormResponsive
          mode="edit"
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          farmerId={selectedFarmer?.id}
        />
      </ResponsiveLayout>
    </ErrorBoundary>
  );
}
