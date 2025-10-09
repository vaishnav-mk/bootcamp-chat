"use client";

import { useState, useEffect } from "react";

interface ThinkingIndicatorProps {
  className?: string;
}

const thinkingMessages = [
  "Thinking...",
  "Pondering your question...",
  "Calculating response...",
  "Processing...",
  "Analyzing...",
  "Considering...",
  "Formulating answer...",
  "Working on it...",
  "Just a moment...",
  "Computing..."
];

export default function ThinkingIndicator({ className = "" }: ThinkingIndicatorProps) {
  const [currentMessage, setCurrentMessage] = useState(thinkingMessages[0]);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        const currentIndex = thinkingMessages.indexOf(prev);
        const nextIndex = (currentIndex + 1) % thinkingMessages.length;
        return thinkingMessages[nextIndex];
      });
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots(prev => {
        if (prev === "...") return ".";
        return prev + ".";
      });
    }, 500);

    return () => {
      clearInterval(messageInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200"></div>
      </div>
      <span className="text-purple-400 text-sm italic">
        {currentMessage}{dots}
      </span>
    </div>
  );
}