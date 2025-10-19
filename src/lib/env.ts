import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const env = (() => {
  try {
    const created = createEnv({
      server: {
        SUPABASE_URL: z.string(),
        SUPABASE_PUBLISHABLE_KEY: z.string(),
        GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
        SUPABASE_SERVICE_ROLE_KEY: z.string(),
      },
      client: {
        NEXT_PUBLIC_SUPABASE_URL: z.string(),
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string(),
      },
      shared: {
        VERCEL_URL: z.string().optional().default("http://localhost:3000"),
      },
      runtimeEnv: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
          process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
        VERCEL_URL: process.env.VERCEL_URL,
        GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      },
    });
    return created;
  } catch (error) {
    throw error;
  }
})();

export { env };
