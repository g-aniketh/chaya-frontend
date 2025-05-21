/*eslint-disable */
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

export async function POST(request: NextRequest, context: Context) {
  const { stageId } = context.params;
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
    const response = await fetch(
      getBackendUrl(`/api/processing-stages/${stageId}/drying`),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    const responseData = await response.json().catch(() => null);

    if (!response.ok) {
      const errorText =
        responseData?.error ||
        (await response.text().catch(() => "Unknown backend error"));
      console.error(
        `Backend error for /api/processing-stages/${stageId}/drying: ${response.status} - ${errorText}`,
        responseData?.details
      );
      return new NextResponse(
        JSON.stringify({
          error: responseData?.error || `Backend error: ${response.statusText}`,
          details: responseData?.details || errorText,
        }),
        {
          status: response.status,
        }
      );
    }
    return new NextResponse(JSON.stringify(responseData), {
      status: response.status,
    });
  } catch (error: unknown) {
    console.error(
      `Error in Next.js POST /api/processing-stages/${stageId}/drying:`,
      error
    );
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
    });
  }
}
