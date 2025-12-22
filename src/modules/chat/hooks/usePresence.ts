"use client";

/**
 * Presence Management Hook
 *
 * Manages the current user's presence status:
 * - Sets online when page is focused
 * - Sets away when page is blurred or idle
 * - Sets offline when page is unloaded
 * - Sends periodic heartbeats
 *
 * @module chat/hooks/usePresence
 */

import { useEffect, useCallback, useRef } from "react";
import {
  setOnline,
  setAway,
  setOffline,
  heartbeat,
} from "../actions/presence-actions";

// ============================================
// TYPES
// ============================================

interface UsePresenceOptions {
  userId: string;
  idleTimeoutMs?: number; // Time before setting away
  heartbeatIntervalMs?: number; // Heartbeat interval
  enabled?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const DEFAULT_HEARTBEAT_INTERVAL = 60 * 1000; // 1 minute

// ============================================
// HOOK
// ============================================

export function usePresence({
  userId,
  idleTimeoutMs = DEFAULT_IDLE_TIMEOUT,
  heartbeatIntervalMs = DEFAULT_HEARTBEAT_INTERVAL,
  enabled = true,
}: UsePresenceOptions) {
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isOnlineRef = useRef(false);

  // Go online
  const goOnline = useCallback(async () => {
    if (!enabled) return;

    try {
      await setOnline(userId);
      isOnlineRef.current = true;
    } catch (error) {
      console.error("Failed to set online:", error);
    }
  }, [userId, enabled]);

  // Go away
  const goAway = useCallback(async () => {
    if (!enabled) return;

    try {
      await setAway(userId);
      isOnlineRef.current = false;
    } catch (error) {
      console.error("Failed to set away:", error);
    }
  }, [userId, enabled]);

  // Go offline
  const goOffline = useCallback(async () => {
    if (!enabled) return;

    try {
      await setOffline(userId);
      isOnlineRef.current = false;
    } catch (error) {
      console.error("Failed to set offline:", error);
    }
  }, [userId, enabled]);

  // Send heartbeat
  const sendHeartbeat = useCallback(async () => {
    if (!enabled || !isOnlineRef.current) return;

    try {
      await heartbeat(userId);
    } catch (error) {
      console.error("Heartbeat failed:", error);
    }
  }, [userId, enabled]);

  // Reset idle timer
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
    }

    // If we were away, go back online
    if (!isOnlineRef.current && enabled) {
      goOnline();
    }

    // Set new idle timer
    idleTimerRef.current = setTimeout(() => {
      goAway();
    }, idleTimeoutMs);
  }, [idleTimeoutMs, goOnline, goAway, enabled]);

  // Handle visibility change
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      goOnline();
      resetIdleTimer();
    } else {
      goAway();
    }
  }, [goOnline, goAway, resetIdleTimer]);

  // Handle before unload
  const handleBeforeUnload = useCallback(() => {
    // Use sendBeacon for reliable delivery
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/chat/presence",
        JSON.stringify({ userId, status: "OFFLINE" })
      );
    } else {
      // Fallback - may not complete
      goOffline();
    }
  }, [userId, goOffline]);

  // Initialize presence tracking
  useEffect(() => {
    if (!enabled) return;

    // Go online on mount
    goOnline();

    // Start idle timer
    resetIdleTimer();

    // Start heartbeat
    heartbeatTimerRef.current = setInterval(sendHeartbeat, heartbeatIntervalMs);

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // User activity events reset idle timer
    const activityEvents = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

    const handleActivity = () => {
      resetIdleTimer();
    };

    activityEvents.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Cleanup
    return () => {
      // Go offline
      goOffline();

      // Clear timers
      if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
      }
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
      }

      // Remove event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);

      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [
    enabled,
    goOnline,
    goOffline,
    resetIdleTimer,
    handleVisibilityChange,
    handleBeforeUnload,
    sendHeartbeat,
    heartbeatIntervalMs,
  ]);

  return {
    goOnline,
    goAway,
    goOffline,
  };
}
