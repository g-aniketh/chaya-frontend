import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401 }
      );
    }

    const body = await request.json();
    // Ensure correct URL formation
    const backendUrlClean = BACKEND_URL.replace(/\/$/, ""); // Remove trailing slash if present
    const fetchUrl = `${backendUrlClean}/api/sales`; // Path starts with /

    const response = await fetch(fetchUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `token=${token}` },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: "Failed to parse error from backend" }));
      console.error("Backend error creating sale:", response.status, errorData);
      return new NextResponse(JSON.stringify(errorData), {
        status: response.status,
      });
    }
    const data = await response.json();
    return new NextResponse(JSON.stringify(data), { status: response.status });
  } catch (error) {
    console.error("Error in Next.js POST /api/sales:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
