"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("Photorealistic");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const styles = ["Photorealistic", "Cyberpunk", "Anime", "3D Render", "Oil Painting"];

  const sampleGallery = [
    {
      id: "1",
      title: "Futuristic Cyberpunk Cityscape",
      style: "Cyberpunk",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "2",
      title: "Serene Alpine Lake Sunset",
      style: "Photorealistic",
      imageUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop",
    },
    {
      id: "3",
      title: "Neon Abstract Hologram",
      style: "3D Render",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    },
  ];

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-y-auto p-6 max-w-6xl mx-auto text-[#ececec]">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-white flex items-center gap-3">
          <ImageIcon className="h-8 w-8 text-blue-400" />
          AI Image Studio
        </h1>
        <p className="text-[#a1a1a1] text-sm">
          Transform your creative prompts into stunning visual masterpieces.
        </p>
      </div>

      {/* Generation Bar */}
      <div className="bg-[#2a2a2a] p-4 rounded-2xl border border-[#3a3a3a] mb-10 shadow-xl">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-[#1e1e1e] px-4 py-3 rounded-xl border border-[#333]">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create (e.g. A futuristic glass skyscraper at sunset in Tokyo)..."
              className="w-full bg-transparent text-white placeholder:text-[#676767] focus:outline-none text-base"
            />
            <Button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="bg-white text-black hover:bg-zinc-200 shrink-0 font-medium px-5 rounded-lg transition-all"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-[#888] font-medium mr-2 shrink-0">Style:</span>
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                  selectedStyle === style
                    ? "bg-blue-600 text-white"
                    : "bg-[#1e1e1e] text-[#a1a1a1] hover:bg-[#333]"
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Generated & Sample Images */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-white">Recent Generations</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sampleGallery.map((item) => (
            <div
              key={item.id}
              className="group relative bg-[#2a2a2a] rounded-2xl overflow-hidden border border-[#333] transition-all hover:border-[#555] hover:shadow-2xl"
            >
              <div className="aspect-square relative overflow-hidden bg-black/40">
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1e1e1e] text-blue-400 font-medium">
                    {item.style}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopy(item.id, item.title)}
                      className="p-1.5 rounded-lg hover:bg-[#383838] text-[#aaa] hover:text-white transition-colors"
                      title="Copy Prompt"
                    >
                      {copiedId === item.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-sm font-normal text-zinc-200 line-clamp-2">
                  {item.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
