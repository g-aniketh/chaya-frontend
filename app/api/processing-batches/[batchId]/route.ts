import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// Ensure this matches the environment variable name you use for the backend URL
const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

interface Context {
  params: {
    batchId: string;
  };
}

export async function DELETE(request: NextRequest, context: Context) {
  const { batchId } = context.params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      `${BACKEND_API_URL}/api/processing-batches/${batchId}`,
      {
        method: "DELETE",
        headers: {
          // Forward necessary headers, backend might not need Content-Type for DELETE if no body
          Cookie: `token=${token}`,
        },
      }
    );

    // Backend might return no content on successful delete (204)
    // or a success message (200 or 202)
    if (backendRes.status === 204) {
      return new NextResponse(null, { status: 204 });
    }

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: data.error ?? "Failed to delete processing batch on backend",
          details: data.details,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(
      `Error in Next.js DELETE /api/processing-batches/${batchId} route:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
