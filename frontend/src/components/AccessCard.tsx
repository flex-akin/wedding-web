import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toPng } from "html-to-image";
import type { Guest } from "../types";

interface AccessCardProps {
  guest: Guest;
}

// Matches the native resolution of the back-page artwork
// (frontend/public/images/access-card-*.png), so the front page we generate
// comes out the same size when downloaded.
const TEMPLATE_WIDTH = 2100;
const TEMPLATE_HEIGHT = 1200;

export function AccessCard({ guest }: AccessCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const [frontWidth, setFrontWidth] = useState(0);
  const [downloading, setDownloading] = useState<"front" | "back" | null>(null);

  useEffect(() => {
    const el = frontRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setFrontWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const bothEvents = guest.attendingCeremony && guest.attendingReception;
  // access-card-1 covers Vows + Engagement; access-card-2 covers everyone else.
  const backTemplate = bothEvents ? "/images/access-card-1.png" : "/images/access-card-2.png";
  const scale = frontWidth > 0 ? frontWidth / TEMPLATE_WIDTH : 0;

  async function downloadFront() {
    if (!frontRef.current) return;
    setDownloading("front");
    try {
      const pixelRatio = frontWidth > 0 ? TEMPLATE_WIDTH / frontWidth : 3;
      const dataUrl = await toPng(frontRef.current, { pixelRatio, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `${guest.slug}-access-card-front.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(null);
    }
  }

  async function downloadBack() {
    setDownloading("back");
    try {
      const link = document.createElement("a");
      link.href = backTemplate;
      link.download = `${guest.slug}-access-card-back.png`;
      link.click();
    } finally {
      setDownloading(null);
    }
  }

  if (!guest.attendingCeremony && !guest.attendingReception) return null;

  return (
    <div className="mx-auto mt-8 flex w-full max-w-2xl flex-col gap-8">
      <div className="w-full">
        <div
          ref={frontRef}
          className="relative flex w-full flex-col items-center justify-center bg-white px-[6%] py-[6%] shadow-xl"
          style={{ aspectRatio: `${TEMPLATE_WIDTH} / ${TEMPLATE_HEIGHT}`, gap: 28 * scale }}
        >
          <p className="font-mono font-medium tracking-tight whitespace-nowrap" style={{ fontSize: 42 * scale }}>
            <span className="text-terracotta">{"<"}</span>
            <span className="text-sage">Flora &amp; Felix</span>
            <span className="text-terracotta"> {"/>"}</span>
          </p>
          <p className="font-mono tracking-[0.3em] text-sage" style={{ fontSize: 20 * scale }}>
            ACCESS CARD
          </p>
          <QRCodeSVG value={`${window.location.origin}/rsvp/${guest.slug}`} size={420 * scale} />
          <p
            className="text-center font-mono tracking-[0.2em] text-ink/40 uppercase"
            style={{ fontSize: 32 * scale }}
          >
            {guest.name}
          </p>
        </div>
        <button
          onClick={downloadFront}
          disabled={downloading === "front"}
          className="mt-2 w-full rounded-full border border-sage/30 py-2 font-mono text-xs text-sage hover:bg-sage/10 disabled:opacity-60"
        >
          {downloading === "front" ? "Preparing…" : "Download front"}
        </button>
      </div>

      <div className="w-full">
        <img src={backTemplate} alt="Access card back" className="w-full shadow-xl" draggable={false} />
        <button
          onClick={downloadBack}
          disabled={downloading === "back"}
          className="mt-2 w-full rounded-full border border-sage/30 py-2 font-mono text-xs text-sage hover:bg-sage/10 disabled:opacity-60"
        >
          {downloading === "back" ? "Preparing…" : "Download back"}
        </button>
      </div>
    </div>
  );
}
