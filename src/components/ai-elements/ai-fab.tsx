"use client";

import { useEffect, useState } from "react";
import { BotIcon, PlusIcon, XIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { client } from "@/lib/hono";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";

type AIFabProps = {
  className?: string;
};

export const AIFab = ({ className }: AIFabProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Keep panel mounted for exit animation
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
    } else {
      const timeout = setTimeout(() => setIsMounted(false), 200);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  return (
    <>
      {/* Floating action button */}
      <Button
        aria-label="Ask AI"
        className={cn(
          "fixed right-6 bottom-6 z-50 h-12 w-12 rounded-full shadow-lg",
          className
        )}
        onClick={() => setIsOpen(true)}
        size="icon"
      >
        <BotIcon className="h-5 w-5" />
      </Button>

      {/* Bottom-centered prompt panel with animation */}
      {isMounted ? (
        <div
          className={cn(
            "fixed inset-x-0 bottom-0 z-50 flex items-end justify-center p-4 transition-all duration-200 ease-out",
            isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          )}
        >
          <div className="relative w-full max-w-2xl">
            <div className="absolute -top-5 -right-8 z-50">
              <Button
                aria-label="Close"
                className="h-7 w-7 rounded-full"
                onClick={() => setIsOpen(false)}
                size="icon"
                variant="secondary"
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>

            <PromptInput
              accept="image/*"
              className="supports-[backdrop-filter]:bg-background/85 backdrop-blur"
              maxFileSize={5 * 1024 * 1024}
              maxFiles={5}
              multiple
              onError={(e) => console.warn(e)}
              onSubmit={async (payload) => {
                const text = payload.text?.trim() ?? "";
                const attachments = (payload.files ?? []).map((f) => ({
                  name: f.filename,
                  type: f.mediaType,
                  url: f.url,
                }));

                try {
                  const res = await client.api.ai.$post({
                    json: { message: text, attachments },
                  });
                  const data = (await res.json()) as { reply: string };
                  console.log("AI reply:", data.reply);
                } catch (err) {
                  console.error("AI error", err);
                }
              }}
            >
              <PromptInputBody>
                <PromptInputAttachments>
                  {(file) => <PromptInputAttachment data={file} />}
                </PromptInputAttachments>

                <PromptInputTextarea placeholder="Ask anything…" />

                <PromptInputToolbar>
                  <div className="flex items-center gap-1">
                    <PromptInputActionMenu>
                      <PromptInputActionMenuTrigger aria-label="Add">
                        <PlusIcon className="size-4" />
                      </PromptInputActionMenuTrigger>
                      <PromptInputActionMenuContent>
                        <PromptInputActionAddAttachments />
                      </PromptInputActionMenuContent>
                    </PromptInputActionMenu>
                  </div>

                  <PromptInputSubmit />
                </PromptInputToolbar>
              </PromptInputBody>
            </PromptInput>
          </div>
        </div>
      ) : null}
    </>
  );
};

export default AIFab;
