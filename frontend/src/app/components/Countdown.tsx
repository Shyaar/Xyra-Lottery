"use client";

import React, { useState, useEffect } from "react";

interface CountdownProps {
  targetTimestamp: bigint | undefined; // Unix timestamp in seconds (from contract)
}

const Countdown: React.FC<CountdownProps> = ({ targetTimestamp }) => {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!targetTimestamp) {
      setTimeLeft("Loading...");
      return;
    }

    // Convert bigint timestamp (seconds) to milliseconds
    const targetMs = Number(targetTimestamp) * 1000;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = targetMs - now;

      if (difference <= 0) {
        setTimeLeft("0h 0m 0s"); // Or "Round Ended"
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft(); // Initial calculation
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetTimestamp]);

  return <>{timeLeft}</>;
};

export default Countdown;
