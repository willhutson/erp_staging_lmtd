import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  saveGoogleCredentials,
} from "@/modules/integrations/google/actions/google-auth";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // organizationId
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=${error}`, request.url)
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=missing_params", request.url)
    );
  }

  try {
    // Exchange the authorization code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Save the credentials
    await saveGoogleCredentials(state, tokens);

    // Redirect back to settings with success message
    return NextResponse.redirect(
      new URL("/settings/integrations?success=google_connected", request.url)
    );
  } catch {
    return NextResponse.redirect(
      new URL("/settings/integrations?error=token_exchange_failed", request.url)
    );
  }
}
