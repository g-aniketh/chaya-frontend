"use server";

import { cookies } from "next/headers";
import { FarmerWithRelations } from "./types";

export const ITEMS_PER_PAGE = 10;
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

// Helper function to get auth token from cookies
async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value;
}
//selectedColumns is not used in the function, but it is included in the function signature for future use
export async function getFarmers({
  query = "",
  page = 1,
}: {
  query?: string;
  page?: number;
  selectedColumns?: string[];
}): Promise<FarmerWithRelations[]> {
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
// Count total farmers matching the query

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
