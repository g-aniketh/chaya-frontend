import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const getBackendUrl = (path: string): string => {
  const baseUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000"
  ).replace(/\/$/, "");
  return `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
};

export async function POST(request: NextRequest) {
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

    const backendRes = await fetch(getBackendUrl("/api/processing-batches"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json().catch(() => null); // Handle potential non-JSON responses

    if (!backendRes.ok) {
      console.error(
        "Backend error creating processing batch:",
        backendRes.status,
        data
      );
      return NextResponse.json(
        {
          error: data?.error ?? "Failed to create processing batch on backend",
          details: data?.details,
        },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: backendRes.status });
  } catch (error) {
    console.error(
      "Error in Next.js POST /api/processing-batches route:",
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
