import { useSettings } from "../lib/useSettings";
import { OurStoryPanel } from "../components/OurStoryPanel";
import { PdfEmbed } from "../components/PdfEmbed";

export function OurStory() {
  const { settings, loading, error } = useSettings();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Our Story</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">From strangers to forever.</p>

      {loading && <p className="mt-10 text-center text-sm text-ink/50">Loading…</p>}
      {error && <p className="mt-10 text-center text-sm text-red-600">{error}</p>}

      {settings && (
        <>
          <div className="mt-10">
            <OurStoryPanel
              story={settings.ourStory}
              imageUrl={settings.ourStoryImageUrl}
              fromImage={settings.ourStoryFromImage}
              toImage={settings.ourStoryToImage}
            />
          </div>

          {settings.ourStoryPdfUrl && (
            <div className="mt-16">
              <p className="mb-4 text-center font-mono text-xs text-terracotta">THE KEEPSAKE EDITION</p>
              <PdfEmbed src={settings.ourStoryPdfUrl} title="Flora & Felix: Our Love Story" />
            </div>
          )}
        </>
      )}
    </div>
  );
}
