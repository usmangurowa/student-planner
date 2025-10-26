import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";

import { model } from "./model";
import { generateSystemPrompt } from "./system-prompt";
import { createEventTool } from "./tools/create-event";
import { readCalendarTool } from "./tools/read-calendar";
import { updateEventTool } from "./tools/update-event";

export interface ChatHandlerInput {
  messages: UIMessage[];
  user_id: string;
  user_name?: string;
  user_timezone: string;
}

/**
 * Handles AI chat requests with streaming responses
 * Manages system prompt generation, tool binding, and response streaming
 */
export const handleChat = (input: ChatHandlerInput) => {
  const modelMessages = convertToModelMessages(input.messages);

  const result = streamText({
    model,
    messages: modelMessages,
    system: generateSystemPrompt({
      user_id: input.user_id,
      user_name: input.user_name,
      user_timezone: input.user_timezone,
    }),
    tools: {
      readCalendar: readCalendarTool,
      createEvent: createEventTool,
      updateEvent: updateEventTool,
    },
    stopWhen: stepCountIs(10),
  });

  return result;
};
