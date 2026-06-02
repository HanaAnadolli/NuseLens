// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const protectedPath = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/settings" || pathname.startsWith("/settings/");

  if (!protectedPath) {
    return NextResponse.next();
  }

  const token = request.cookies.get("session")?.value;

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const secret = process.env.AUTH_SECRET;

    if (!secret) {
      return redirectToLogin(request);
    }

    const valid = await verifySessionToken(token, secret);

    if (!valid) {
      return redirectToLogin(request);
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads).*)"],
};

function redirectToLogin(request: NextRequest): NextResponse {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  const parts = token.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const payload = parseJwtPayload(encodedPayload);

  if (!payload || typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"]
  );

  return crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
}

interface JwtPayload {
  exp?: number;
}

function parseJwtPayload(encodedPayload: string): JwtPayload | null {
  try {
    return JSON.parse(bytesToString(base64UrlToBytes(encodedPayload))) as JwtPayload;
  } catch {
    return null;
  }
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function bytesToString(bytes: Uint8Array<ArrayBuffer>): string {
  return new TextDecoder().decode(bytes);
}
