import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slackClient } from "@/lib/slack/client";

// Force dynamic rendering for OAuth callback
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    // Handle errors from Slack
    if (error) {
      console.error("Slack OAuth error:", error);
      return NextResponse.redirect(
        new URL("/settings/integrations?error=slack_denied", request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/settings/integrations?error=invalid_request", request.url)
      );
    }

    // Verify state matches session
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.redirect(
        new URL("/login?error=unauthorized", request.url)
      );
    }

    // Exchange code for access token
    const tokenResponse = await slackClient.exchangeCode(code);

    if (!tokenResponse.ok || !tokenResponse.access_token) {
      console.error("Token exchange failed:", tokenResponse.error);
      return NextResponse.redirect(
        new URL("/settings/integrations?error=token_exchange_failed", request.url)
      );
    }

    // Test the token
    const authTest = await slackClient.testAuth(tokenResponse.access_token);
    if (!authTest.ok) {
      console.error("Auth test failed");
      return NextResponse.redirect(
        new URL("/settings/integrations?error=auth_test_failed", request.url)
      );
    }

    // Save or update workspace
    await db.slackWorkspace.upsert({
      where: { organizationId: session.user.organizationId },
      create: {
        organizationId: session.user.organizationId,
        teamId: tokenResponse.team?.id || "",
        teamName: tokenResponse.team?.name || "",
        accessToken: tokenResponse.access_token,
        botUserId: tokenResponse.bot_user_id || "",
        isActive: true,
      },
      update: {
        teamId: tokenResponse.team?.id || "",
        teamName: tokenResponse.team?.name || "",
        accessToken: tokenResponse.access_token,
        botUserId: tokenResponse.bot_user_id || "",
        isActive: true,
        updatedAt: new Date(),
      },
    });

    // Also update the Integration record
    await db.integration.upsert({
      where: {
        organizationId_provider: {
          organizationId: session.user.organizationId,
          provider: "slack",
        },
      },
      create: {
        organizationId: session.user.organizationId,
        provider: "slack",
        isEnabled: true,
        settings: {
          teamId: tokenResponse.team?.id,
          teamName: tokenResponse.team?.name,
        },
      },
      update: {
        isEnabled: true,
        settings: {
          teamId: tokenResponse.team?.id,
          teamName: tokenResponse.team?.name,
        },
        lastSyncAt: new Date(),
      },
    });

    return NextResponse.redirect(
      new URL("/settings/integrations?success=slack_connected", request.url)
    );
  } catch (error) {
    console.error("Slack OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/settings/integrations?error=unknown", request.url)
    );
  }
}
