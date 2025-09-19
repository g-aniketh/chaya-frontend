import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    
    const params = new URLSearchParams({
      query,
      count: "true",
    });

    const backendRes = await fetch(
      `${getBackendUrl(`farmers/count?${params}`)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") ?? "",
        },
        credentials: "include",
      }
    );

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Failed to fetch farmer count" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in farmers count GET route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
