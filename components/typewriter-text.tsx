"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 25, isNew = true): string {
  const [displayedText, setDisplayedText] = useState(isNew ? "" : text);

  useEffect(() => {
    if (!isNew) {
      setDisplayedText(text);
      return;
    }

    if (!text) {
      setDisplayedText("");
      return;
    }

    const words = text.split(" ");
    let currentIndex = 0;
    setDisplayedText("");

    const timer = setInterval(() => {
      if (currentIndex < words.length) {
        setDisplayedText(words.slice(0, currentIndex + 1).join(" "));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, isNew]);

  return displayedText;
}

interface TypewriterTextProps {
  text: string;
  speed?: number;
  isNew?: boolean;
}

export function TypewriterText({ text, speed = 25, isNew = true }: TypewriterTextProps) {
  const typedText = useTypewriter(text, speed, isNew);
  return <span>{typedText}</span>;
}

