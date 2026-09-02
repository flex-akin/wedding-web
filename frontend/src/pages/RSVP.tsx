import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { AccessCard } from "../components/AccessCard";
import { useSettings } from "../lib/useSettings";
import type { Guest } from "../types";

export function RSVP() {
  const { slug } = useParams<{ slug: string }>();
  const { settings } = useSettings();
  const [guest, setGuest] = useState<Guest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);

  const [attendingCeremony, setAttendingCeremony] = useState(false);
  const [attendingReception, setAttendingReception] = useState(false);
  const [plusOneNames, setPlusOneNames] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!slug) return;
    apiRequest<Guest>(`/guests/slug/${slug}`)
      .then((g) => {
        setGuest(g);
        setEditing(g.rsvpStatus === "pending");
        setAttendingCeremony(g.attendingCeremony);
        setAttendingReception(g.attendingReception);
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
          attendingCeremony,
          attendingReception,
          plusOnes: plusOneNames.filter((n) => n.trim()).map((name) => ({ name })),
          notes: notes || undefined,
        },
      });
      setGuest(updated);
      setEditing(false);
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
  const ceremonyTime = settings?.ceremony?.time;
  const receptionTime = settings?.reception?.time;
  const canPickGuests = attendingCeremony || attendingReception;

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Hi {guest.name.split(" ")[0]} 👋</h1>
      <p className="mt-2 text-center text-sm text-ink/60">
        {guest.partySize > 1
          ? `You're invited with up to ${guest.partySize - 1} guest${guest.partySize - 1 === 1 ? "" : "s"}.`
          : "We'd love to have you celebrate with us."}
      </p>

      {!editing ? (
        <div className="mt-10 text-center">
          {guest.rsvpStatus === "attending" ? (
            <>
              <div className="rounded-2xl border border-sage/20 bg-white/70 p-8">
                <p className="text-xl">Thank you for RSVPing. See you there! 🎉</p>
              </div>
              {settings && (
                <AccessCard
                  guest={guest}
                  partnerOneName={settings.partnerOneName}
                  partnerTwoName={settings.partnerTwoName}
                  weddingDate={settings.weddingDate}
                />
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-sage/20 bg-white/70 p-8">
              <p className="text-xl">Thanks for letting us know.</p>
            </div>
          )}
          <button
            onClick={() => setEditing(true)}
            className="mt-4 font-mono text-xs text-terracotta underline"
          >
            Change my response
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <fieldset className="space-y-3">
            <label className="block font-mono text-xs text-sage">Which events will you join us for?</label>
            <button
              type="button"
              onClick={() => setAttendingCeremony((v) => !v)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-mono text-sm ${
                attendingCeremony ? "border-sage bg-sage text-ivory" : "border-sage/30 text-sage"
              }`}
            >
              <span>Garden Wedding{ceremonyTime ? ` — ${ceremonyTime}` : ""}</span>
              <span>{attendingCeremony ? "✓" : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => setAttendingReception((v) => !v)}
              className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-mono text-sm ${
                attendingReception ? "border-terracotta bg-terracotta text-ivory" : "border-terracotta/30 text-terracotta"
              }`}
            >
              <span>Engagement{receptionTime ? ` — ${receptionTime}` : ""}</span>
              <span>{attendingReception ? "✓" : ""}</span>
            </button>
            <p className="text-xs text-ink/50">Leave both unchecked if you can't make it to either.</p>
          </fieldset>

          {canPickGuests && extraSlots > 0 && (
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
