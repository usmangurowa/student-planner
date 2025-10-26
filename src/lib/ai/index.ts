// AI Model
export { model } from "./model";

// Chat Handler
export type { ChatHandlerInput } from "./chat-handler";
export { handleChat } from "./chat-handler";

// System Prompt
export type { SystemPromptInput } from "./system-prompt";
export { generateSystemPrompt } from "./system-prompt";

// Tools
export { createEventTool } from "./tools/create-event";
export { readCalendarTool } from "./tools/read-calendar";
export { updateEventTool } from "./tools/update-event";
