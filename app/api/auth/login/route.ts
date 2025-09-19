import { NextResponse, type NextRequest } from "next/server";
import { getBackendUrl } from "@/lib/utils/api";

export async function POST(request: NextRequest) {
  let email, password;

  try {
    const body = await request.json();
    email = body.email;
    password = body.password;

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }
  } catch (error: unknown) {
    console.log("API error", error);
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 }
    );
  }

  try {
    const backendResponse = await fetch(getBackendUrl("auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });
    console.log(
      "Backend Set-Cookieader in route.ts for login:",
      backendResponse.headers.get("Set-Cookie")
    );
    const backendData = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          message:
            backendData.message || backendData.error || "Authentication failed",
        },
        { status: backendResponse.status }
      );
    }
    const { user, token: backendToken } = backendData;

    if (!user || !backendToken) {
      console.error(
        "User data or token missing from backend response:",
        backendData
      );
      return NextResponse.json(
        { message: "Invalid response from authentication server" },
        { status: 500 }
      );
    }
    const response = NextResponse.json({ user }, { status: 200 });
    response.cookies.set("token", backendToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    return response;
  } catch (error: unknown) {
    console.error(
      "Login API route error:",
      error instanceof Error ? error.message : String(error)
    );
    return NextResponse.json(
      { message: "An internal server error occurred during login." },
      { status: 500 }
    );
  }
}
