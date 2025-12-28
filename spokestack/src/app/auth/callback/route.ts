import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/Admin";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to database
      const user = data.user;
      await prisma.user.upsert({
        where: { supabaseId: user.id },
        update: {
          email: user.email!,
          name: user.user_metadata.name || user.user_metadata.full_name,
          avatarUrl: user.user_metadata.avatar_url,
          lastLoginAt: new Date(),
        },
        create: {
          supabaseId: user.id,
          email: user.email!,
          name: user.user_metadata.name || user.user_metadata.full_name,
          avatarUrl: user.user_metadata.avatar_url,
          lastLoginAt: new Date(),
        },
      });

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
