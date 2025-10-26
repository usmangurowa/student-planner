"use client";

import { useChat } from "@ai-sdk/react";
import { useQueryClient } from "@tanstack/react-query";
import type { UIMessage as UIMessageType } from "ai";
import { BotIcon } from "lucide-react";
import { useLocalStorage } from "react-use";

import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  PromptInput,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { CurrentUserProfile, useUser } from "@/hooks/use-user";

import { Message, MessageAvatar, MessageContent } from "./message";
import { Response } from "./response";

export const ChatPanel = () => {
  const { data, isLoading } = useUser();

  if (isLoading || !data) {
    return null;
  }

  return <ChatPanelContent user={data} />;
};

export const ChatPanelContent = ({ user }: { user: CurrentUserProfile }) => {
  const user_timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

  const queryClient = useQueryClient();

  // Only initialize localStorage when we have a valid user ID
  const [chatHistory, setChatHistory] = useLocalStorage<UIMessageType[]>(
    `${user!.id}-chats-history`,
    []
  );

  const { messages, sendMessage, status } = useChat({
    messages: chatHistory || [],
    onFinish: ({ message }) => {
      setChatHistory((prev) => [...(prev || []), message]);

      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });

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
              {messages.map((m) => {
                // Extract text from message parts or content
                let text = "";
                if (
                  Array.isArray((m as unknown as Record<string, unknown>).parts)
                ) {
                  const parts = (m as unknown as Record<string, unknown>)
                    .parts as Array<Record<string, unknown>>;
                  text = parts
                    .filter(
                      (p) => p?.type === "text" && typeof p.text === "string"
                    )
                    .map((p) => p.text as string)
                    .join("");
                } else if (
                  typeof (m as unknown as Record<string, unknown>).content ===
                  "string"
                ) {
                  text = (m as unknown as Record<string, unknown>)
                    .content as string;
                }

                return (
                  <Message from={m.role} key={m.id}>
                    <MessageContent>
                      <Response>{text}</Response>
                    </MessageContent>
                    <MessageAvatar
                      src={user!.avatar || ""}
                      name={m.role === "user" ? user!.display_name || "" : "AI"}
                    />
                  </Message>
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
        onSubmit={async (payload, event) => {
          const text = payload.text?.trim() ?? "";
          if (!text) return;
          event.currentTarget.reset();
          await sendMessage({
            text,
            files:
              (Array.isArray(payload.files) ? payload.files : undefined) ||
              undefined,
            metadata: {
              user_id: user?.id,
              user_name: user?.display_name,
              user_timezone,
            },
          });
        }}
      >
        <PromptInputBody>
          <PromptInputAttachments>
            {(file) => <PromptInputAttachment data={file} />}
          </PromptInputAttachments>
          <PromptInputTextarea placeholder="Ask to schedule, plan tasks, or study times…" />
          <div className="flex items-center justify-end p-1">
            <PromptInputSubmit disabled={status === "streaming"} />
          </div>
        </PromptInputBody>
      </PromptInput>
    </div>
  );
};

export default ChatPanel;
