/**
 * Client-side API service for farmers
 * This is used by client components to make API calls
 */

import { FarmerWithRelations } from "@/app/(dashboard)/farmers/lib/types";
import { getClientApiUrl } from "@/lib/utils/api";

export interface GetFarmersParams {
  search?: string;
  page?: number;
  limit?: number;
}

export interface GetFarmersResponse {
  farmers: FarmerWithRelations[];
  total: number;
  page: number;
  limit: number;
}

export interface GetFarmerCountResponse {
  count: number;
}

export class FarmersApiService {
  /**
   * Fetch farmers from the API
   */
  static async getFarmers(params: GetFarmersParams = {}): Promise<FarmerWithRelations[]> {
    const { search = "", page = 1, limit = 10 } = params;
    
    const searchParams = new URLSearchParams({
      search,
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${getClientApiUrl(`farmers?${searchParams}`)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farmers: ${response.status}`);
    }

    const data = await response.json();
    return data.farmers || [];
  }

  /**
   * Get total number of farmers (for pagination)
   */
  static async getFarmerCount(search: string = ""): Promise<number> {
    const searchParams = new URLSearchParams({
      search,
    });

    const response = await fetch(`${getClientApiUrl(`farmers/count?${searchParams}`)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch farmer count: ${response.status}`);
    }

    const data: GetFarmerCountResponse = await response.json();
    return data.count;
  }

  /**
   * Create a new farmer
   */
  static async createFarmer(farmerData: any): Promise<void> {
    const response = await fetch(getClientApiUrl("farmers"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(farmerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create farmer: ${response.status}`);
    }
  }

  /**
   * Update a farmer
   */
  static async updateFarmer(farmerId: number, farmerData: any): Promise<void> {
    const response = await fetch(getClientApiUrl(`farmers/${farmerId}`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(farmerData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update farmer: ${response.status}`);
    }
  }

  /**
   * Delete a farmer
   */
  static async deleteFarmer(farmerId: number): Promise<void> {
    const response = await fetch(getClientApiUrl(`farmers/${farmerId}`), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to delete farmer: ${response.status}`);
    }
  }

  /**
   * Bulk delete farmers
   */
  static async bulkDeleteFarmers(farmerIds: number[]): Promise<void> {
    const response = await fetch(getClientApiUrl("farmers/bulk-delete"), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ farmerIds }),
    });

    if (!response.ok) {
      throw new Error(`Failed to bulk delete farmers: ${response.status}`);
    }
  }
}
