import { Hono } from "hono";
import { hc } from "hono/client";
import { streamText, convertToModelMessages, generateText } from "ai";

import { env } from "../env";
import { model, systemPrompt } from "@/lib/ai";

export const app = new Hono()
  .basePath("/api")
  .get("/", (c) => c.text("Hello World"))
  // Streaming chat endpoint for Vercel AI SDK useChat
  .post("/chat", async (c) => {
    const body = await c.req.json();
    const uiMessages = Array.isArray(body?.messages) ? body.messages : [];
    let modelMessages = convertToModelMessages(uiMessages);

    const hasSystemPrompt = modelMessages.some((msg) => msg.role === "system");

    if (!hasSystemPrompt) {
      modelMessages = [
        {
          role: "system",
          content: systemPrompt,
        },
        ...modelMessages,
      ];
    }

    try {
      const result = await streamText({
        model,
        messages: modelMessages,
      });

      return result.toUIMessageStreamResponse();
    } catch (error) {
      return c.json({ error: "Failed to generate response." }, 500);
    }
  });

export type Client = ReturnType<typeof hc<typeof app>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);

export const client = hcWithType(`${env.VERCEL_URL}/api`);
