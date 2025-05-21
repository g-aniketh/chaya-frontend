import { NextResponse, type NextRequest } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

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

  if (BACKEND_API_URL && token) {
    try {
      await fetch(`${BACKEND_API_URL}api/auth/logout`, {
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
  } else {
    console.log(
      "Skipping backend logout call: BACKEND_API_URL or token missing."
    );
  }

  return response;
}
