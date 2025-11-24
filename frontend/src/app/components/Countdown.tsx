"use client";

import React, { useEffect, useState } from "react";

interface CountdownProps {
  targetTimestamp: number | undefined;   // UNIX timestamp in seconds
  onComplete?: () => void;               // Optional callback when timer ends
}

const Countdown: React.FC<CountdownProps> = ({ targetTimestamp, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!targetTimestamp) return;

    const targetMs = targetTimestamp * 1000;

    const update = () => {
      const now = Date.now();
      const diff = targetMs - now;

      if (diff <= 0) {
        setTimeLeft(0);
        if (onComplete) onComplete();
        return;
      }

      setTimeLeft(diff);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetTimestamp]);

  // Format HH:MM:SS
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatted = formatTime(timeLeft);

  // UI conditions
  const isEnding = timeLeft <= 10_000 && timeLeft > 0; // under 10 seconds
  const isCritical = timeLeft <= 5_000 && timeLeft > 0; // under 5 seconds

  return (
    <span
      className={`
        ${isEnding ? "text-red-500 font-bold" : "text-white"}
        ${isCritical ? "animate-pulse" : ""}
      `}
    >
      {formatted}
    </span>
  );
};

export default Countdown;
