import { useRef, useState } from "react";
import Barcode from "react-barcode";
import { toPng } from "html-to-image";
import type { Guest } from "../types";

interface AccessCardProps {
  guest: Guest;
  partnerOneName: string;
  partnerTwoName: string;
  weddingDate?: string;
}

function eventLabel(guest: Guest): string {
  if (guest.attendingCeremony && guest.attendingReception) return "Vows & Engagement";
  if (guest.attendingCeremony) return "Vows";
  if (guest.attendingReception) return "Engagement";
  return "";
}

function formatDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" });
}

export function AccessCard({ guest, partnerOneName, partnerTwoName, weddingDate }: AccessCardProps) {
  const frontRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState<"front" | "back" | null>(null);
  const label = eventLabel(guest);

  async function download(ref: React.RefObject<HTMLDivElement | null>, filename: string, which: "front" | "back") {
    if (!ref.current) return;
    setDownloading(which);
    try {
      const dataUrl = await toPng(ref.current, { pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } finally {
      setDownloading(null);
    }
  }

  if (!label) return null;

  return (
    <div className="mx-auto mt-8 flex w-full max-w-85 flex-col items-center gap-8">
      <div className="w-full">
        <div
          ref={frontRef}
          className="flex aspect-[85.6/53.98] w-full flex-col justify-between rounded-2xl bg-sage p-5 text-ivory shadow-xl"
        >
          <div>
            <p className="font-mono text-[10px] tracking-wide text-ivory/60">ACCESS CARD</p>
            <p className="font-display text-lg">
              {partnerOneName} &amp; {partnerTwoName}
            </p>
          </div>
          <div>
            <p className="text-xl leading-tight font-medium">{guest.name}</p>
            <span className="mt-2 inline-block rounded-full bg-ivory/15 px-3 py-1 font-mono text-[10px] tracking-wide">
              {label.toUpperCase()}
            </span>
          </div>
          <p className="font-mono text-[10px] text-ivory/60">{formatDate(weddingDate)}</p>
        </div>
        <button
          onClick={() => download(frontRef, `${guest.slug}-access-card-front.png`, "front")}
          disabled={downloading === "front"}
          className="mt-2 w-full rounded-full border border-sage/30 py-2 font-mono text-xs text-sage hover:bg-sage/10 disabled:opacity-60"
        >
          {downloading === "front" ? "Preparing…" : "Download front"}
        </button>
      </div>

      <div className="w-full">
        <div
          ref={backRef}
          className="flex aspect-[85.6/53.98] w-full flex-col items-center justify-center gap-2 rounded-2xl border-4 border-sage/10 bg-white p-5 shadow-xl"
        >
          <div className="w-full [&>svg]:h-auto [&>svg]:w-full">
            <Barcode value={guest.name} renderer="svg" format="CODE128" width={1.2} height={45} fontSize={11} margin={0} />
          </div>
          <p className="font-mono text-[10px] text-ink/40">Present this at entry.</p>
        </div>
        <button
          onClick={() => download(backRef, `${guest.slug}-access-card-back.png`, "back")}
          disabled={downloading === "back"}
          className="mt-2 w-full rounded-full border border-sage/30 py-2 font-mono text-xs text-sage hover:bg-sage/10 disabled:opacity-60"
        >
          {downloading === "back" ? "Preparing…" : "Download back"}
        </button>
      </div>
    </div>
  );
}
