import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import type { Guest } from "../types";

export function RSVP() {
  const { slug } = useParams<{ slug: string }>();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [rsvpStatus, setRsvpStatus] = useState<"attending" | "declined">("attending");
  const [mealChoice, setMealChoice] = useState("");
  const [plusOneNames, setPlusOneNames] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!slug) return;
    apiRequest<Guest>(`/guests/slug/${slug}`)
      .then((g) => {
        setGuest(g);
        if (g.rsvpStatus !== "pending") setRsvpStatus(g.rsvpStatus as "attending" | "declined");
        setMealChoice(g.mealChoice ?? "");
        setPlusOneNames(g.plusOnes.map((p) => p.name));
        setNotes(g.notes ?? "");
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!slug) return;
    setSubmitting(true);
    setError(null);
    try {
      const updated = await apiRequest<Guest>(`/guests/slug/${slug}/rsvp`, {
        method: "POST",
        body: {
          rsvpStatus,
          mealChoice: mealChoice || undefined,
          plusOnes: plusOneNames.filter((n) => n.trim()).map((name) => ({ name })),
          notes: notes || undefined,
        },
      });
      setGuest(updated);
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="px-4 py-20 text-center text-sm text-ink/50">Loading your invite…</p>;
  }

  if (error && !guest) {
    return (
      <div className="px-4 py-20 text-center">
        <p className="text-lg">We couldn't find that invite.</p>
        <p className="mt-2 text-sm text-ink/60">Double-check the link, or reach out to the couple.</p>
      </div>
    );
  }

  if (!guest) return null;

  const extraSlots = Math.max(0, guest.partySize - 1);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Hi {guest.name.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-center text-sm text-ink/60">
        {guest.partySize > 1
          ? `You're invited with up to ${guest.partySize - 1} guest${guest.partySize - 1 === 1 ? "" : "s"}.`
          : "We'd love to have you celebrate with us."}
      </p>

      {submitted ? (
        <div className="mt-10 rounded-2xl border border-sage/20 bg-white/70 p-8 text-center">
          <p className="text-xl">
            {rsvpStatus === "attending" ? "Thank you for RSVPing. See you there! 🎉" : "Thanks for letting us know."}
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 font-mono text-xs text-terracotta underline"
          >
            Edit response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <fieldset className="flex gap-3">
            <button
              type="button"
              onClick={() => setRsvpStatus("attending")}
              className={`flex-1 rounded-xl border px-4 py-3 font-mono text-sm ${
                rsvpStatus === "attending"
                  ? "border-sage bg-sage text-ivory"
                  : "border-sage/30 text-sage"
              }`}
            >
              Joyfully attending
            </button>
            <button
              type="button"
              onClick={() => setRsvpStatus("declined")}
              className={`flex-1 rounded-xl border px-4 py-3 font-mono text-sm ${
                rsvpStatus === "declined"
                  ? "border-terracotta bg-terracotta text-ivory"
                  : "border-terracotta/30 text-terracotta"
              }`}
            >
              Can't make it
            </button>
          </fieldset>

          {rsvpStatus === "attending" && (
            <>
              <div>
                <label className="block font-mono text-xs text-sage">Meal choice</label>
                <input
                  value={mealChoice}
                  onChange={(e) => setMealChoice(e.target.value)}
                  placeholder="e.g. Jollof rice, no seafood"
                  className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
                />
              </div>

              {extraSlots > 0 && (
                <div className="space-y-2">
                  <label className="block font-mono text-xs text-sage">Guest names</label>
                  {Array.from({ length: extraSlots }).map((_, i) => (
                    <input
                      key={i}
                      value={plusOneNames[i] ?? ""}
                      onChange={(e) => {
                        const next = [...plusOneNames];
                        next[i] = e.target.value;
                        setPlusOneNames(next);
                      }}
                      placeholder={`Guest ${i + 1} name`}
                      className="w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
                    />
                  ))}
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-mono text-xs text-sage">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-sage py-3 font-mono text-sm text-ivory disabled:opacity-60"
          >
            {submitting ? "Sending…" : "Send RSVP"}
          </button>
        </form>
      )}
    </div>
  );
}
