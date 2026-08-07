import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: Max 5 image generations per minute per IP to prevent API key usage exhaustion
  const rateLimitError = checkRateLimit(request, "generate-image-api", {
    limit: 5,
    windowSeconds: 60,
  });
  if (rateLimitError) return rateLimitError;

  try {
    const { prompt, style } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const fullPrompt = style && style !== "None" ? `${prompt}, ${style} style` : prompt;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    // 1. Try OpenRouter FLUX model
    if (openRouterKey) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "OAGPT Image Generator",
          },
          body: JSON.stringify({
            model: "black-forest-labs/flux-1-schnell:free",
            messages: [
              {
                role: "user",
                content: `Generate an image: ${fullPrompt}`,
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const choice = data.choices?.[0]?.message;
          
          // Check for images array in OpenRouter response
          if (choice?.images && Array.isArray(choice.images) && choice.images.length > 0) {
            return NextResponse.json({ imageUrl: choice.images[0] });
          }

          // Check if message content has image markdown or direct URL
          if (typeof choice?.content === "string") {
            const match = choice.content.match(/\((https?:\/\/[^\s\)]+)\)/) || choice.content.match(/(https?:\/\/[^\s]+)/);
            if (match && match[1]) {
              return NextResponse.json({ imageUrl: match[1] });
            }
          }
        }
      } catch (err) {
        console.error("OpenRouter image generation error:", err);
      }
    }

    // 2. Guaranteed instant FLUX generation engine (Pollinations FLUX)
    // Fetch image server-side and convert to Data URL so it ALWAYS displays instantly in browser without CORS/loading issues
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      fullPrompt
    )}?model=flux&width=1024&height=1024&nologo=true&seed=${seed}`;

    try {
      const imgRes = await fetch(pollinationsUrl, { cache: "no-store" });
      if (imgRes.ok) {
        const buffer = await imgRes.arrayBuffer();
        const contentType = imgRes.headers.get("content-type") || "image/jpeg";
        const base64 = Buffer.from(buffer).toString("base64");
        const dataUrl = `data:${contentType};base64,${base64}`;
        return NextResponse.json({ imageUrl: dataUrl });
      }
    } catch (fetchErr) {
      console.error("Direct fetch to FLUX engine failed, using direct URL:", fetchErr);
    }

    return NextResponse.json({ imageUrl: pollinationsUrl });
  } catch (error: any) {
    console.error("Image generation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
