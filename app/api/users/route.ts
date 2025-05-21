import { NextResponse, type NextRequest } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000/";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  console.log("GET /api/users called");
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: Missing token" },
      { status: 401 }
    );
  }

  if (!BACKEND_API_URL) {
    return NextResponse.json(
      { message: "Backend service URL not configured" },
      { status: 500 }
    );
  }

  try {
    const backendResponse = await fetch(`${BACKEND_API_URL}api/users`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        { message: data.message ?? data.error ?? "Failed to fetch users" },
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
