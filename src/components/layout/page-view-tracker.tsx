"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { useTrack } from "@/lib/use-track";

/**
 * Automatically tracks page views on route changes.
 * Mount once in the app layout.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const track = useTrack();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    // Skip duplicate fires for the same path
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    // Parse route for structured metadata
    const meta: Record<string, unknown> = { path: pathname };

    const matterMatch = pathname.match(/\/matters\/([^/]+)/);
    if (matterMatch) {
      meta.matterId = matterMatch[1];
      if (pathname.endsWith("/intake")) meta.tab = "intake";
      else if (pathname.endsWith("/analysis")) meta.tab = "analysis";
      else if (pathname.endsWith("/documents")) meta.tab = "documents";
    }

    track({ action: "page.view", meta });
  }, [pathname, track]);

  return null;
}
