import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

interface GuestMatch {
  name: string;
  slug: string;
}

export function RsvpLookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError(null);
    try {
      const matches = await apiRequest<GuestMatch[]>(`/guests/lookup?q=${encodeURIComponent(query.trim())}`);
      setResults(matches);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">RSVP</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
        Type the name or phone number your invite is under to find your RSVP link.
      </p>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Your name or phone number"
          className="flex-1 rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={searching || query.trim().length < 2}
          className="rounded-full bg-sage px-6 py-3 font-mono text-sm text-ivory disabled:opacity-60"
        >
          {searching ? "Searching…" : "Find me"}
        </button>
      </form>

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}

      {results && (
        <div className="mt-8 space-y-3">
          {results.length === 0 ? (
            <p className="text-center text-sm text-ink/50">
              No invite found under that name or number. Double-check it, or reach out to the couple directly.
            </p>
          ) : (
            results.map((guest) => (
              <Link
                key={guest.slug}
                to={`/rsvp/${guest.slug}`}
                className="block rounded-2xl border border-sage/15 bg-white/60 p-4 text-center transition-transform hover:scale-[1.02]"
              >
                <span className="font-medium">{guest.name}</span>
                <span className="block font-mono text-xs text-terracotta">Tap to RSVP →</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
