import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Types
interface Farmer {
  id: number;
  surveyNumber: string;
  name: string;
  relationship: string;
  gender: string;
  community: string;
  aadharNumber: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  panchayath: string;
  dateOfBirth: string;
  age: number;
  contactNumber: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  bankDetails?: any;
  documents?: any;
  fields?: any[];
  createdBy?: { name: string };
}

interface FarmersResponse {
  farmers: Farmer[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

interface CreateFarmerData {
  farmer: {
    surveyNumber: string;
    name: string;
    relationship: string;
    gender: string;
    community: string;
    aadharNumber: string;
    state: string;
    district: string;
    mandal: string;
    village: string;
    panchayath: string;
    dateOfBirth: string;
    age: number;
    contactNumber: string;
  };
  bankDetails: {
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    address: string;
    bankCode: string;
  };
  documents: {
    profilePicUrl: string;
    aadharDocUrl: string;
    bankDocUrl: string;
  };
  fields?: Array<{
    areaHa: number;
    yieldEstimate: number;
    location: any;
    landDocumentUrl: string;
  }>;
}

// API functions
const farmersApi = {
  getFarmers: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    state?: string;
    district?: string;
    gender?: string;
    isActive?: boolean;
  } = {}): Promise<FarmersResponse> => {
    const searchParams = new URLSearchParams();
    
    if (params.page) searchParams.set("page", params.page.toString());
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.search) searchParams.set("search", params.search);
    if (params.state) searchParams.set("state", params.state);
    if (params.district) searchParams.set("district", params.district);
    if (params.gender) searchParams.set("gender", params.gender);
    if (params.isActive !== undefined) searchParams.set("isActive", params.isActive.toString());

    const response = await fetch(`/api/farmers?${searchParams.toString()}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farmers: ${response.statusText}`);
    }

    return response.json();
  },

  getFarmer: async (id: number): Promise<Farmer> => {
    const response = await fetch(`/api/farmers/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farmer: ${response.statusText}`);
    }

    return response.json();
  },

  createFarmer: async (data: CreateFarmerData): Promise<Farmer> => {
    const response = await fetch("/api/farmers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create farmer");
    }

    return response.json();
  },

  updateFarmer: async ({ id, data }: { id: number; data: Partial<CreateFarmerData> }): Promise<Farmer> => {
    const response = await fetch(`/api/farmers/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update farmer");
    }

    return response.json();
  },

  deleteFarmer: async (id: number): Promise<void> => {
    const response = await fetch(`/api/farmers/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete farmer");
    }
  },

  bulkDeleteFarmers: async (ids: number[]): Promise<void> => {
    const response = await fetch("/api/farmers/bulk-delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to delete farmers");
    }
  },
};

// Query keys
export const farmersKeys = {
  all: ["farmers"] as const,
  lists: () => [...farmersKeys.all, "list"] as const,
  list: (params: any) => [...farmersKeys.lists(), params] as const,
  details: () => [...farmersKeys.all, "detail"] as const,
  detail: (id: number) => [...farmersKeys.details(), id] as const,
};

// Hooks
export function useFarmers(params: {
  page?: number;
  limit?: number;
  search?: string;
  state?: string;
  district?: string;
  gender?: string;
  isActive?: boolean;
} = {}) {
  return useQuery({
    queryKey: farmersKeys.list(params),
    queryFn: () => farmersApi.getFarmers(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useFarmer(id: number) {
  return useQuery({
    queryKey: farmersKeys.detail(id),
    queryFn: () => farmersApi.getFarmer(id),
    enabled: !!id,
  });
}

export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: farmersApi.createFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmersKeys.lists() });
      toast.success("Farmer created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create farmer");
    },
  });
}

export function useUpdateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: farmersApi.updateFarmer,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: farmersKeys.lists() });
      queryClient.setQueryData(farmersKeys.detail(data.id), data);
      toast.success("Farmer updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update farmer");
    },
  });
}

export function useDeleteFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: farmersApi.deleteFarmer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmersKeys.lists() });
      toast.success("Farmer deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete farmer");
    },
  });
}

export function useBulkDeleteFarmers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: farmersApi.bulkDeleteFarmers,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmersKeys.lists() });
      toast.success("Farmers deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete farmers");
    },
  });
}
