import { useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";

interface GuestMatch {
  name: string;
  slug: string;
}

function isMostlyDigits(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length >= value.trim().replace(/\s/g, "").length * 0.6 && digits.length >= 5;
}

export function RsvpLookup() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GuestMatch[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [requestName, setRequestName] = useState("");
  const [requestPhone, setRequestPhone] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [requestSubmitted, setRequestSubmitted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError(null);
    setRequestSubmitted(false);
    try {
      const matches = await apiRequest<GuestMatch[]>(`/guests/lookup?q=${encodeURIComponent(query.trim())}`);
      setResults(matches);
      setRequestPhone((current) => current || (isMostlyDigits(query) ? query.trim() : ""));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function handleRequestSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!requestName.trim() || !requestPhone.trim()) return;
    setRequesting(true);
    setRequestError(null);
    try {
      await apiRequest("/guest-requests", {
        method: "POST",
        body: { name: requestName.trim(), phone: requestPhone.trim() },
      });
      setRequestSubmitted(true);
    } catch (e) {
      setRequestError((e as Error).message);
    } finally {
      setRequesting(false);
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
              No invite found under that name or number. Double-check it, or request access below.
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

          {results.length === 0 &&
            (requestSubmitted ? (
              <div className="rounded-2xl border border-sage/20 bg-white/70 p-6 text-center">
                <p className="text-sm text-ink/80">
                  Request submitted. We'll review it and let you know once you're approved.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleRequestSubmit}
                className="rounded-2xl border border-sage/15 bg-white/60 p-5"
              >
                <p className="font-mono text-xs text-terracotta">NOT ON THE LIST YET?</p>
                <p className="mt-1 text-xs text-ink/60">
                  If you were invited but your number isn't showing up, submit it here for approval.
                </p>
                <input
                  required
                  value={requestName}
                  onChange={(e) => setRequestName(e.target.value)}
                  placeholder="Your name"
                  className="mt-3 w-full rounded-lg border border-sage/25 bg-white px-4 py-2.5 text-sm"
                />
                <input
                  required
                  type="tel"
                  value={requestPhone}
                  onChange={(e) => setRequestPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="mt-2 w-full rounded-lg border border-sage/25 bg-white px-4 py-2.5 text-sm"
                />
                {requestError && <p className="mt-2 text-xs text-red-600">{requestError}</p>}
                <button
                  type="submit"
                  disabled={requesting}
                  className="mt-3 w-full rounded-full bg-terracotta py-2.5 font-mono text-xs text-ivory disabled:opacity-60"
                >
                  {requesting ? "Submitting…" : "Request access"}
                </button>
              </form>
            ))}
        </div>
      )}
    </div>
  );
}
