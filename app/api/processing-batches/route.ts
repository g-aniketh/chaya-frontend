import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.PROD_BACKEND_URL ?? "http://localhost:5000";

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

    const backendRes = await fetch(`${BACKEND_URL}api/processing-batches`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `token=${token}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        {
          error: data.error ?? "Failed to create processing batch on backend",
          details: data.details,
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
    return NextResponse.json(
      { error: "Internal server error in Next.js API" },
      { status: 500 }
    );
  }
}
