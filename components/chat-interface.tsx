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
import { Loader2 } from "lucide-react";
import {
  ChatMessage,
  ChatThread,
  getStoredThread,
  saveStoredThread,
} from "@/lib/chat-storage";
import { v4 as uuidv4 } from "uuid";

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

  // Load thread messages on mount or when threadId changes
  useEffect(() => {
    setActiveThreadId(threadId);
    if (threadId) {
      const thread = getStoredThread(threadId);
      if (thread) {
        setMessages(thread.messages || []);
      }
    } else {
      setMessages([]);
    }
  }, [threadId]);

  // Listen for new chat requests from sidebar
  useEffect(() => {
    const handleNewChatEvent = () => {
      setActiveThreadId(undefined);
      setMessages([]);
      window.history.replaceState(null, "", "/");
    };
    window.addEventListener("new_chat_requested", handleNewChatEvent);
    return () => window.removeEventListener("new_chat_requested", handleNewChatEvent);
  }, []);

  const handleSendMessage = async (text: string) => {
    if (!text || isLoading) return;

    const currentId = activeThreadId || uuidv4();
    if (!activeThreadId) {
      setActiveThreadId(currentId);
      // Update URL silently or navigate to thread
      window.history.replaceState(null, "", `/chat/${currentId}`);
    }

    const userMsg: ChatMessage = {
      role: "user",
      content: text,
      model: selectedModel,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    // Initial title derived from first message
    const threadTitle =
      messages.length > 0
        ? getStoredThread(currentId)?.title || text.slice(0, 30)
        : text.length > 30
        ? text.slice(0, 30) + "..."
        : text;

    // Save user message immediately to thread history
    const currentThread: ChatThread = {
      id: currentId,
      title: threadTitle,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: updatedMessages,
    };
    saveStoredThread(currentThread);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages,
          model: selectedModel, // Sends the currently selected model from dropdown
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

      // Save assistant response to thread history
      saveStoredThread({
        ...currentThread,
        updatedAt: Date.now(),
        messages: finalMessages,
      });
    } catch (error: any) {
      console.error("Error sending message:", error);
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${error?.message || "Failed to reach AI service"}`,
        model: selectedModel,
      };
      const finalMessages = [...updatedMessages, errorMsg];
      setMessages(finalMessages);
      saveStoredThread({
        ...currentThread,
        updatedAt: Date.now(),
        messages: finalMessages,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 overflow-y-auto">
          <main className="h-full flex flex-col items-center justify-end md:justify-center max-w-4xl mx-auto w-full px-4 -mt-20">
            <h1 className="text-3xl font-normal mb-8 tracking-tight text-white">
              What can I help with ?
            </h1>
            <InputContainer onSendMessage={handleSendMessage} isLoading={isLoading} />
          </main>
        </div>
      ) : (
        <div className="flex flex-col flex-1 h-full w-full min-h-0 relative">
          <Conversation className="h-full flex-1 overflow-y-auto">
            <ConversationContent className="max-w-4xl mx-auto px-4 pt-6 pb-24 flex flex-col gap-6">
              {messages.map((msg, index) => (
                <Message key={index} from={msg.role}>
                  <MessageContent>
                    <MessageResponse>{msg.content}</MessageResponse>
                  </MessageContent>
                </Message>
              ))}

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

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent pt-4">
            <InputContainer onSendMessage={handleSendMessage} isLoading={isLoading} />
          </div>
        </div>
      )}
    </div>
  );
};

