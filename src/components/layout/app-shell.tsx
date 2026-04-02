"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface AppShellProps {
  user: { id: string; email: string; name: string };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#0a0a0b]">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-zinc-800/60">
        {/* Logo */}
        <div className="flex h-14 items-center px-5">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight text-zinc-100">
            LawOps
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          <Link
            href="/dashboard"
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-zinc-800/80 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
            )}
          >
            Matters
          </Link>
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-800/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-zinc-500">{user.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
