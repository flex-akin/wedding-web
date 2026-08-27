import { HASHTAGS } from "../lib/hashtags";

// Decorative tiled background texture built from the hashtag list — pure CSS/text, no image asset.
export function HashtagPattern() {
  const tiles = Array.from({ length: 8 }, () => HASHTAGS).flat();
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute -inset-x-10 -inset-y-10 flex flex-wrap gap-6 rotate-[-6deg] opacity-[0.08]">
        {tiles.map((tag, i) => (
          <span key={i} className="font-mono text-xl whitespace-nowrap text-gold">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
