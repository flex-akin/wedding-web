import { useEffect, useRef } from "react";

const COLORS = ["#4a5d48", "#b5654a", "#c9a24b", "#7a8f77", "#d4917b"];
const DURATION_MS = 2200;
const FADE_MS = 400;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
}

interface ConfettiProps {
  onDone: () => void;
}

export function Confetti({ onDone }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      onDone();
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      vx: (Math.random() - 0.5) * 3,
      vy: 2 + Math.random() * 3,
      size: 5 + Math.random() * 6,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
    }));

    const start = performance.now();
    let frameId: number;

    function draw(now: number) {
      const elapsed = now - start;
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

      const fadeStart = DURATION_MS - FADE_MS;
      const alpha = elapsed > fadeStart ? Math.max(0, 1 - (elapsed - fadeStart) / FADE_MS) : 1;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;

        ctx!.save();
        ctx!.globalAlpha = alpha;
        ctx!.translate(p.x, p.y);
        ctx!.rotate((p.rotation * Math.PI) / 180);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx!.restore();
      }

      if (elapsed < DURATION_MS) {
        frameId = requestAnimationFrame(draw);
      } else {
        onDone();
      }
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [onDone]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30"
    />
  );
}
