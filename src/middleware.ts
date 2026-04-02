import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  const response = NextResponse.next();

  const isDev = process.env.NODE_ENV === "development";

  // CSP headers — unsafe-eval only in dev (webpack HMR requires it)
  response.headers.set(
    "Content-Security-Policy",
    [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      `style-src 'self' 'unsafe-inline'`,
      `img-src 'self' data: blob:`,
      `font-src 'self' data:`,
      `connect-src 'self' https://*.neon.tech https://*.vercel.app https://*.vercel-insights.com https://api.openai.com`,
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
