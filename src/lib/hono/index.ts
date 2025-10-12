import { Hono } from "hono";
import { hc } from "hono/client";
import { streamText, convertToModelMessages } from "ai";
import { google } from "@ai-sdk/google";

import { env } from "../env";
import { generateAiResponse, systemPrompt } from "@/lib/ai";
import { z } from "zod";
import { CreateEventSchema, ReadCalendarSchema } from "@/lib/ai/tools";
import { createClient } from "@/lib/supabase/client";
export const app = new Hono()
  .basePath("/api")
  .get("/", (c) => c.text("Hello World"))
  // Streaming chat endpoint for Vercel AI SDK useChat
  .post("/chat", async (c) => {
    const body = await c.req.json();
    const uiMessages = Array.isArray(body?.messages) ? body.messages : [];
    const modelMessages = convertToModelMessages(uiMessages);

    const result = streamText({
      model: google("gemini-1.5-pro"),
      system: systemPrompt,
      messages: modelMessages,
    });

    return result.toTextStreamResponse();
  })
  .post("/ai", async (c) => {
    try {
      const body = await c.req.json<{
        message: string;
        attachments?: Array<{ name?: string; type?: string; url?: string }>;
        tool?: { name: "create_event" | "read_calendar"; args: unknown } | null;
      }>();

      // Optional: execute tool if requested by client (future: model function-calling parser)
      if (body.tool?.name === "create_event") {
        const parsed = CreateEventSchema.safeParse(body.tool.args);
        if (!parsed.success)
          return c.json({ error: "Invalid create_event args" }, 400);
        const supabase = createClient();
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) return c.json({ error: "Not authenticated" }, 401);
        const input = parsed.data;
        const payload = {
          title: input.title,
          description: input.description ?? null,
          color: input.color ?? null,
          location: input.location ?? null,
          category: input.type === "task" ? "task" : "event",
          start: input.type === "task" ? input.start : input.start,
          end: input.end,
          allDay: input.type === "event" ? false : null,
          created_by: user.id,
        } as const;
        const { error } = await supabase.from("events").insert(payload);
        if (error) return c.json({ error: error.message }, 500);
      }

      if (body.tool?.name === "read_calendar") {
        const parsed = ReadCalendarSchema.safeParse(body.tool.args);
        if (!parsed.success)
          return c.json({ error: "Invalid read_calendar args" }, 400);
        const supabase = createClient();
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) return c.json({ error: "Not authenticated" }, 401);
        const q = supabase.from("events").select("*").eq("created_by", user.id);
        const { from, to, onlyTasks } = parsed.data;
        if (onlyTasks) q.eq("category", "task");
        if (from) q.gte("start", from);
        if (to) q.lte("end", to);
        const { data, error } = await q;
        if (error) return c.json({ error: error.message }, 500);
        return c.json({ reply: JSON.stringify(data) });
      }

      const result = await generateAiResponse({
        message: body?.message ?? "",
        attachments: body?.attachments,
      });
      return c.json(result);
    } catch (e) {
      return c.json({ reply: "Sorry, something went wrong." }, 500);
    }
  });

export type Client = ReturnType<typeof hc<typeof app>>;

export const hcWithType = (...args: Parameters<typeof hc>): Client =>
  hc<typeof app>(...args);

export const client = hcWithType(`${env.VERCEL_URL}/api`);
