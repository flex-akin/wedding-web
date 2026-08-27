import { challengeLabel } from "../lib/challenges";

export function ChallengeBadge({ tag, className = "" }: { tag: string | null; className?: string }) {
  const challenge = challengeLabel(tag);
  if (!challenge) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 font-mono text-[10px] text-ink ${className}`}
    >
      {challenge.emoji} {challenge.label}
    </span>
  );
}
