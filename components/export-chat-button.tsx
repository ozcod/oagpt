"use client";

import { useParams, usePathname } from "next/navigation";
import { Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStoredThread, getStoredThreads } from "@/lib/chat-storage";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export function ExportChatButton() {
  const pathname = usePathname();
  const params = useParams();
  const { data: session } = authClient.useSession();
  const userId = session?.user?.id || session?.user?.email;

  const threadId = params?.thread_id as string | undefined;

  if (pathname === "/upgrade" || !threadId || !userId) {
    return null;
  }

  const thread = getStoredThread(threadId, userId);
  if (!thread || !thread.messages || thread.messages.length === 0) {
    return null;
  }

  const handleExport = () => {
    const markdownContent = thread.messages
      .map(
        (m) =>
          `### ${m.role === "user" ? "User" : "Assistant"}${
            m.model ? ` (${m.model})` : ""
          }\n\n${m.content}`
      )
      .join("\n\n---\n\n");

    const blob = new Blob([markdownContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-export-${thread.id || "session"}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Chat exported as .md file!");
  };

  return (
    <Button
      onClick={handleExport}
      variant="outline"
      size="icon"
      className="bg-[#2f2f2f] text-white border-[#424242] hover:bg-[#3f3f3f] h-9 w-9 shrink-0 cursor-pointer"
      title="Export Chat (.md)"
    >
      <Share2 className="h-4 w-4 text-zinc-300" />
    </Button>
  );
}
