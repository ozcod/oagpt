"use client";

import { useState } from "react";
import { Search, LayoutGrid, Plus } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SidebarFooterComponent } from "./sidebar-footer";
import ThreadsLists from "./threads-list";
import { SearchModal } from "./search-modal";

import { useSidebar } from "@/components/ui/sidebar";

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [searchOpen, setSearchOpen] = useState(false);
  const router = useRouter();
  const { state, setOpen } = useSidebar();

  const handleSidebarClick = () => {
    if (state === "collapsed") {
      setOpen(true);
    }
  };

  return (
    <>
      <Sidebar
        collapsible="icon"
        onClick={handleSidebarClick}
        className={cn(
          "bg-[#171717] border-none text-sidebar-foreground transition-all duration-300 ease-in-out",
          state === "collapsed" && "cursor-pointer hover:bg-[#202020]"
        )}
        {...props}
      >
        <SidebarHeader className="px-2 pt-3.5">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo-white.png"
                alt="Logo"
                width={30}
                height={30}
                className="rounded-lg shrink-0"
                priority
              />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <SidebarTrigger className="hover:bg-[#2f2f2f] text-[#b4b4b4] h-8 w-8 transition-colors" />
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-1 mt-2">
          <SidebarGroup className="p-0">
            <SidebarMenu className="gap-0">
              <SidebarMenuItem className="flex relative">
                <SidebarMenuButton
                  tooltip="New chat"
                  onClick={() => {
                    window.dispatchEvent(new Event("new_chat_requested"));
                    router.push("/");
                  }}
                  className={cn(
                    "h-9 transition-colors text-[#ececec] hover:bg-[#2f2f2f] data-[state=open]:bg-[#2f2f2f] cursor-pointer",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  )}
                >
                  <Plus className="h-4.5 w-4.5 shrink-0" />
                  <span className="ml-3 text-[14px] font-normal group-data-[collapsible=icon]:hidden">
                    New chat
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="flex relative">
                <SidebarMenuButton
                  tooltip="Search"
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    "h-9 transition-colors text-[#ececec] hover:bg-[#2f2f2f] data-[state=open]:bg-[#2f2f2f]",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 cursor-pointer"
                  )}
                >
                  <Search className="h-4.5 w-4.5 shrink-0" />
                  <span className="ml-3 text-[14px] font-normal group-data-[collapsible=icon]:hidden">
                    Search
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem className="flex relative">
                <SidebarMenuButton
                  tooltip="Images"
                  asChild
                  className={cn(
                    "h-9 transition-colors text-[#ececec] hover:bg-[#2f2f2f] data-[state=open]:bg-[#2f2f2f]",
                    "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
                  )}
                >
                  <Link href="/images">
                    <LayoutGrid className="h-4.5 w-4.5 shrink-0" />
                    <span className="ml-3 text-[14px] font-normal group-data-[collapsible=icon]:hidden">
                      Images
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>

          <ThreadsLists />
        </SidebarContent>

        <SidebarFooter>
          <SidebarFooterComponent />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <SearchModal open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
