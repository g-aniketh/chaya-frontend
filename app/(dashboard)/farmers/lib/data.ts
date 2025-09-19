"use server";

import { cookies } from "next/headers";
import { FarmerWithRelations } from "./types";
import { getApiUrl } from "@/lib/utils/api";

export const ITEMS_PER_PAGE = 10;
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const params = new URLSearchParams({
      query,
      page: page.toString(),
      limit: ITEMS_PER_PAGE.toString(),
    });

    const response = await fetch(`${getApiUrl(`farmers?${params}`)}`, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
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
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const params = new URLSearchParams({
      query,
      count: "true",
    });

    const response = await fetch(`${getApiUrl(`farmers/count?${params}`)}`, {
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      credentials: "include",
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
