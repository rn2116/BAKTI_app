import { NextRequest, NextResponse } from "next/server"
import { COOKIE_NAME } from "@/lib/constants"

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/masuk?expired=1", request.url)
  const response = NextResponse.redirect(loginUrl)

  response.cookies.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  response.cookies.delete(COOKIE_NAME)

  return response
}
