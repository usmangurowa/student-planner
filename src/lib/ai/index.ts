// AI Model
export { model } from "./model";

// System Prompt
export { generateSystemPrompt } from "./system-prompt";
export type { SystemPromptInput } from "./system-prompt";

// Chat Handler
export { handleChat } from "./chat-handler";
export type { ChatHandlerInput } from "./chat-handler";

// Tools
export { readCalendarTool } from "./tools/read-calendar";
export { createEventTool } from "./tools/create-event";
export { updateEventTool } from "./tools/update-event";
