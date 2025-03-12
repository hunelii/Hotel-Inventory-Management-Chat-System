// components/TypewriterEffect.tsx
import { useState, useEffect } from 'react';

interface TypewriterProps {
  text?: string;
  speed?: number; // delay in milliseconds between characters
}

export default function TypewriterEffect({ text = "", speed = 30 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText("");
    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}
