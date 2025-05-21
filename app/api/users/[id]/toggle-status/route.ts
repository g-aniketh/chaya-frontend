import { NextResponse, type NextRequest } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;


export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const appSessionToken = request.cookies.get("app_session_token")?.value;

  if (!appSessionToken) {
    return NextResponse.json(
      { message: "Unauthorized: Missing session token" },
      { status: 401 },
    );
  }

  if (!BACKEND_API_URL) {
    return NextResponse.json(
      { message: "Backend service URL not configured" },
      { status: 500 },
    );
  }

  try {
    const backendResponse = await fetch(
      `${BACKEND_API_URL}/api/users/${id}/toggle-status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${appSessionToken}`,
        },
      },
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message: data.message || data.error || "Failed to toggle user status",
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { message: "Internal server error", errorMessage },
      { status: 500 },
    );
  }
}
