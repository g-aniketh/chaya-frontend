"use server";

import { revalidatePath } from "next/cache";
import { Gender, Relationship } from "@ankeny/chaya-prisma-package/client";
import { ITEMS_PER_PAGE } from "./constants";
import { cookies } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Helper function to get auth token from cookies
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}
interface FarmerFormData {
  surveyNumber: string;
  name: string;
  relationship: Relationship;
  gender: Gender;
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
  bankDetails?: {
    ifscCode: string;
    bankName: string;
    branchName: string;
    accountNumber: string;
    address: string;
    bankCode: string;
  };
  documents?: {
    profilePicUrl: string;
    aadharDocUrl: string;
    bankDocUrl: string;
  };
  fields?: {
    areaHa: number;
    yieldEstimate: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    location: Record<string, any>;
    landDocumentUrl: string;
  }[];
}

export async function createFarmer(userId: number, formData: FarmerFormData) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { error: "Authentication required" };
    }

    const { bankDetails, documents, fields, ...farmerData } = formData;
    const dateOfBirth = new Date(farmerData.dateOfBirth);

    const response = await fetch(`${API_BASE_URL}/api/farmers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...farmerData,
        dateOfBirth: dateOfBirth.toISOString(),
        createdById: userId,
        updatedById: userId,
        bankDetails,
        documents,
        fields,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/dashboard/farmers");
    return { success: true };
  } catch (error) {
    console.error("Failed to create farmer:", error);
    return { error: "Failed to create farmer. Please try again." };
  }
}

export async function updateFarmer(
  userId: number,
  farmerId: number,
  formData: Partial<FarmerFormData>
) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { error: "Authentication required" };
    }

    const { bankDetails, documents, fields, ...farmerData } = formData;
    const dateOfBirth = farmerData.dateOfBirth
      ? new Date(farmerData.dateOfBirth).toISOString()
      : undefined;

    const response = await fetch(`${API_BASE_URL}/api/farmers/${farmerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...farmerData,
        ...(dateOfBirth && { dateOfBirth }),
        updatedById: userId,
        bankDetails,
        documents,
        fields,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/dashboard/farmers");
    return { success: true };
  } catch (error) {
    console.error("Failed to update farmer:", error);
    return { error: "Failed to update farmer. Please try again." };
  }
}

export async function deleteFarmer(farmerId: number) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/api/farmers/${farmerId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/dashboard/farmers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete farmer:", error);
    return { error: "Failed to delete farmer. Please try again." };
  }
}

export async function bulkDeleteFarmers(farmerIds: number[]) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { error: "Authentication required" };
    }

    const response = await fetch(`${API_BASE_URL}/api/farmers/bulk-delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ farmerIds }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    revalidatePath("/dashboard/farmers");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete farmers:", error);
    return { error: "Failed to delete farmers. Please try again." };
  }
}

export async function exportFarmersData(query?: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      return { error: "Authentication required" };
    }

    const queryParam = query ? `?query=${encodeURIComponent(query)}` : "";
    const response = await fetch(`${API_BASE_URL}/api/farmers/export${queryParam}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      count: data.count,
      downloadUrl: `/api/export/farmers?timestamp=${Date.now()}`,
    };
  } catch (error) {
    console.error("Failed to export farmers data:", error);
    return { error: "Failed to export farmers data. Please try again." };
  }
}
//SelectedColumns is not used in the function, but it's included in the function signature for future use just adding for reference
export async function getFarmers({
  query = "",
  page = 1,
}: {
  query?: string;
  page?: number;
  selectedColumns?: string[];
}) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/api/farmers?${params}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.farmers || [];
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch farmers.");
  }
}

export async function getFarmerPages(query: string) {
  try {
    const token = await getAuthToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const params = new URLSearchParams({
      query,
      count: "true",
    });

    const response = await fetch(`${API_BASE_URL}/api/farmers/count?${params}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const totalPages = Math.ceil(data.count / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("API Error:", error);
    throw new Error("Failed to fetch total number of farmers.");
  }
}
