import { useState, useEffect } from 'react';

interface TypewriterProps {
  text: string;
  speed?: number; // milisaniye cinsinden harf arası gecikme
}

export default function TypewriterEffect({ text, speed = 50 }: TypewriterProps) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let currentIndex = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text[currentIndex]);
      currentIndex++;
      if (currentIndex >= text.length) {
        clearInterval(interval);
      }
    }, speed);
    
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayedText}</span>;
}
