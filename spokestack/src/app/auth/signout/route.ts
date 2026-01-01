import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const url = new URL("/login", request.url);
  return NextResponse.redirect(url);
}
