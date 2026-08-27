import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { Photo } from "../../types";

export function AdminPhotos() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiRequest<Photo[]>("/photos/all", { admin: true })
      .then(setPhotos)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleApproved(photo: Photo) {
    await apiRequest(`/photos/${photo._id}`, {
      method: "PATCH",
      admin: true,
      body: { approved: !photo.approved },
    });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl">Photo Moderation</h1>
      <p className="mt-2 text-sm text-ink/60">
        Photos are visible on the live wall by default. Hide anything that shouldn't be there.
      </p>

      {loading && <p className="mt-6 text-sm text-ink/50">Loading…</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div key={photo._id} className="overflow-hidden rounded-xl border border-sage/15 bg-white/60">
            <img src={photo.url} alt="" className="aspect-square w-full object-cover" />
            <div className="flex items-center justify-between p-2">
              <span className={`font-mono text-xs ${photo.approved ? "text-sage" : "text-terracotta"}`}>
                {photo.approved ? "visible" : "hidden"}
              </span>
              <button
                onClick={() => toggleApproved(photo)}
                className="rounded-md border border-sage/30 px-2 py-1 font-mono text-xs text-sage hover:bg-sage/10"
              >
                {photo.approved ? "Hide" : "Show"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && photos.length === 0 && (
        <p className="mt-10 text-sm text-ink/40">No photos uploaded yet.</p>
      )}
    </div>
  );
}
