import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getSupabaseAdmin } from "@/lib/supabase-server";

export type AdminUser = {
  id: string;
  displayName: string;
  enabled: boolean;
  passwordHash: string;
  role: "admin";
  updatedAt: string;
  username: string;
};

export type SecondaryAdminSettings = {
  displayName: string;
  enabled: boolean;
  hasPassword: boolean;
  username: string;
};

const usersPath = path.join(process.cwd(), "src", "lib", "admin-users.json");
const secondaryAdminId = "secondary-admin";

export async function getSecondaryAdminSettings(): Promise<SecondaryAdminSettings> {
  const user = (await getStoredAdminUsers()).find((item) => item.id === secondaryAdminId);
  return {
    displayName: user?.displayName ?? "Second Admin",
    enabled: user?.enabled ?? false,
    hasPassword: Boolean(user?.passwordHash),
    username: user?.username ?? "admin2"
  };
}

export async function saveSecondaryAdminSettings(input: { displayName: string; enabled: boolean; password?: string; username: string }) {
  const users = await getStoredAdminUsers();
  const existing = users.find((user) => user.id === secondaryAdminId);
  const passwordHash = input.password?.trim() ? hashAdminPassword(input.password) : existing?.passwordHash;

  if (input.enabled && !passwordHash) {
    throw new Error("Set a password before enabling the second admin.");
  }

  const nextUser: AdminUser = {
    id: secondaryAdminId,
    displayName: input.displayName.trim() || "Second Admin",
    enabled: input.enabled,
    passwordHash: passwordHash ?? "",
    role: "admin",
    updatedAt: new Date().toISOString(),
    username: normalizeUsername(input.username) || "admin2"
  };

  await saveStoredAdminUsers([nextUser, ...users.filter((user) => user.id !== secondaryAdminId)]);
  return getSecondaryAdminSettings();
}

export async function validateStoredAdminCredentials(username: string, password: string) {
  const normalizedUsername = normalizeUsername(username);
  const users = await getStoredAdminUsers();
  return users.some((user) => user.enabled && normalizeUsername(user.username) === normalizedUsername && verifyAdminPassword(password, user.passwordHash));
}

export function normalizeUsername(username: string) {
  return username.trim().toLowerCase();
}

async function getStoredAdminUsers(): Promise<AdminUser[]> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase.from("settings").select("value").eq("key", "admin_users").single();
    if (!error && Array.isArray(data?.value)) return data.value as AdminUser[];
  }

  try {
    const raw = await readFile(usersPath, "utf8");
    return JSON.parse(raw) as AdminUser[];
  } catch {
    return [];
  }
}

async function saveStoredAdminUsers(users: AdminUser[]) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { error } = await supabase.from("settings").upsert({
      key: "admin_users",
      value: users,
      updated_at: new Date().toISOString()
    });
    if (error) throw new Error(error.message);
    return;
  }

  await writeFile(usersPath, `${JSON.stringify(users, null, 2)}\n`, "utf8");
}

function hashAdminPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  return `${salt}.${createHmac("sha256", getPasswordSecret()).update(`${salt}:${password}`).digest("base64url")}`;
}

function verifyAdminPassword(password: string, storedHash: string) {
  const [salt, hash] = storedHash.split(".");
  if (!salt || !hash) return false;
  const expectedHash = createHmac("sha256", getPasswordSecret()).update(`${salt}:${password}`).digest("base64url");
  return safeEqual(hash, expectedHash);
}

function getPasswordSecret() {
  return process.env.ADMIN_AUTH_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "trusted-deals-local-admin-secret";
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
}
