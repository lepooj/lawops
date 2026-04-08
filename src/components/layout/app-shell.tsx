"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTrack } from "@/lib/use-track";
import { logoutAction } from "@/server/actions/auth";

interface AppShellProps {
  user: { id: string; email: string; name: string };
  children: React.ReactNode;
}

export function AppShell({ user, children }: AppShellProps) {
  const pathname = usePathname();
  const track = useTrack();

  return (
    <div className="flex min-h-screen bg-[#0a0a0b] print:block print:min-h-0 print:bg-white">
      {/* Sidebar — hidden in print */}
      <aside className="flex w-56 flex-col border-r border-zinc-800/60 print:hidden">
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
            onClick={() => track({ action: "ui.nav_click", meta: { target: "dashboard" } })}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/dashboard"
                ? "bg-zinc-800/80 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
            )}
          >
            Matters
          </Link>
          <Link
            href="/help"
            onClick={() => track({ action: "ui.nav_click", meta: { target: "help" } })}
            className={cn(
              "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === "/help"
                ? "bg-zinc-800/80 text-zinc-100"
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200",
            )}
          >
            Help
          </Link>
        </nav>

        {/* Footer */}
        <div className="space-y-3 border-t border-zinc-800/60 p-3">
          {/* User */}
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-zinc-500">{user.email}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                onClick={() => track({ action: "ui.sign_out_click" })}
                className="shrink-0 text-xs text-zinc-500 hover:text-zinc-300"
              >
                Sign out
              </button>
            </form>
          </div>

          {/* Version */}
          <p className="text-[10px] text-zinc-700">Controlled pilot v0.1</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto print:overflow-visible">{children}</main>
    </div>
  );
}
