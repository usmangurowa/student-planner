import { type EmailOtpType } from "@supabase/supabase-js";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

import { createClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const nextParam = searchParams.get("next");
  const nextUrl: Route =
    nextParam && nextParam.startsWith("/") ? (nextParam as Route) : "/";

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // redirect user to specified redirect URL or root of app
      redirect(nextUrl);
    } else {
      // redirect to error page with specific error information
      const errorParams = new URLSearchParams({
        error: error.message || "verification_failed",
        error_description:
          error.message || "Failed to verify the authentication token",
      });
      redirect(`/auth/confirm/error?${errorParams.toString()}`);
    }
  } else {
    // redirect to error page for missing parameters
    const errorParams = new URLSearchParams({
      error: "invalid_request",
      error_description: "Missing required authentication parameters",
    });
    redirect(`/auth/confirm/error?${errorParams.toString()}`);
  }
}
