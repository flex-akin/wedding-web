import { useState } from "react";

interface HeartButtonProps {
  liked: boolean;
  likes: number;
  onLike: () => void;
  className?: string;
}

export function HeartButton({ liked, likes, onLike, className = "" }: HeartButtonProps) {
  const [popped, setPopped] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (liked) return;
    onLike();
    setPopped(true);
    setTimeout(() => setPopped(false), 350);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={liked}
      aria-pressed={liked}
      aria-label={liked ? "Liked" : "Like this photo"}
      className={`flex items-center gap-1.5 rounded-full bg-ink/50 px-2.5 py-1 font-mono text-xs text-ivory backdrop-blur transition-colors ${
        liked ? "" : "hover:bg-ink/70"
      } ${className}`}
    >
      <span className={`${popped ? "animate-heart-pop" : ""} ${liked ? "text-terracotta-light" : ""}`}>
        {liked ? "♥" : "♡"}
      </span>
      <span>{likes}</span>
    </button>
  );
}
