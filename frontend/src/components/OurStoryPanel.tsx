import { Link } from "react-router-dom";

interface OurStoryPanelProps {
  story: string;
  imageUrl?: string;
  truncateWords?: number;
}

function truncate(text: string, maxWords: number): { text: string; truncated: boolean } {
  const words = text.trim().split(/\s+/);
  if (words.length <= maxWords) return { text, truncated: false };
  return { text: words.slice(0, maxWords).join(" ") + "…", truncated: true };
}

export function OurStoryPanel({ story, imageUrl, truncateWords }: OurStoryPanelProps) {
  const { text, truncated } = truncateWords ? truncate(story, truncateWords) : { text: story, truncated: false };

  return (
    <div className="mx-auto max-w-2xl">
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Felix and Flora"
          className="mx-auto w-full max-w-sm rounded-3xl border-4 border-ivory object-cover shadow-xl"
        />
      )}
      <div className={`relative ${imageUrl ? "mt-8" : ""}`}>
        <p className="whitespace-pre-line text-sm leading-relaxed text-ink/75">{text}</p>
        {truncated && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-ivory to-transparent"
          />
        )}
      </div>
      {truncated && (
        <Link
          to="/our-story"
          className="mt-2 inline-block font-mono text-xs text-terracotta underline underline-offset-2"
        >
          Read the full story →
        </Link>
      )}
    </div>
  );
}
