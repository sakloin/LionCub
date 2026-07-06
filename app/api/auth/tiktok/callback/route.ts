import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// TikTok OAuth 2.0 callback — exchanges code for access token
// Activated once TikTok approves the app review
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    console.error("[tiktok/callback] OAuth error:", error);
    return NextResponse.redirect(new URL("/admin?error=tiktok_auth", req.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/admin?error=tiktok_no_code", req.url));
  }

  const clientKey = process.env.TIKTOK_CLIENT_KEY;
  const clientSecret = process.env.TIKTOK_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://lioncub.pe"}/api/auth/tiktok/callback`;

  if (!clientKey || !clientSecret) {
    console.error("[tiktok/callback] Missing TIKTOK_CLIENT_KEY or TIKTOK_CLIENT_SECRET");
    return NextResponse.redirect(new URL("/admin?error=tiktok_config", req.url));
  }

  try {
    const tokenRes = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenRes.ok || tokenData.error) {
      console.error("[tiktok/callback] Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/admin?error=tiktok_token", req.url));
    }

    // Log the token so admin can copy it into n8n credentials
    // In production replace this with secure storage or n8n webhook
    console.info("[tiktok/callback] Access token obtained. open_id:", tokenData.open_id);
    console.info("[tiktok/callback] access_token:", tokenData.access_token);
    console.info("[tiktok/callback] refresh_token:", tokenData.refresh_token);

    return NextResponse.redirect(
      new URL(`/admin?tiktok=connected&open_id=${tokenData.open_id}`, req.url)
    );
  } catch (err) {
    console.error("[tiktok/callback] Unexpected error:", err);
    return NextResponse.redirect(new URL("/admin?error=tiktok_unexpected", req.url));
  }
}
