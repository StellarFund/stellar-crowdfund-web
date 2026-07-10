"use client";

import { useEffect, useState } from "react";

interface CountdownTimerProps {
  deadline: string;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

function computeTimeLeft(deadline: string): TimeLeft {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isExpired: false,
  };
}

const UNITS: { key: keyof Omit<TimeLeft, "isExpired">; label: string }[] = [
  { key: "days", label: "d" },
  { key: "hours", label: "h" },
  { key: "minutes", label: "m" },
  { key: "seconds", label: "s" },
];

export function CountdownTimer({ deadline, className = "" }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(deadline));

  useEffect(() => {
    setTimeLeft(computeTimeLeft(deadline));
    const interval = setInterval(() => setTimeLeft(computeTimeLeft(deadline)), 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  if (timeLeft.isExpired) {
    return <span className={`font-medium text-muted ${className}`}>Campaign ended</span>;
  }

  return (
    <div className={`flex items-baseline gap-2 font-mono ${className}`} aria-live="polite">
      {UNITS.map(({ key, label }) => (
        <span key={key} className="flex items-baseline gap-0.5">
          <span className="text-lg font-semibold text-foreground tabular-nums">
            {String(timeLeft[key]).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted">{label}</span>
        </span>
      ))}
    </div>
  );
}
