import { useState } from "react";
import type { PhotoshootImage } from "../types";

const TABS = [
  { id: "all", label: "All" },
  { id: "proposal", label: "Proposal" },
  { id: "throwback", label: "Throwback" },
  { id: "pre-wedding", label: "Pre-Wedding" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function PhotoshootGallery({ images }: { images: PhotoshootImage[] }) {
  const [tab, setTab] = useState<TabId>("all");
  const filtered = tab === "all" ? images : images.filter((img) => img.category === tab);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 font-mono text-xs transition-colors ${
              tab === t.id ? "bg-sage text-ivory" : "border border-sage/30 text-sage hover:bg-sage/10"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-sm text-ink/40">
          {tab === "pre-wedding" ? "Pre-wedding photos coming soon." : "No photos here yet."}
        </p>
      ) : (
        <div className="mt-6 columns-1 gap-4 sm:columns-2">
          {filtered.map((img, i) => (
            <div
              key={`${img.url}-${i}`}
              className="mb-4 overflow-hidden rounded-2xl border border-sage/15 bg-white/60 break-inside-avoid"
            >
              <img src={img.url} alt="" className="w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
