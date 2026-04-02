import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  // CSP headers
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  response.headers.set(
    "Content-Security-Policy",
    [
      `default-src 'self'`,
      `script-src 'self' 'nonce-${nonce}'`,
      `style-src 'self' 'unsafe-inline'`, // Tailwind needs unsafe-inline
      `img-src 'self' data: blob:`,
      `font-src 'self'`,
      `connect-src 'self'`,
      `frame-src 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
    ].join("; "),
  );

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  return response;
}

export const config = {
  matcher: [
    // Match all paths except static files and api/auth
    "/((?!_next/static|_next/image|favicon.ico|fonts/).*)",
  ],
};
