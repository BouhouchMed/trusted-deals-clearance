import { NextRequest, NextResponse } from "next/server";
import { setAdminSessionCookie, validateAdminPassword, validateCaptchaToken } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { captchaAnswer?: string; captchaToken?: string; password?: string } | null;

  if (!body?.password || !body.captchaAnswer || !body.captchaToken) {
    return NextResponse.json({ error: "Password and captcha are required." }, { status: 400 });
  }

  if (!validateCaptchaToken(body.captchaToken, body.captchaAnswer)) {
    return NextResponse.json({ error: "Captcha answer is incorrect or expired." }, { status: 400 });
  }

  if (!validateAdminPassword(body.password)) {
    return NextResponse.json({ error: "Password is incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminSessionCookie(response);
  return response;
}
