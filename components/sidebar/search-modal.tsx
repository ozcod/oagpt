"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChatThread, getStoredThreads } from "@/lib/chat-storage";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const threads = getStoredThreads();

  const filteredThreads = query.trim()
    ? threads.filter((thread) => {
        const q = query.toLowerCase();
        const titleMatch = thread.title.toLowerCase().includes(q);
        const messageMatch = thread.messages.some((m) =>
          m.content.toLowerCase().includes(q)
        );
        return titleMatch || messageMatch;
      })
    : threads;

  const handleSelect = (threadId: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(`/chat/${threadId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#212121] border-[#333] text-[#ececec] max-w-lg p-4 rounded-xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg font-medium text-white flex items-center gap-2">
            <Search className="h-5 w-5 text-[#b4b4b4]" />
            Search Chats
          </DialogTitle>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#676767]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search past conversations..."
            className="w-full bg-[#2f2f2f] text-white pl-9 pr-4 py-2.5 rounded-lg border border-[#424242] focus:outline-none focus:border-zinc-400 text-sm placeholder:text-[#676767]"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1.5 pr-1">
          {filteredThreads.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#888]">
              {query ? "No chats match your search" : "No saved chats found"}
            </div>
          ) : (
            filteredThreads.map((thread) => {
              const matchedMessage = query.trim()
                ? thread.messages.find((m) =>
                    m.content.toLowerCase().includes(query.toLowerCase())
                  )
                : thread.messages[0];

              return (
                <button
                  key={thread.id}
                  onClick={() => handleSelect(thread.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-[#2f2f2f] transition-colors flex items-start gap-3 border border-transparent hover:border-[#383838]"
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-[#b4b4b4] mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {thread.title}
                    </div>
                    {matchedMessage && (
                      <div className="text-xs text-[#888] truncate mt-0.5">
                        {matchedMessage.content}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-[#666] shrink-0">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
