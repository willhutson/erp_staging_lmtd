import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/admin";

  if (code) {
    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.redirect(`${origin}/login?error=auth_not_configured`);
    }
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to database
      try {
        // Check if user exists by supabaseId or email
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { supabaseId: data.user.id },
              { email: data.user.email }
            ]
          }
        });

        if (existingUser) {
          // Update supabaseId if not set
          if (!existingUser.supabaseId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { supabaseId: data.user.id }
            });
          }
        }
        // Note: New users must be created via admin panel, not auto-created on login
      } catch (e) {
        console.error("User sync error:", e);
        // Continue to dashboard even if sync fails
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
