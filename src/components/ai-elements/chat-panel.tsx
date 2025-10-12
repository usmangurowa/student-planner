"use client";
import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { BotIcon } from "lucide-react";

import {
  PromptInput,
  PromptInputAttachments,
  PromptInputAttachment,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
// removed client import; useChat handles API calls

type ChatMessage = { role: "user" | "assistant"; content: string };

export const ChatPanel = () => {
  const { messages, sendMessage, status } = useChat();

  return (
    <div className="flex h-full flex-col">
      <Conversation className="min-h-0 flex-1">
        <ConversationContent>
          {messages.length === 0 ? (
            <ConversationEmptyState
              title="Ask the planner AI"
              description="Plan assignments, schedule study, or create tasks."
              icon={<BotIcon className="size-5" />}
            />
          ) : (
            <div className="space-y-3">
              {messages.map((m, i: number) => {
                const parts = (m as any).parts as Array<any> | undefined;
                const text = Array.isArray(parts)
                  ? parts
                      .filter(
                        (p) => p?.type === "text" && typeof p.text === "string"
                      )
                      .map((p) => p.text)
                      .join("")
                  : ((m as any).content ?? "");
                return (
                  <div key={i} className="text-sm leading-6">
                    <div className="text-muted-foreground mb-0.5 text-xs">
                      {(m as any).role === "user" ? "You" : "Stuplan"}
                    </div>
                    <div className="whitespace-pre-wrap">{text}</div>
                  </div>
                );
              })}
              {(status === "submitted" || status === "streaming") && (
                <div className="text-muted-foreground text-sm">Thinking…</div>
              )}
            </div>
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <PromptInput
        accept="image/*"
        className="bg-background"
        maxFileSize={5 * 1024 * 1024}
        maxFiles={4}
        multiple
        onError={(e) => console.warn(e)}
        onSubmit={async (payload) => {
          const text = payload.text?.trim() ?? "";
          if (!text) return;
          await sendMessage({
            text,
            files: (payload.files as any) || undefined,
          });
        }}
      >
        <PromptInputBody>
          <PromptInputAttachments>
            {(file) => <PromptInputAttachment data={file} />}
          </PromptInputAttachments>
          <PromptInputTextarea placeholder="Ask to schedule, plan tasks, or study times…" />
          <div className="flex items-center justify-end p-1">
            <PromptInputSubmit />
          </div>
        </PromptInputBody>
      </PromptInput>
    </div>
  );
};

export default ChatPanel;
