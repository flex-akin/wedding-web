import { useSettings } from "../lib/useSettings";
import { PhotoshootGallery } from "../components/PhotoshootGallery";

export function Photoshoot() {
  const { settings, loading, error } = useSettings();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">The Photoshoot</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">A preview of the day, before the day.</p>

      {loading && <p className="mt-10 text-center text-sm text-ink/50">Loading…</p>}
      {error && <p className="mt-10 text-center text-sm text-red-600">{error}</p>}

      {settings && (
        <div className="mt-10">
          <PhotoshootGallery images={settings.photoshootImages} />
        </div>
      )}
    </div>
  );
}
