import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { env } from "../env";
import type { Database } from "./database.types";
export const updateSession = async (request: NextRequest) => {
  let supabase_response = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabase_response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabase_response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    // Refresh the auth token
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const pathname = request.nextUrl.pathname;

    // Define protected routes
    const protected_routes = [
      "/calendar",
      "/tasks",
      "/reminders",
      "/notifications",
    ];
    const is_protected_route = protected_routes.some((route) =>
      pathname.startsWith(route)
    );

    // Redirect to login if accessing protected route without session
    if (!session && is_protected_route) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (session) {
      const user = session.user;
      const email_confirmed = Boolean(
        (user as { email_confirmed_at?: string | null }).email_confirmed_at
      );
      const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
      const profile_complete = Boolean(
        (metadata as { profile_complete?: boolean }).profile_complete
      );
      const has_display_name = Boolean(
        (metadata as { display_name?: string }).display_name
      );

      const on_auth_route = pathname.startsWith("/auth");
      const on_onboarding = pathname.startsWith("/onboarding");
      const on_login_or_register =
        pathname === "/login" || pathname === "/register";

      // Enforce email confirmation before accessing app (except auth routes)
      if (!email_confirmed && !on_auth_route) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/confirm-email";
        return NextResponse.redirect(url);
      }

      // Gate onboarding: require profileComplete and displayName
      if (
        email_confirmed &&
        (!profile_complete || !has_display_name) &&
        !on_onboarding &&
        !on_auth_route
      ) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        return NextResponse.redirect(url);
      }

      // If authenticated and on login/register or root, smart-redirect
      if (on_login_or_register || pathname === "/") {
        const url = request.nextUrl.clone();
        if (!email_confirmed) {
          url.pathname = "/auth/confirm-email";
        } else if (!profile_complete || !has_display_name) {
          url.pathname = "/onboarding";
        } else {
          url.pathname = "/calendar";
        }
        return NextResponse.redirect(url);
      }
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Continue with the request even if auth check fails
  }

  return supabase_response;
};
