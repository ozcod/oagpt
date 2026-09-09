import type { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/landing-navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { AnimatedTabs } from "@/components/landing/animated-tabs";
import { PricingSection } from "@/components/landing/pricing-section";
import { LandingFooter } from "@/components/landing/landing-footer";

export const metadata: Metadata = {
  title: "AI by OA ",
  description:
    "Every leading model in one focused canvas. DeepSeek R1, Gemini 2.5, GPT-4o, Claude 3.5 Sonnet, and FLUX 1 Schnell image studio.",
};

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-[#141414] text-[#ececec] antialiased selection:bg-white/20 selection:text-white flex flex-col font-sans">
      <LandingNavbar />
      <main className="flex-1 flex flex-col">
        {/* Asymmetric Hero Split */}
        <HeroSection />

        {/* Auto-Cycling Animated Capabilities Tabs */}
        <AnimatedTabs />

        {/* Compact, Abstracted Pricing */}
        <PricingSection />
      </main>

      {/* Footer with ozairahmad.com attribution, tech stack, and GitHub changes card */}
      <LandingFooter />
    </div>
  );
}
