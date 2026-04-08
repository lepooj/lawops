"use client";

import { useCallback, useRef, useEffect } from "react";

interface TrackEvent {
  action: string;
  entity?: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}

const FLUSH_INTERVAL = 3000; // 3 seconds
const MAX_BATCH = 15;

/**
 * Client-side event tracker. Batches events and flushes periodically.
 * Fire-and-forget — never blocks the UI.
 */
export function useTrack() {
  const queue = useRef<TrackEvent[]>([]);

  const flush = useCallback(() => {
    if (queue.current.length === 0) return;
    const batch = queue.current.splice(0, MAX_BATCH);
    // navigator.sendBeacon is more reliable on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/track", JSON.stringify(batch));
    } else {
      fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(batch),
        keepalive: true,
      }).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(flush, FLUSH_INTERVAL);
    const handleUnload = () => flush();
    window.addEventListener("beforeunload", handleUnload);
    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleUnload);
      flush(); // flush remaining on unmount
    };
  }, [flush]);

  const track = useCallback(
    (event: TrackEvent) => {
      queue.current.push(event);
      // Flush immediately if batch is full
      if (queue.current.length >= MAX_BATCH) {
        flush();
      }
    },
    [flush],
  );

  return track;
}
