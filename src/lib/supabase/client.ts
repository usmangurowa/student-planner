import { createBrowserClient } from "@supabase/ssr";

import { env } from "../env";
import type { Database } from "./database.types";
export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
