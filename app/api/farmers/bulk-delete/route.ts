import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();

    const backendRes = await fetch(getBackendUrl("farmers/bulk-delete"), {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Cookie: request.headers.get("cookie") ?? "",
      },
      credentials: "include",
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: data?.error ?? "Failed to bulk delete farmers" },
        { status: backendRes.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error in farmers bulk-delete DELETE route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
