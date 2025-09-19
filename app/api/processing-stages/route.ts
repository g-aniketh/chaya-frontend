import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }


  try {
    const body = await request.json();

    const backendResponse = await fetch(
      getBackendUrl("processing-stages"),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ??
            data?.error ??
            "Failed to create processing stage on backend",
          details: data?.details,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", errorMessage },
      { status: 500 }
    );
  }
}
