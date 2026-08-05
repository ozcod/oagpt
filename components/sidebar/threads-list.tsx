"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import { cn } from "@/lib/utils";
import {
  ChatThread,
  deleteStoredThread,
  getStoredThreads,
} from "@/lib/chat-storage";

export function ThreadsLists() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const params = useParams();
  const router = useRouter();
  const currentThreadId = params?.thread_id as string | undefined;

  const loadThreads = () => {
    setThreads(getStoredThreads());
  };

  useEffect(() => {
    loadThreads();
    const handleUpdate = () => loadThreads();
    window.addEventListener("chat_threads_updated", handleUpdate);
    return () => window.removeEventListener("chat_threads_updated", handleUpdate);
  }, []);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteStoredThread(id);
    if (currentThreadId === id) {
      router.push("/");
    }
  };

  if (threads.length === 0) {
    return (
      <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel className="text-[12px] font-medium text-[#b4b4b4] px-3 mb-1 mt-4">
          Recent
        </SidebarGroupLabel>
        <div className="px-3 py-2 text-xs text-zinc-500 italic">
          No recent chats
        </div>
      </SidebarGroup>
    );
  }

  return (
    <SidebarGroup className="p-0 group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-[12px] font-medium text-[#b4b4b4] px-3 mb-1 mt-4">
        Recent
      </SidebarGroupLabel>
      <SidebarMenu className="gap-0.5">
        {threads.map((thread) => {
          const isActive = currentThreadId === thread.id;
          return (
            <SidebarMenuItem key={thread.id} className="group/item relative">
              <SidebarMenuButton
                asChild
                className={cn(
                  "h-9 rounded-lg transition-all px-3 cursor-pointer text-[#ececec] hover:bg-[#2f2f2f]",
                  isActive && "bg-[#2f2f2f] font-medium text-white"
                )}
              >
                <Link
                  href={`/chat/${thread.id}`}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className="h-4 w-4 shrink-0 text-[#b4b4b4]" />
                    <span className="truncate text-sm">{thread.title}</span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(e, thread.id)}
                    className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-400 transition-opacity"
                    title="Delete thread"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export default ThreadsLists;
