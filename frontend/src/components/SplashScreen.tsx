import { useEffect, useRef, useState } from "react";
import { HashtagMarquee } from "./HashtagMarquee";
import { TechPattern } from "./TechPattern";

const BOOT_LINES = [
  "> resolving venue.config",
  "> compiling love.tsx",
  "> merging hearts.branch",
  "> npm install happiness",
  "> optimizing forever",
  "> pushing to production",
];

const SESSION_KEY = "wedding_splash_shown";

interface SplashScreenProps {
  onDone: () => void;
}

export function SplashScreen({ onDone }: SplashScreenProps) {
  const [percent, setPercent] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [exiting, setExiting] = useState(false);
  const reducedMotion = useRef(
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    if (reducedMotion.current) {
      sessionStorage.setItem(SESSION_KEY, "1");
      onDone();
      return;
    }

    const progressTimer = setInterval(() => {
      setPercent((p) => {
        const next = Math.min(100, p + Math.floor(Math.random() * 12) + 4);
        return next;
      });
    }, 140);

    const lineTimer = setInterval(() => {
      setLineIndex((i) => (i + 1) % BOOT_LINES.length);
    }, 420);

    return () => {
      clearInterval(progressTimer);
      clearInterval(lineTimer);
    };
  }, [onDone]);

  useEffect(() => {
    if (percent < 100) return;
    const holdTimer = setTimeout(() => setExiting(true), 350);
    return () => clearTimeout(holdTimer);
  }, [percent]);

  useEffect(() => {
    if (!exiting) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    const dismissTimer = setTimeout(onDone, 400);
    return () => clearTimeout(dismissTimer);
  }, [exiting, onDone]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col overflow-hidden bg-sage transition-opacity duration-400 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <TechPattern />

      <div className="relative flex flex-1 flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-balance font-display text-5xl text-ivory sm:text-7xl">Flora weds Felix</p>
        <p className="font-mono text-sm text-gold sm:text-base">#FloraFelixDeployed</p>
      </div>

      <div className="relative pb-10 sm:pb-14">
        <div className="mb-8">
          <HashtagMarquee variant="dark" />
        </div>
        <div className="flex flex-col items-center gap-2 px-4">
          <span className="font-mono text-xs text-ivory/60">{BOOT_LINES[lineIndex]}</span>
          <span className="font-mono text-4xl font-semibold text-gold sm:text-5xl">{percent}%</span>
        </div>
      </div>
    </div>
  );
}

export function shouldShowSplash(): boolean {
  return typeof window !== "undefined" && sessionStorage.getItem(SESSION_KEY) !== "1";
}
