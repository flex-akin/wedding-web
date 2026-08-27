import { useEffect } from "react";
import { HeartButton } from "./HeartButton";
import { ChallengeBadge } from "./ChallengeBadge";
import { formatLikedBy } from "../lib/formatLikedBy";
import type { Photo } from "../types";

interface PhotoLightboxProps {
  photos: Photo[];
  index: number;
  myName: string | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onLike: (photo: Photo) => void;
}

export function PhotoLightbox({ photos, index, myName, onClose, onNavigate, onLike }: PhotoLightboxProps) {
  const photo = photos[index];

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((index - 1 + photos.length) % photos.length);
      if (e.key === "ArrowRight") onNavigate((index + 1) % photos.length);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;
  const liked = myName ? photo.likedBy.includes(myName) : false;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-ink/90 px-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-ivory/10 font-mono text-xl text-ivory hover:bg-ivory/20"
      >
        ×
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + photos.length) % photos.length);
            }}
            aria-label="Previous photo"
            className="absolute left-2 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/10 font-mono text-xl text-ivory hover:bg-ivory/20 sm:left-6"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % photos.length);
            }}
            aria-label="Next photo"
            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-full bg-ivory/10 font-mono text-xl text-ivory hover:bg-ivory/20 sm:right-6"
          >
            ›
          </button>
        </>
      )}

      <div className="relative max-h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <img src={photo.url} alt="" className="max-h-[85vh] w-full rounded-lg object-contain" />
        {photo.challengeTag && (
          <div className="absolute top-3 left-3">
            <ChallengeBadge tag={photo.challengeTag} />
          </div>
        )}
        <div className="mt-3 flex items-center justify-between gap-3">
          <span className="font-mono text-xs text-ivory/70">{photo.uploadedBy || "Anonymous"}</span>
          <HeartButton liked={liked} likes={photo.likedBy.length} onLike={() => onLike(photo)} />
        </div>
        <p className="mt-2 text-balance text-center text-xs text-ivory/60">{formatLikedBy(photo.likedBy)}</p>
      </div>
    </div>
  );
}
