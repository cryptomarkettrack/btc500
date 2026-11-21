import { getCookie, setCookie } from "@tanstack/react-start/server";

export const PLAYER_COOKIE = "clash_player";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const TOKEN_VERSION = "v1";
const DEV_SECRET = "btc500-candle-clash-local-dev-only-not-for-production";

function secret(): string {
  const configured = process.env.CLASH_COOKIE_SECRET;
  if (configured && configured.length >= 32) return configured;
  if (process.env.NODE_ENV === "production") {
    throw new Error("CLASH_COOKIE_SECRET must be set to at least 32 characters in production");
  }
  return DEV_SECRET;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function sign(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return toBase64Url(new Uint8Array(signature));
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/** Signed, expiring cookie value. The cookie is httpOnly and never sent to JS. */
export async function createPlayerToken(userId: string, nowMs = Date.now()): Promise<string> {
  const expiresAt = nowMs + COOKIE_MAX_AGE * 1000;
  const message = `${TOKEN_VERSION}.${userId}.${expiresAt}`;
  return `${message}.${await sign(message)}`;
}

export async function readPlayerToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 4 || parts[0] !== TOKEN_VERSION) return null;
  const [, userId, expiresAtRaw, providedSignature] = parts;
  const expiresAt = Number(expiresAtRaw);
  if (!userId || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) return null;
  const expected = await sign(`${TOKEN_VERSION}.${userId}.${expiresAtRaw}`);
  return constantTimeEqual(expected, providedSignature ?? "") ? userId : null;
}

/** Returns the verified user id from the signed cookie, or null. */
export async function getPlayerId(): Promise<string | null> {
  return readPlayerToken(getCookie(PLAYER_COOKIE));
}

export async function setPlayerCookie(userId: string): Promise<void> {
  setCookie(PLAYER_COOKIE, await createPlayerToken(userId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}
