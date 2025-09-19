import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ batchId: string }> }
) {
  const { batchId } = await params;
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }


  try {
    const backendResponse = await fetch(
      getBackendUrl(`processing-batches/${batchId}`),
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (backendResponse.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            data.message ||
            data.error ||
            "Failed to delete processing batch on backend",
          details: data.details,
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
