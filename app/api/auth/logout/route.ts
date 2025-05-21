import { NextResponse, type NextRequest } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function POST(request: NextRequest) {
  const appSessionToken = request.cookies.get("app_session_token")?.value;

  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 },
  );

  response.cookies.set({
    name: "app_session_token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    maxAge: -1,
    path: "/",
  });

  if (BACKEND_API_URL && appSessionToken) {
    try {
      await fetch(`${BACKEND_API_URL}api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${appSessionToken}`,
        },
      });
      console.log("Called backend logout successfully.");
    } catch (error) {
      console.error("Error calling backend logout:", error);
    }
  } else {
    console.log(
      "Skipping backend logout call: BACKEND_API_URL or appSessionToken missing.",
    );
  }

  return response;
}
