"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import InputContainer from "./input-container";
import { useModel } from "@/context/model-context";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import { useRef } from "react";
import { Loader2, RotateCcw, Square, Pencil, AlertCircle, Check, X } from "lucide-react";
import {
  ChatMessage,
  ChatThread,
  getStoredThread,
  saveStoredThread,
} from "@/lib/chat-storage";
import { v4 as uuidv4 } from "uuid";
import { authClient } from "@/lib/auth-client";
import { useTypewriter } from "@/components/typewriter-text";
import { Button } from "@/components/ui/button";

function StructuredErrorMessage({
  content,
  onRetry,
}: {
  content: string;
  onRetry?: () => void;
}) {
  const cleanText = content.replace(/^Error:\s*/i, "").trim();

  return (
    <div className="flex flex-col gap-2.5 p-4 rounded-xl bg-[#2b1b1b] border border-red-500/30 text-[#fca5a5] max-w-lg my-2 shadow-lg">
      <div className="flex items-center gap-2 font-medium text-red-400 text-sm">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>An error occurred while generating a response</span>
      </div>
      <p className="text-xs text-[#f87171]/90 leading-relaxed font-normal">
        {cleanText || "Something went wrong. Please check your connection or try again with another model."}
      </p>
      {onRetry && (
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Try again</span>
          </button>
        </div>
      )}
    </div>
  );
}

function AssistantMessageContent({ content, isNew }: { content: string; isNew: boolean }) {
  const typedText = useTypewriter(content, 25, isNew);
  return <MessageResponse>{typedText}</MessageResponse>;
}

interface ChatInterfaceProps {
  threadId?: string;
}

