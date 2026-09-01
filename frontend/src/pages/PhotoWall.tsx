import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { apiRequest } from "../api/client";
import { HeartButton } from "../components/HeartButton";
import { PhotoLightbox } from "../components/PhotoLightbox";
import { NamePrompt } from "../components/NamePrompt";
import { ChallengeBadge } from "../components/ChallengeBadge";
import { Confetti } from "../components/Confetti";
import { getStoredName, setStoredName } from "../lib/guestName";
import { CHALLENGES, CHALLENGE_PRIZES } from "../lib/challenges";
import { computeChallengeLeaderboard } from "../lib/challengeLeaderboard";
import type { Photo } from "../types";

const MILESTONES = [25, 50, 100];
const MEDALS = ["🥇", "🥈", "🥉"];

export function PhotoWall() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [myName, setMyName] = useState<string | null>(getStoredName);
  const [pendingLikePhotoId, setPendingLikePhotoId] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confettiKey, setConfettiKey] = useState<number | null>(null);

  const [uploaderName, setUploaderName] = useState(() => getStoredName() ?? "");
  const [challengeTag, setChallengeTag] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const photoCountRef = useRef(0);

  useEffect(() => {
    apiRequest<Photo[]>("/photos").then((data) => {
      setPhotos(data);
      photoCountRef.current = data.length;
    });

    const socket = io({ path: "/socket.io" });
    socketRef.current = socket;

    socket.on("photo:new", (photo: Photo) => {
      photoCountRef.current += 1;
      const newCount = photoCountRef.current;
      const hitMilestone = MILESTONES.includes(newCount);

      setPhotos((prev) => [photo, ...prev]);
      setNewIds((prev) => new Set(prev).add(photo._id));
      setTimeout(() => {
        setNewIds((prev) => {
          const next = new Set(prev);
          next.delete(photo._id);
          return next;
        });
      }, 2800);

      if (hitMilestone) setConfettiKey(newCount);
      setToast(
        hitMilestone
          ? `🎉 ${newCount} photos and counting!`
          : `${photo.uploadedBy?.trim() || "Someone"} just added a photo 📸`
      );
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), hitMilestone ? 4000 : 3200);
    });

    socket.on("photo:hidden", (id: string) => {
      setPhotos((prev) => prev.filter((p) => p._id !== id));
    });

    socket.on("photo:liked", ({ photoId, likedBy }: { photoId: string; likedBy: string[] }) => {
      setPhotos((prev) => prev.map((p) => (p._id === photoId ? { ...p, likedBy } : p)));
    });

    return () => {
      socket.disconnect();
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const mostLiked = useMemo(() => {
    return [...photos].filter((p) => p.likedBy.length > 0).sort((a, b) => b.likedBy.length - a.likedBy.length).slice(0, 5);
  }, [photos]);

  const challengeFinishers = useMemo(() => computeChallengeLeaderboard(photos), [photos]);

  async function doLike(photoId: string, name: string) {
    setPhotos((prev) =>
      prev.map((p) => (p._id === photoId && !p.likedBy.includes(name) ? { ...p, likedBy: [...p.likedBy, name] } : p))
    );
    try {
      await apiRequest<{ likedBy: string[] }>(`/photos/${photoId}/like`, { method: "POST", body: { name } });
    } catch {
      // optimistic update is good enough here; a failed like isn't worth surfacing an error for
    }
  }

  function requestLike(photo: Photo) {
    if (myName) {
      if (!photo.likedBy.includes(myName)) doLike(photo._id, myName);
      return;
    }
    setPendingLikePhotoId(photo._id);
  }

  function handleNameSubmit(name: string) {
    setStoredName(name);
    setMyName(name);
    setUploaderName((current) => current || name);
    if (pendingLikePhotoId) {
      doLike(pendingLikePhotoId, name);
      setPendingLikePhotoId(null);
    }
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("photo", file);
      if (uploaderName) {
        form.append("uploadedBy", uploaderName);
        setStoredName(uploaderName);
        setMyName(uploaderName);
      }
      if (challengeTag) form.append("challengeTag", challengeTag);
      await apiRequest<Photo>("/photos", { method: "POST", body: form, isFormData: true });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setChallengeTag("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function openLightboxFor(photoId: string) {
    setLightboxIndex(photos.findIndex((p) => p._id === photoId));
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Photo Wall</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
        Snap it, upload it, watch it appear live.
      </p>
      {photos.length > 0 && (
        <p className="mt-2 text-center font-mono text-xs text-terracotta">
          {photos.length} photo{photos.length === 1 ? "" : "s"} and counting
        </p>
      )}

      <div className="mx-auto mt-8 max-w-lg rounded-2xl border border-gold/30 bg-gold/8 p-5 text-center">
        <p className="font-mono text-xs text-terracotta">📸 PHOTO CHALLENGES</p>
        <ul className="mt-3 space-y-1 text-sm text-ink/80">
          {CHALLENGES.map((c) => (
            <li key={c.id}>
              {c.emoji} {c.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-ink/60">
          Complete all three and tag your photos. The first three guests to finish win cash:
        </p>
        <div className="mt-2 flex justify-center gap-4 font-mono text-sm">
          {CHALLENGE_PRIZES.map((prize, i) => (
            <span key={prize} className="text-terracotta">
              {MEDALS[i]} {prize}
            </span>
          ))}
        </div>
      </div>

      <form onSubmit={handleUpload} className="mx-auto mt-8 flex max-w-md flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={uploaderName}
            onChange={(e) => setUploaderName(e.target.value)}
            placeholder="Your name (optional)"
            className="flex-1 rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            required
            className="flex-1 rounded-lg border border-sage/25 bg-white px-3 py-2.5 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-sage file:px-3 file:py-1.5 file:text-ivory"
          />
        </div>
        <select
          value={challengeTag}
          onChange={(e) => setChallengeTag(e.target.value)}
          className="w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm text-ink/80"
        >
          <option value="">No challenge, just sharing</option>
          {CHALLENGES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} Challenge: {c.label}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={uploading}
          className="rounded-full bg-terracotta px-6 py-3 font-mono text-sm text-ivory disabled:opacity-60"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}

      <div className="relative">
        {toast && (
          <div className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 animate-toast-in">
            <span className="rounded-full bg-ink/85 px-4 py-2 font-mono text-xs text-ivory shadow-lg">{toast}</span>
          </div>
        )}
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sage/15 bg-white/60 p-5">
          <h2 className="font-mono text-sm text-terracotta">🏆 Most Loved Photos</h2>
          {mostLiked.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">No likes yet. Be the first to heart a photo!</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {mostLiked.map((photo, i) => (
                <li key={photo._id}>
                  <button
                    onClick={() => openLightboxFor(photo._id)}
                    className="flex w-full items-center gap-3 rounded-lg p-1.5 text-left hover:bg-sage/5"
                  >
                    <span className="w-5 shrink-0 font-mono text-xs text-ink/40">#{i + 1}</span>
                    <img src={photo.url} alt="" className="h-12 w-12 shrink-0 rounded-md object-cover" />
                    <span className="flex-1 truncate font-mono text-xs text-ink/70">
                      {photo.uploadedBy || "Anonymous"}
                    </span>
                    <span className="shrink-0 font-mono text-xs text-terracotta">
                      ♥ {photo.likedBy.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-sage/15 bg-white/60 p-5">
          <h2 className="font-mono text-sm text-terracotta">🎯 Challenge Champions</h2>
          {challengeFinishers.length === 0 ? (
            <p className="mt-3 text-sm text-ink/50">
              No one's completed all three challenges yet. Go find the groomsmen, bridal team, and parents!
            </p>
          ) : (
            <>
              <ul className="mt-3 space-y-2">
                {challengeFinishers.slice(0, 3).map((finisher, i) => (
                  <li key={finisher.name} className="flex items-center gap-3 p-1.5">
                    <span className="w-5 shrink-0 text-base">{MEDALS[i]}</span>
                    <span className="flex-1 truncate font-mono text-xs text-ink/70">{finisher.name}</span>
                    <span className="shrink-0 font-mono text-xs text-terracotta">{CHALLENGE_PRIZES[i]}</span>
                  </li>
                ))}
              </ul>
              {challengeFinishers.length > 3 && (
                <p className="mt-3 text-xs text-ink/50">
                  +{challengeFinishers.length - 3} more completed all three! (prizes go to the first three)
                </p>
              )}
            </>
          )}
        </div>
      </div>

      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, i) => (
          <div
            key={photo._id}
            onClick={() => setLightboxIndex(i)}
            className={`group relative mb-4 cursor-pointer overflow-hidden rounded-xl border border-sage/15 bg-white/60 break-inside-avoid ${
              newIds.has(photo._id) ? "animate-photo-in animate-glow-ring" : ""
            } ${mostLiked[0]?._id === photo._id ? "ring-2 ring-gold" : ""}`}
          >
            <img
              src={photo.url}
              alt={photo.uploadedBy ? `Uploaded by ${photo.uploadedBy}` : "Wedding photo"}
              className="w-full object-cover"
              loading="lazy"
            />
            {photo.challengeTag && (
              <div className="absolute top-2 left-2">
                <ChallengeBadge tag={photo.challengeTag} />
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-linear-to-t from-ink/60 to-transparent px-3 py-2">
              {photo.uploadedBy ? (
                <span className="font-mono text-xs text-ivory drop-shadow">{photo.uploadedBy}</span>
              ) : (
                <span />
              )}
              <HeartButton
                liked={myName ? photo.likedBy.includes(myName) : false}
                likes={photo.likedBy.length}
                onLike={() => requestLike(photo)}
              />
            </div>
          </div>
        ))}
      </div>

      {photos.length === 0 && (
        <p className="mt-16 text-center text-sm text-ink/40">No photos yet. Be the first!</p>
      )}

      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={photos}
          index={lightboxIndex}
          myName={myName}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
          onLike={requestLike}
        />
      )}

      {pendingLikePhotoId && (
        <NamePrompt onSubmit={handleNameSubmit} onCancel={() => setPendingLikePhotoId(null)} />
      )}

      {confettiKey !== null && <Confetti key={confettiKey} onDone={() => setConfettiKey(null)} />}
    </div>
  );
}
