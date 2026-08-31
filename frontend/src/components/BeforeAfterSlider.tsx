import { useState } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = "Strangers",
  afterLabel = "Forever",
}: BeforeAfterSliderProps) {
  const [percent, setPercent] = useState(70);

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border-4 border-ivory shadow-xl select-none">
        <img src={afterSrc} alt={afterLabel} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - percent}% 0 0)` }}>
          <img src={beforeSrc} alt={beforeLabel} draggable={false} className="h-full w-full object-cover" />
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-ivory shadow-md"
          style={{ left: `${percent}%` }}
        >
          <div className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-ivory font-mono text-xs text-sage shadow-md">
            ⇔
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-ink/60 to-transparent" />
        <span className="pointer-events-none absolute bottom-4 left-4 font-display text-xl text-ivory italic drop-shadow">
          {beforeLabel}
        </span>
        <span className="pointer-events-none absolute right-4 bottom-4 font-display text-xl text-ivory italic drop-shadow">
          {afterLabel}
        </span>

        <input
          type="range"
          min={0}
          max={100}
          value={percent}
          onChange={(e) => setPercent(Number(e.target.value))}
          aria-label={`Drag to compare ${beforeLabel} and ${afterLabel}`}
          className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="mt-3 text-center font-mono text-xs text-ink/50">Drag to see how far we've come →</p>
    </div>
  );
}
