import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = (path: string): string => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  ).replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

interface Context {
  params: {
    stageId: string;
  };
}

export async function PUT(request: NextRequest, context: Context) {
  const { stageId } = context.params;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    // The body coming from the client (finalize-stage-dialog)
    // already sends dateOfCompletion as an ISO string due to JSON.stringify(new Date()).
    // The backend Zod schema for finalizeProcessingStageInput expects a string for dateOfCompletion
    // and transforms it to a Date object. So, no further transformation is needed here in the proxy.

    const backendResponse = await fetch(
      getBackendUrl(`/api/processing-stages/${stageId}/finalize`),
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseData = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      console.error(
        "Backend error during finalize stage:",
        backendResponse.status,
        responseData
      );
      return NextResponse.json(
        {
          error: responseData?.error || "Failed to finalize stage on backend",
          details: responseData?.details,
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(responseData, { status: backendResponse.status });
  } catch (error) {
    console.error(
      `Error in Next.js PUT /api/processing-stages/${stageId}/finalize:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
