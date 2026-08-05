"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  User as UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Spinner } from "../ui/spinner";
import { authClient } from "@/lib/auth-client";

export function SidebarFooterComponent() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const name = user?.name || "User";
  const email = user?.email || "";
  const image = user?.image || undefined;
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/auth/signin");
        },
      },
    });
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              {isPending ? (
                <div className="h-8 w-8 text-muted-foreground flex justify-center items-center">
                  <Spinner />
                </div>
              ) : (
                <Avatar className="h-8 w-8 rounded-lg">
                  {image && <AvatarImage src={image} alt={name} />}
                  <AvatarFallback className="bg-purple-700 text-white font-semibold text-xs rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium text-white">{name}</span>
                <span className="truncate text-xs text-[#888]">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-[#888]" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg bg-[#212121] border-[#333] text-white"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-2 py-2 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {image && <AvatarImage src={image} alt={name} />}
                  <AvatarFallback className="bg-purple-700 text-white font-semibold text-xs rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{name}</span>
                  <span className="truncate text-xs text-[#888]">{email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#2f2f2f]">
                <Link href="/upgrade" className="flex items-center gap-2 text-purple-300">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Pro Member</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#2f2f2f]">
                <Link href="/account" className="flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-[#b4b4b4]" />
                  <span>Account</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#2f2f2f]">
                <Link href="/upgrade" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-[#b4b4b4]" />
                  <span>Billing</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="bg-[#333]" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer focus:bg-[#2f2f2f] text-red-400 focus:text-red-400 flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
