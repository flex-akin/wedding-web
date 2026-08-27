import { useSettings } from "../lib/useSettings";
import { CopyButton } from "../components/CopyButton";
import { LiveDistance } from "../components/LiveDistance";
import { googleMapsDirectionsUrl, appleMapsUrl, wazeUrl, embedMapUrl } from "../lib/mapLinks";
import type { VenueInfo } from "../types";

function VenueCard({ title, venue }: { title: string; venue?: VenueInfo }) {
  if (!venue || !venue.name) {
    return (
      <div className="rounded-2xl border border-sage/15 bg-white/60 p-6">
        <h3 className="text-xl">{title}</h3>
        <p className="mt-2 text-sm text-ink/50">Details coming soon.</p>
      </div>
    );
  }

  const hasCoords = typeof venue.lat === "number" && typeof venue.lng === "number";

  return (
    <div className="overflow-hidden rounded-2xl border border-sage/15 bg-white/60">
      {hasCoords && (
        <iframe
          src={embedMapUrl(venue.lat!, venue.lng!)}
          className="h-56 w-full"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map to ${venue.name}`}
        />
      )}

      <div className="p-6">
        <h3 className="text-xl">{title}</h3>
        <p className="mt-1 font-mono text-sm text-terracotta">{venue.time}</p>
        <p className="mt-3 font-medium">{venue.name}</p>
        <p className="mt-1 text-sm text-ink/70">{venue.address}</p>

        {hasCoords && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-ink/5 px-3 py-2">
            <code className="flex-1 truncate font-mono text-xs text-ink/60">
              {`{ lat: ${venue.lat}, lng: ${venue.lng} }`}
            </code>
            <CopyButton value={`${venue.lat}, ${venue.lng}`} iconOnly label="Copy coordinates" />
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          {hasCoords ? (
            <>
              <a
                href={googleMapsDirectionsUrl(venue.lat!, venue.lng!)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-sage px-4 py-2 font-mono text-xs text-ivory transition-transform hover:scale-[1.03]"
              >
                Google Maps
              </a>
              <a
                href={appleMapsUrl(venue.lat!, venue.lng!)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-sage/40 px-4 py-2 font-mono text-xs text-sage transition-transform hover:scale-[1.03]"
              >
                Apple Maps
              </a>
              <a
                href={wazeUrl(venue.lat!, venue.lng!)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-terracotta/40 px-4 py-2 font-mono text-xs text-terracotta transition-transform hover:scale-[1.03]"
              >
                Waze
              </a>
            </>
          ) : (
            venue.mapsUrl && (
              <a
                href={venue.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-sage px-5 py-2.5 font-mono text-xs text-ivory"
              >
                Open in Maps
              </a>
            )
          )}
        </div>

        {hasCoords && (
          <div className="mt-4">
            <LiveDistance lat={venue.lat!} lng={venue.lng!} />
          </div>
        )}
      </div>
    </div>
  );
}

export function Directions() {
  const { settings, loading, error } = useSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Directions</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">Where to be, and when.</p>

      {loading && <p className="mt-10 text-center text-sm text-ink/50">Loading…</p>}
      {error && <p className="mt-10 text-center text-sm text-red-600">{error}</p>}

      {settings && (
        <div className="mt-10 space-y-8">
          <VenueCard title="Gaarden Wedding" venue={settings.ceremony} />
          <VenueCard title="Engagement & Reception" venue={settings.reception} />
        </div>
      )}
    </div>
  );
}
