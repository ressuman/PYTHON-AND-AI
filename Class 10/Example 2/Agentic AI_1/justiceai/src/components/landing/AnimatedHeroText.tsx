"use client";

import { useState, useEffect } from "react";

const words = ["Legal Documents.", "Your Code.", "Everything."];
const gradientClasses = [
  "from-purple-400 to-purple-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
];

export function AnimatedHeroText() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <span
      className={`bg-gradient-to-r ${gradientClasses[index]} bg-clip-text text-transparent transition-all duration-700`}
    >
      {words[index]}
    </span>
  );
}
