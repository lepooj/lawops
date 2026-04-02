"use client";

/**
 * Client-side providers wrapper.
 *
 * Note: SessionProvider from next-auth/react is NOT used.
 * In NextAuth v5 with App Router, session is checked server-side via auth().
 * SessionProvider is a Pages Router pattern that causes hydration issues.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
