"use client";

import { useEffect, useState } from "react";

export function useTypewriter(text: string, speed = 42, isNew = true): string {
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
    let timer: NodeJS.Timeout;
    setDisplayedText("");

    const typeNextWord = () => {
      if (currentIndex < words.length) {
        const word = words[currentIndex];
        setDisplayedText(words.slice(0, currentIndex + 1).join(" "));
        currentIndex++;

        let delay = speed;
        if (word.endsWith(".") || word.endsWith("?") || word.endsWith("!")) {
          delay = speed + 65;
        } else if (word.endsWith(",") || word.endsWith(":") || word.endsWith(";")) {
          delay = speed + 30;
        }

        timer = setTimeout(typeNextWord, delay);
      }
    };

    timer = setTimeout(typeNextWord, 40);
    return () => clearTimeout(timer);
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

