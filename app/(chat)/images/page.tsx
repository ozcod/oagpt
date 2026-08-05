"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, Copy, Check, Wand2, Download, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GeneratedImage {
  id: string;
  prompt: string;
  style: string;
  url: string;
  createdAt: string;
}

export default function ImagesPage() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("Photorealistic");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imagesHistory, setImagesHistory] = useState<GeneratedImage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const styles = ["None", "Photorealistic", "Cyberpunk", "Anime", "3D Render", "Oil Painting"];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style: selectedStyle }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to generate image");
      }

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        style: selectedStyle,
        url: data.imageUrl,
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setImagesHistory((prev) => [newImage, ...prev]);
    } catch (err: any) {
      setError(err?.message || "An error occurred while generating the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleDownload = (url: string, filename: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 25)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col flex-1 h-full w-full overflow-y-auto p-6 md:p-8 text-[#ececec]">
      <div className="flex flex-col gap-1 mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
          AI Image Creation
        </h1>
      </div>

      {/* Generation Input Box */}
      <div className="bg-[#2a2a2a] p-4 rounded-2xl border border-[#3a3a3a] mb-8 shadow-xl">
        <form onSubmit={handleGenerate} className="flex flex-col gap-4">
          <div className="flex items-center gap-3 bg-[#1e1e1e] px-4 py-3 rounded-xl border border-[#333]">
            <Sparkles className="h-5 w-5 text-amber-400 shrink-0" />
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to create..."
              className="w-full bg-transparent text-white placeholder:text-[#676767] focus:outline-none text-base"
            />
            <Button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shrink-0 font-medium px-5 rounded-lg transition-all cursor-pointer"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4 animate-spin" /> Generating...
                </span>
              ) : (
                "Generate"
              )}
            </Button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs text-[#888] font-medium mr-2 shrink-0">Style:</span>
            {styles.map((style) => (
              <button
                key={style}
                type="button"
                onClick={() => setSelectedStyle(style)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 cursor-pointer ${selectedStyle === style
                    ? "bg-purple-600 text-white"
                    : "bg-[#1e1e1e] text-[#a1a1a1] hover:bg-[#333]"
                  }`}
              >
                {style}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Generated Images Gallery */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <span>Generated Creations</span>
          {imagesHistory.length > 0 && (
            <span className="text-xs text-[#888]">({imagesHistory.length})</span>
          )}
        </h2>

        {imagesHistory.length === 0 ? (
          <div className="bg-[#242424] rounded-2xl p-12 border border-[#333] text-center flex flex-col items-center justify-center gap-3">
            <ImageIcon className="h-12 w-12 text-[#555]" />
            <h3 className="text-base font-medium text-white">No images generated yet</h3>
            <p className="text-xs text-[#888] max-w-sm">
              Type a prompt above (e.g. &quot;A futuristic cyberpunk city with neon rain&quot;) and click Generate.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imagesHistory.map((item) => (
              <div
                key={item.id}
                className="group relative bg-[#2a2a2a] rounded-2xl overflow-hidden border border-[#333] transition-all hover:border-[#555] hover:shadow-2xl flex flex-col"
              >
                <div className="aspect-square relative overflow-hidden bg-[#181818] flex items-center justify-center">
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                  <p className="text-sm font-normal text-zinc-200 line-clamp-2">
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#333]">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#1e1e1e] text-purple-400 font-medium">
                      {item.style}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(item.id, item.prompt)}
                        className="p-1.5 rounded-lg hover:bg-[#383838] text-[#aaa] hover:text-white transition-colors"
                        title="Copy Prompt"
                      >
                        {copiedId === item.id ? (
                          <Check className="h-4 w-4 text-green-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDownload(item.url, item.prompt)}
                        className="p-1.5 rounded-lg hover:bg-[#383838] text-[#aaa] hover:text-white transition-colors"
                        title="Download Image"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
