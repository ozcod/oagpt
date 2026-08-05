import { ChatInterfaceNew } from "@/components/chat-interface";

export default async function Page({
  params,
}: Readonly<{
  params: Promise<{ thread_id: string }>;
}>) {
  const { thread_id } = await params;
  return <ChatInterfaceNew threadId={thread_id} />;
}
