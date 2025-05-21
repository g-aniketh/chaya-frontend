import { NextResponse, type NextRequest } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(_request: NextRequest) {
  const appSessionToken = _request.cookies.get("app_session_token")?.value;

  if (!appSessionToken) {
    return NextResponse.json(
      { message: "Not authenticated (no app session)" },
      { status: 401 },
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${appSessionToken}`,
      },
    });

    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            backendData.message ||
            backendData.error ||
            "Failed to fetch user from backend",
        },
        { status: backendResponse.status },
      );
    }

    return NextResponse.json(backendData, { status: 200 });
  } catch (error: any) {
    console.error("Current user API route error:", error.message);
    return NextResponse.json(
      { message: "An internal server error occurred." },
      { status: 500 },
    );
  }
}
