import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { generatedImage } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

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

    const session = await auth.api.getSession({ headers: request.headers });
    const fullPrompt = style && style !== "None" ? `${prompt}, ${style} style` : prompt;
    const openRouterKey = process.env.OPENROUTER_API_KEY;

    let finalImageUrl = "";

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
          
          if (choice?.images && Array.isArray(choice.images) && choice.images.length > 0) {
            finalImageUrl = choice.images[0];
          } else if (typeof choice?.content === "string") {
            const match = choice.content.match(/\((https?:\/\/[^\s\)]+)\)/) || choice.content.match(/(https?:\/\/[^\s]+)/);
            if (match && match[1]) {
              finalImageUrl = match[1];
            }
          }
        }
      } catch (err) {
        console.error("OpenRouter image generation error:", err);
      }
    }

    // 2. Guaranteed instant FLUX generation engine (Pollinations FLUX) if OpenRouter did not yield URL
    if (!finalImageUrl) {
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
          finalImageUrl = `data:${contentType};base64,${base64}`;
        } else {
          finalImageUrl = pollinationsUrl;
        }
      } catch (fetchErr) {
        console.error("Direct fetch to FLUX engine failed, using direct URL:", fetchErr);
        finalImageUrl = pollinationsUrl;
      }
    }

    // Persist to DB if user is authenticated
    if (session?.user?.id && finalImageUrl) {
      await db.insert(generatedImage).values({
        id: uuidv4(),
        userId: session.user.id,
        prompt,
        style,
        imageUrl: finalImageUrl,
      });
    }

    return NextResponse.json({ imageUrl: finalImageUrl });
  } catch (error: any) {
    console.error("Image generation API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
