import { NextResponse, type NextRequest } from "next/server";

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:5000/";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  try {
    const body = await request.json();

    const backendResponse = await fetch(`${BACKEND_API_URL}api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => null);

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            data?.message ?? data?.error ?? "Failed to register staff member",
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
