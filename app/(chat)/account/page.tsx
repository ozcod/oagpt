"use client";

import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import {
  User,
  Mail,
  ShieldCheck,
  Calendar,
  LogOut,
  Sparkles,
  Github,
  Globe,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;
  const name = user?.name || "User";
  const email = user?.email || "No email available";
  const image = user?.image;
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString()
    : "Recently";

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
    <div className="flex flex-col flex-1 h-full w-full overflow-y-auto p-6 max-w-4xl mx-auto text-[#ececec]">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
          <User className="h-8 w-8 text-purple-400 shrink-0" />
          Account Settings
        </h1>
        <p className="text-[#a1a1a1] text-sm">
          Manage your personal profile and account credentials.
        </p>
      </div>

      {/* User Card */}
      <div className="bg-[#2a2a2a] rounded-2xl border border-[#3a3a3a] p-6 mb-8 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <Avatar className="h-20 w-20 rounded-2xl border-2 border-purple-500/40 shadow-md">
            {image && <AvatarImage src={image} alt={name} className="object-cover" />}
            <AvatarFallback className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold text-2xl rounded-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center sm:text-left flex flex-col gap-1.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-white">{name}</h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 text-xs font-semibold border border-purple-500/20">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                Active Member
              </span>
            </div>
            <p className="text-sm text-[#b4b4b4] flex items-center justify-center sm:justify-start gap-2">
              <Mail className="h-4 w-4 text-[#888]" />
              {email}
            </p>
          </div>
        </div>
      </div>

      {/* Account Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#252525] p-5 rounded-xl border border-[#333] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#888] uppercase tracking-wider">
            <User className="h-4 w-4 text-blue-400" />
            Full Name
          </div>
          <div className="text-base font-medium text-white">{name}</div>
        </div>

        <div className="bg-[#252525] p-5 rounded-xl border border-[#333] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#888] uppercase tracking-wider">
            <Mail className="h-4 w-4 text-purple-400" />
            Email Address
          </div>
          <div className="text-base font-medium text-white">{email}</div>
        </div>

        <div className="bg-[#252525] p-5 rounded-xl border border-[#333] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#888] uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-green-400" />
            Account Status
          </div>
          <div className="text-base font-medium text-green-400 flex items-center gap-1.5">
            Verified & Protected
          </div>
        </div>

        <div className="bg-[#252525] p-5 rounded-xl border border-[#333] flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#888] uppercase tracking-wider">
            <Calendar className="h-4 w-4 text-amber-400" />
            Member Since
          </div>
          <div className="text-base font-medium text-white">{createdAt}</div>
        </div>
      </div>

      {/* Sign Out Card */}
      <div className="bg-[#252525] p-6 rounded-xl border border-[#333] flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">Sign Out of Session</h3>
          <p className="text-xs text-[#888] mt-0.5">
            Log out from your current browser session safely.
          </p>
        </div>
        <Button
          onClick={handleSignOut}
          variant="destructive"
          className="bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 font-medium px-4"
        >
          <LogOut className="h-4 w-4 mr-2" /> Sign Out
        </Button>
      </div>
    </div>
  );
}
