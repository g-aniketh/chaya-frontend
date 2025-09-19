import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }


  try {
    const backendResponse = await fetch(
      getBackendUrl(`users/${id}/toggle-status`),
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: data.message || data.error || "Failed to toggle user status",
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", errorMessage },
      { status: 500 }
    );
  }
}
