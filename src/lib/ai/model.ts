import { google } from "@ai-sdk/google";

/**
 * Gemini 2.5 Flash model configured for Stuplan
 * This model is optimized for fast streaming responses with tool calling
 */
export const model = google("gemini-2.5-flash");
