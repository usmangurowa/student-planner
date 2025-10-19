import { Hono } from "hono";
import { hc } from "hono/client";
import {
  streamText,
  convertToModelMessages,
  generateText,
  stepCountIs,
} from "ai";

import { env } from "../env";
import {
  model,
  generateSystemPrompt,
  readCalendarTool,
  createEventTool,
  updateEventTool,
} from "@/lib/ai";

export const app = new Hono()
  .basePath("/api")
  .get("/", (c) => c.text("Hello World"))
  // Streaming chat endpoint for Vercel AI SDK useChat
  .post("/chat", async (c) => {
    const body = await c.req.json();
    const uiMessages = Array.isArray(body?.messages) ? body.messages : [];

    let user_id = "";
    let user_name = "";
    let user_timezone = "UTC";

    const lastMessage = uiMessages[uiMessages.length - 1];
    if (lastMessage && lastMessage.metadata) {
      user_id = lastMessage.metadata.user_id;
      user_name = lastMessage.metadata.user_name;
      user_timezone = lastMessage.metadata.user_timezone;
    }

    let modelMessages = convertToModelMessages(uiMessages);

    try {
      const result = streamText({
        model,
        messages: modelMessages,
        system: generateSystemPrompt({ user_id, user_name, user_timezone }),
        tools: {
          readCalendar: readCalendarTool,
          createEvent: createEventTool,
          updateEvent: updateEventTool,
        },
        stopWhen: stepCountIs(5),
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
