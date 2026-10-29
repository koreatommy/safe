import { NextResponse } from "next/server";
import {
  ASSESSMENT_SESSION_COOKIE,
  ASSESSMENT_SESSION_MAX_AGE,
  createAssessmentSessionToken,
  isAssessmentPasswordValid,
} from "@/lib/server/assessmentSession";

const FAILED_LOGIN_DELAY_MS = 600;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { password?: unknown } | null;
  const password = typeof body?.password === "string" ? body.password : "";

  if (!isAssessmentPasswordValid(password)) {
    await new Promise((resolve) => setTimeout(resolve, FAILED_LOGIN_DELAY_MS));
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ASSESSMENT_SESSION_COOKIE, createAssessmentSessionToken(), {
    ...cookieOptions,
    maxAge: ASSESSMENT_SESSION_MAX_AGE,
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ASSESSMENT_SESSION_COOKIE, "", { ...cookieOptions, maxAge: 0 });
  return response;
}
