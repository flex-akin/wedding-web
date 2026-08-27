import { HASHTAGS } from "../lib/hashtags";

type Variant = "light" | "dark";

function Pill({ tag, variant }: { tag: string; variant: Variant }) {
  const classes =
    variant === "dark"
      ? "mx-2 inline-flex items-center rounded-full border border-gold/40 bg-ivory/10 px-4 py-1.5 font-mono text-sm text-ivory shadow-sm"
      : "mx-2 inline-flex items-center rounded-full border border-terracotta/40 bg-white/60 px-4 py-1.5 font-mono text-sm text-sage shadow-sm";
  return <span className={classes}>{tag}</span>;
}

function Row({ direction, variant }: { direction: "left" | "right"; variant: Variant }) {
  const items = [...HASHTAGS, ...HASHTAGS];
  return (
    <div className="flex w-max">
      <div className={`flex ${direction === "left" ? "animate-marquee-left" : "animate-marquee-right"}`}>
        {items.map((tag, i) => (
          <Pill key={`${tag}-${i}`} tag={tag} variant={variant} />
        ))}
      </div>
    </div>
  );
}

export function HashtagMarquee({ variant = "light" }: { variant?: Variant }) {
  const bandClass =
    variant === "dark"
      ? "overflow-hidden border-y border-ivory/15 py-4"
      : "overflow-hidden border-y border-terracotta/20 bg-ivory py-4";

  return (
    <div className={bandClass}>
      <div className="overflow-hidden">
        <Row direction="left" variant={variant} />
      </div>
      <div className="mt-3 hidden overflow-hidden sm:block">
        <Row direction="right" variant={variant} />
      </div>
    </div>
  );
}