export const ChatInterfaceNew = ({ threadId }: ChatInterfaceProps) => {
  const { selectedModel } = useModel();
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(
    threadId
  );
  const [isEditingLast, setIsEditingLast] = useState(false);
  const [editingText, setEditingText] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || session?.user?.email;
  const username = session?.user?.name || "there";

  const lastUserIndex = messages.findLastIndex((m) => m.role === "user");

  // Load thread messages on mount or when threadId/userId changes
  useEffect(() => {
    setActiveThreadId(threadId);
    if (threadId && userId) {
      const thread = getStoredThread(threadId, userId);
      if (thread) {
        setMessages(thread.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [threadId, userId]);

  // Listen for new chat requests from sidebar
  useEffect(() => {
    const handleNewChatEvent = () => {
      setActiveThreadId(undefined);
      setMessages([]);
      setIsEditingLast(false);
      window.history.replaceState(null, "", "/");
    };
    window.addEventListener("new_chat_requested", handleNewChatEvent);
    return () => window.removeEventListener("new_chat_requested", handleNewChatEvent);
  }, []);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleSendMessage = async (text: string, currentHistory?: ChatMessage[]) => {
    if (!text || isLoading) return;

    const currentId = activeThreadId || uuidv4();
    if (!activeThreadId) {
      setActiveThreadId(currentId);
      window.history.replaceState(null, "", `/chat/${currentId}`);
    }

    const baseMessages = currentHistory !== undefined ? currentHistory : messages;
    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      model: selectedModel,
    };
    const updatedMessages = [...baseMessages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);
    setIsEditingLast(false);

    const threadTitle =
      baseMessages.length > 0
        ? (userId ? getStoredThread(currentId, userId)?.title : null) || text.slice(0, 30)
        : text.length > 30
        ? text.slice(0, 30) + "..."
        : text;

    const currentThread: ChatThread = {
      id: currentId,
      title: threadTitle,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: updatedMessages,
    };

    if (userId) {
      saveStoredThread(currentThread, userId);
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel,
        }),
      });

      const data = await response.json();

      let assistantMsg: ChatMessage;
      if (data.error) {
        assistantMsg = {
          role: "assistant",
          content: `Error: ${data.error}`,
          model: selectedModel,
        };
      } else {
        assistantMsg = {
          role: "assistant",
          content: data.content,
          model: selectedModel,
        };
      }

      const finalMessages = [...updatedMessages, assistantMsg];
      setMessages(finalMessages);

      if (userId) {
        saveStoredThread(
          {
            ...currentThread,
            updatedAt: Date.now(),
            messages: finalMessages,
          },
          userId
        );
      }
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.log("Stream generation aborted by user.");
        return;
      }
      console.error("Error sending message:", error);
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${error?.message || "Failed to reach AI service"}`,
        model: selectedModel,
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      if (userId) {
        saveStoredThread(
          {
            ...currentThread,
            updatedAt: Date.now(),
            messages: finalMessages,
          },
          userId
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetryLast = () => {
    if (isLoading || lastUserIndex === -1) return;
    const lastUserMsg = messages[lastUserIndex];
    const historyBeforeLastUser = messages.slice(0, lastUserIndex);
    handleSendMessage(lastUserMsg.content, historyBeforeLastUser);
  };

  const handleSaveEditLast = () => {
    if (!editingText.trim() || isLoading || lastUserIndex === -1) return;
    const historyBeforeLastUser = messages.slice(0, lastUserIndex);
    handleSendMessage(editingText.trim(), historyBeforeLastUser);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-y-auto">
          <main className="h-full flex flex-col items-center justify-end md:justify-center max-w-4xl mx-auto w-full px-4 -mt-20">
            <h1 className="text-3xl font-normal mb-8 tracking-tight text-white text-center">
              Hey, {username}. Ready to dive in?
            </h1>
            <InputContainer onSendMessage={(t) => handleSendMessage(t)} isLoading={isLoading} />
          </main>
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 relative">
          <Conversation className="h-full flex-1 overflow-y-auto">
            <ConversationContent className="max-w-4xl mx-auto px-4 pt-6 pb-24 flex flex-col gap-6">
              {messages.map((msg, index) => {
                const isLastUser = index === lastUserIndex;
                const isErrorMessage = msg.role === "assistant" && msg.content.startsWith("Error:");

                return (
                  <div key={index} className="flex flex-col gap-1">
                    <Message from={msg.role}>
                      <MessageContent>
                        {msg.role === "assistant" ? (
                          isErrorMessage ? (
                            <StructuredErrorMessage
                              content={msg.content}
                              onRetry={handleRetryLast}
                            />
                          ) : (
                            <AssistantMessageContent
                              content={msg.content}
                              isNew={index === messages.length - 1}
                            />
                          )
                        ) : isLastUser && isEditingLast ? (
                          <div className="flex flex-col gap-2 w-full min-w-[280px] sm:min-w-[400px]">
                            <textarea
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              className="w-full bg-[#2a2a2a] text-white p-3 rounded-xl border border-[#444] text-sm focus:outline-none focus:border-zinc-400 resize-none min-h-[80px]"
                              autoFocus
                            />
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setIsEditingLast(false)}
                                className="px-3 py-1 rounded-lg text-xs font-medium text-[#aaa] hover:text-white hover:bg-[#333] transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <X className="h-3.5 w-3.5" />
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditLast}
                                className="px-3 py-1 rounded-lg bg-white text-black hover:bg-zinc-200 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Save & Submit
                              </button>
                            </div>
                          </div>
                        ) : (
                          <MessageResponse>{msg.content}</MessageResponse>
                        )}
                      </MessageContent>
                    </Message>

                    {/* Show Edit / Retry icons ONLY for the LAST user message */}
                    {isLastUser && !isEditingLast && !isLoading && (
                      <div className="flex items-center justify-end gap-1.5 px-1 mt-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingText(msg.content);
                            setIsEditingLast(true);
                          }}
                          className="p-1 rounded text-[#888] hover:text-white hover:bg-[#333] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Edit last message"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleRetryLast}
                          className="p-1 rounded text-[#888] hover:text-white hover:bg-[#333] transition-colors flex items-center gap-1 text-[11px] cursor-pointer"
                          title="Refresh last response"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Refresh</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <Message from="assistant">
                  <MessageContent>
                    <div className="flex items-center gap-2 text-muted-foreground py-1 px-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Thinking with {selectedModel}...</span>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </ConversationContent>
            <ConversationScrollButton />
          </Conversation>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-4 flex flex-col items-center">
            {isLoading && (
              <div className="mb-2">
                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="sm"
                  className="bg-[#2f2f2f] text-white border-[#424242] hover:bg-[#3f3f3f] text-xs h-8 px-3 rounded-full flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Square className="h-3.5 w-3.5 text-red-400 fill-red-400" />
                  <span>Stop generating</span>
                </Button>
              </div>
            )}
            <InputContainer onSendMessage={(t) => handleSendMessage(t)} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

