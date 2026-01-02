/**
 * Delegation of Authority (DOA) Module
 *
 * This module handles automatic task handoff when team members are unavailable.
 * Features:
 * - Delegation profiles (who covers for whom)
 * - Active delegation periods (tied to leave)
 * - Chain resolution (delegate → delegate's delegate → escalate)
 * - Activity logging and handoff briefings
 */

export * from "./types";
export * from "./actions";
