"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UpgradeComponent() {
  const pathname = usePathname();

  if (pathname === "/upgrade") {
    return null;
  }

  return (
    <div className="absolute left-1/2 -translate-x-1/2">
      <Button
        asChild
        variant="default"
        className="rounded-full bg-[#373669] border-[#3e3e4a] text-white hover:bg-[#373669]/60 text-[12px] h-8 px-4 font-medium cursor-pointer"
      >
        <Link href="/upgrade">✦ Get Plus</Link>
      </Button>
    </div>
  );
}
