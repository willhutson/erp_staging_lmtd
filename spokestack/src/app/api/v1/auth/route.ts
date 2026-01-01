/**
 * Auth routes documentation endpoint
 *
 * Authentication is handled by Supabase directly:
 * - Login: Use Supabase client signInWithPassword or signInWithOAuth
 * - Logout: Use Supabase client signOut
 * - Session refresh: Automatic via Supabase middleware
 *
 * This endpoint returns auth configuration info
 */

import { NextResponse } from "next/server";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      provider: "supabase",
      endpoints: {
        me: "/api/v1/auth/me",
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
      },
      methods: {
        login: "Use Supabase client auth.signInWithPassword()",
        logout: "Use Supabase client auth.signOut()",
        oauth: "Use Supabase client auth.signInWithOAuth()",
        magicLink: "Use Supabase client auth.signInWithOtp()",
      },
    },
  });
}
