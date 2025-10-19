"use client";
import { useChat, UIMessage } from "@ai-sdk/react";
import { BotIcon } from "lucide-react";
import { useLocalStorage } from "react-use";
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
import { CurrentUserProfile, useUser } from "@/hooks/use-user";
import { Response } from "./response";
import { useQueryClient } from "@tanstack/react-query";
import { Message, MessageAvatar, MessageContent } from "./message";

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
  const [chatHistory, setChatHistory] = useLocalStorage<UIMessage[]>(
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
            files: (payload.files as any) || undefined,
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
