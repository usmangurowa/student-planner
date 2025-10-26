import { Hono } from "hono";
import { hc } from "hono/client";

import { handleChat } from "@/lib/ai";

import { env } from "../env";

export const app = new Hono()
  .basePath("/api")
  .get("/", (c) => c.text("Hello World"))
  // Streaming chat endpoint for Vercel AI SDK useChat
  .post("/chat", async (c) => {
    const body = await c.req.json();
    const uiMessages = Array.isArray(body?.messages) ? body.messages : [];

    // Extract user metadata from the last message
    const lastMessage = uiMessages[uiMessages.length - 1];
    const user_id = lastMessage?.metadata?.user_id || "";
    const user_name = lastMessage?.metadata?.user_name;
    const user_timezone = lastMessage?.metadata?.user_timezone || "UTC";

    try {
      // Handle the chat request and return the streaming response
      const result = await handleChat({
        messages: uiMessages,
        user_id,
        user_name,
        user_timezone,
      });

      return result.toUIMessageStreamResponse();
    } catch (error) {
      console.error("Chat error:", error);
      return c.json({ error: "Failed to generate response." }, 500);
    }
  });

export type Client = ReturnType<typeof hc<typeof app>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);

export const client = hcWithType(`${env.VERCEL_URL}/api`);
