import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

function getRemaining(targetDate: string) {
  const diff = Math.max(0, new Date(targetDate).getTime() - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds, done: diff === 0 };
}

export function Countdown({ targetDate }: CountdownProps) {
  const [remaining, setRemaining] = useState(() => getRemaining(targetDate));

  useEffect(() => {
    const id = setInterval(() => setRemaining(getRemaining(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (remaining.done) {
    return <p className="font-display text-2xl text-sage">We're married! 🎉</p>;
  }

  const units: { label: string; value: number }[] = [
    { label: "days", value: remaining.days },
    { label: "hrs", value: remaining.hours },
    { label: "min", value: remaining.minutes },
    { label: "sec", value: remaining.seconds },
  ];

  return (
    <div className="flex gap-3 sm:gap-6" role="timer" aria-live="polite">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-16 flex-col items-center rounded-xl border border-sage/20 bg-white/70 py-3 sm:w-20"
        >
          <span className="font-mono text-2xl font-semibold text-sage sm:text-3xl">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-xs tracking-wide text-ink/60 uppercase">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
