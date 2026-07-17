import { createHmac, randomInt, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { normalizeUsername, validateStoredAdminCredentials } from "@/lib/admin-users-store";

export const ADMIN_SESSION_COOKIE = "trusted_deals_admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
const CAPTCHA_MAX_AGE_MS = 10 * 60 * 1000;

type CaptchaChallenge = {
  question: string;
  token: string;
};

export function createCaptchaChallenge(): CaptchaChallenge {
  const left = randomInt(2, 10);
  const right = randomInt(2, 10);
  const answer = String(left + right);
  const expiresAt = Date.now() + CAPTCHA_MAX_AGE_MS;
  const encodedAnswer = Buffer.from(answer, "utf8").toString("base64url");
  const payload = `${encodedAnswer}.${expiresAt}`;

  return {
    question: `${left} + ${right}`,
    token: `${payload}.${sign(payload)}`
  };
}

export function validateCaptchaToken(token: string, answer: string) {
  const [encodedAnswer, expiresAt, signature] = token.split(".");
  if (!encodedAnswer || !expiresAt || !signature) return false;
  if (Number(expiresAt) < Date.now()) return false;

  const payload = `${encodedAnswer}.${expiresAt}`;
  if (!safeEqual(signature, sign(payload))) return false;

  const expectedAnswer = Buffer.from(encodedAnswer, "base64url").toString("utf8");
  return safeEqual(expectedAnswer, answer.trim());
}

export async function validateAdminCredentials(username: string, password: string) {
  const normalizedUsername = normalizeUsername(username || "admin");
  if ((normalizedUsername === "admin" || normalizedUsername === "owner") && safeEqual(password, getAdminPassword())) return true;
  return validateStoredAdminCredentials(normalizedUsername, password);
}

export function createAdminSessionValue() {
  const issuedAt = Date.now();
  const payload = String(issuedAt);
  return `${payload}.${sign(payload)}`;
}

export function isValidAdminSession(value?: string) {
  if (!value) return false;

  const [issuedAt, signature] = value.split(".");
  if (!issuedAt || !signature) return false;
  if (Date.now() - Number(issuedAt) > SESSION_MAX_AGE_SECONDS * 1000) return false;

  return safeEqual(signature, sign(issuedAt));
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

export function requireAdminApiAuth(request: NextRequest | Request) {
  const session = getCookieFromHeader(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  if (isValidAdminSession(session)) return null;

  return NextResponse.json({ error: "Admin login required." }, { status: 401 });
}

export function setAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });
}

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || process.env.ADMIN_DASHBOARD_PASSWORD || "admin123";
}

function getAuthSecret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "trusted-deals-local-admin-secret";
}

function sign(payload: string) {
  return createHmac("sha256", getAuthSecret()).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookieFromHeader(cookieHeader: string | null, name: string) {
  if (!cookieHeader) return undefined;

  return cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}
