import { NextResponse } from "next/server";

const ACCESS_COOKIE_NAME = "portfolio_access";

function getAccessPassword() {
  return process.env.PORTFOLIO_ACCESS_PASSWORD || process.env.PORTFOLIO_ACCESS_TOKEN || "portfolio";
}

function getAccessToken() {
  return process.env.PORTFOLIO_ACCESS_TOKEN || getAccessPassword();
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") || "");
  const redirectTo = String(formData.get("redirectTo") || "/");

  if (password !== getAccessPassword()) {
    return NextResponse.json({ ok: false, message: "Nieprawidłowe hasło." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, redirectTo });
  response.cookies.set(ACCESS_COOKIE_NAME, getAccessToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
