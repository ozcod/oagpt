"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Check,
  Copy,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function AccountPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = authClient.useSession();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const user = session?.user;
  const name = user?.name || "User";
  const email = user?.email || "";
  const userId = user?.id || "";
  const image = user?.image;
  const isVerified = user?.emailVerified ?? true;
  const createdAt = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Recently";

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleStartEdit = () => {
    setNewName(name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === name) {
      setIsEditingName(false);
      return;
    }

    setIsSavingName(true);
    try {
      await authClient.updateUser({ name: trimmed });
      await refetch();
      toast.success("Display name updated.");
      setIsEditingName(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to update display name.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleCopyId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopiedId(true);
    toast.success("User ID copied");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/signin");
            router.refresh();
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out");
      setIsSigningOut(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full overflow-y-auto bg-[#171717] text-neutral-200">
      <div className="max-w-2xl mx-auto px-4 py-10 sm:px-6 space-y-10">
        
        {/* Header */}
        <div className="space-y-1 border-b border-[#262626] pb-6">
          <h1 className="text-xl font-semibold text-white">Account Settings</h1>
          <p className="text-sm text-neutral-400">
            Manage your profile details and preferences.
          </p>
        </div>

        {/* Profile Info Section */}
        <div className="space-y-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Profile
          </h2>

          <div className="flex items-center gap-4 py-2">
            <Avatar className="h-14 w-14 border border-[#333]">
              {image && <AvatarImage src={image} alt={name} className="object-cover" />}
              <AvatarFallback className="bg-[#262626] text-white font-medium text-base">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-base font-semibold text-white">{name}</div>
              <div className="text-sm text-neutral-400">{email}</div>
            </div>
          </div>

          <div className="divide-y divide-[#262626] border-t border-b border-[#262626]">
            {/* Display Name Row */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Display Name</div>
                <div className="text-xs text-neutral-400">How your name appears across OAGPT</div>
              </div>
              
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="h-8 w-48 bg-[#212121] border-[#333] text-white text-xs rounded-md"
                    autoFocus
                  />
                  <Button
                    onClick={handleSaveName}
                    disabled={isSavingName}
                    size="sm"
                    className="h-8 px-3 bg-white hover:bg-neutral-200 text-black text-xs font-medium rounded-md"
                  >
                    {isSavingName ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
                  </Button>
                  <Button
                    onClick={() => setIsEditingName(false)}
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 text-xs text-neutral-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-300">{name}</span>
                  <Button
                    onClick={handleStartEdit}
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 border-[#333] bg-[#212121] text-neutral-300 hover:bg-[#2a2a2a] hover:text-white text-xs rounded-md"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            {/* Email Row */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Email Address</div>
                <div className="text-xs text-neutral-400">Your account email address</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-300">{email}</span>
                {isVerified && (
                  <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700">
                    Verified
                  </span>
                )}
              </div>
            </div>

            {/* User ID Row */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">User ID</div>
                <div className="text-xs text-neutral-400">Unique identifier for your account</div>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono text-neutral-400 bg-[#212121] px-2 py-1 rounded border border-[#333]">
                  {userId ? `${userId.slice(0, 20)}...` : "—"}
                </code>
                <button
                  onClick={handleCopyId}
                  className="p-1.5 text-neutral-400 hover:text-white transition-colors"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Member Since Row */}
            <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-white">Member Since</div>
                <div className="text-xs text-neutral-400">Date your account was registered</div>
              </div>
              <div className="text-sm text-neutral-300">{createdAt}</div>
            </div>
          </div>
        </div>

        {/* Subscription Plan Section */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Subscription
          </h2>

          <div className="p-4 rounded-lg border border-[#262626] bg-[#212121] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Free Plan</span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 border border-neutral-700">
                  Current
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Access to standard models and features.
              </p>
            </div>

            <Link href="/upgrade">
              <Button
                size="sm"
                className="h-8 px-4 bg-white hover:bg-neutral-200 text-black text-xs font-medium rounded-md"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                Upgrade to Plus
              </Button>
            </Link>
          </div>
        </div>

        {/* Session / Account Actions */}
        <div className="space-y-4 border-t border-[#262626] pt-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-white">Sign Out</div>
              <div className="text-xs text-neutral-400">Log out from this browser session</div>
            </div>

            <Button
              onClick={handleSignOut}
              disabled={isSigningOut}
              variant="outline"
              size="sm"
              className="h-8 px-4 border-[#333] bg-[#212121] text-neutral-300 hover:bg-[#2a2a2a] hover:text-white text-xs rounded-md"
            >
              {isSigningOut ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
              )}
              Sign Out
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
