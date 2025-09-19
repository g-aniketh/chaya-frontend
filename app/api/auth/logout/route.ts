import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  response.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: -1,
    path: "/",
  });

  if (token) {
    try {
      await fetch(getBackendUrl("auth/logout"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Called backend logout successfully.");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error calling backend logout:", errorMessage);
    }
  }

  return response;
}
