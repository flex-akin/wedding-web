import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { ColorOfDay, GiftAccount, ProgramEvent, Settings, VenueInfo } from "../../types";

function toDateInputValue(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 16);
}

const emptyVenue: VenueInfo = { name: "", address: "", mapsUrl: "", time: "" };
const COORD_REGEX = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
const emptyGiftAccount: GiftAccount = { label: "", accountName: "", accountNumber: "", bankName: "" };
const emptyProgramEvent: ProgramEvent = { name: "", time: "", note: "", colors: [] };
const emptyColorOfDay: ColorOfDay = { label: "", hex: "#4A5D48" };

export function AdminSettings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [photoshootImagesText, setPhotoshootImagesText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Settings>("/settings").then((s) => {
      setForm(s);
      setPhotoshootImagesText(s.photoshootImages.join("\n"));
    });
  }, []);

  if (!form) return <p className="text-sm text-ink/50">Loading…</p>;

  function updateVenue(key: "ceremony" | "reception", patch: Partial<VenueInfo>) {
    setForm((prev) => (prev ? { ...prev, [key]: { ...(prev[key] ?? emptyVenue), ...patch } } : prev));
  }

  function updateVenueMapsUrl(key: "ceremony" | "reception", url: string) {
    const match = url.match(COORD_REGEX);
    if (match) {
      updateVenue(key, { mapsUrl: url, lat: parseFloat(match[1]), lng: parseFloat(match[2]) });
    } else {
      updateVenue(key, { mapsUrl: url });
    }
  }

  function updateEventColors(eventIndex: number, colors: ColorOfDay[]) {
    setForm((prev) => {
      if (!prev) return prev;
      const nextEvents = [...prev.programOfEvents];
      nextEvents[eventIndex] = { ...nextEvents[eventIndex], colors };
      return { ...prev, programOfEvents: nextEvents };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await apiRequest("/settings", {
        method: "PUT",
        admin: true,
        body: {
          ...form,
          photoshootImages: photoshootImagesText.split("\n").map((s) => s.trim()).filter(Boolean),
        },
      });
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm";
  const labelClass = "block font-mono text-xs text-sage";

  return (
    <form onSubmit={handleSave} className="max-w-2xl space-y-8">
      <h1 className="text-2xl">Settings</h1>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Partner one name</label>
          <input
            value={form.partnerOneName}
            onChange={(e) => setForm({ ...form, partnerOneName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Partner two name</label>
          <input
            value={form.partnerTwoName}
            onChange={(e) => setForm({ ...form, partnerTwoName: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Wedding date &amp; time</label>
          <input
            type="datetime-local"
            value={toDateInputValue(form.weddingDate)}
            onChange={(e) => setForm({ ...form, weddingDate: new Date(e.target.value).toISOString() })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>RSVP deadline</label>
          <input
            type="datetime-local"
            value={toDateInputValue(form.rsvpDeadline)}
            onChange={(e) => setForm({ ...form, rsvpDeadline: new Date(e.target.value).toISOString() })}
            className={inputClass}
          />
        </div>
      </section>

      {(
        [
          { key: "ceremony", label: "Gaarden Wedding" },
          { key: "reception", label: "Engagement & Reception" },
        ] as const
      ).map(({ key, label }) => (
        <section key={key}>
          <h2 className="font-mono text-sm text-terracotta">{label} venue</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              placeholder="Venue name"
              value={form[key]?.name ?? ""}
              onChange={(e) => updateVenue(key, { name: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Time (e.g. 10:00 AM)"
              value={form[key]?.time ?? ""}
              onChange={(e) => updateVenue(key, { time: e.target.value })}
              className={inputClass}
            />
            <input
              placeholder="Address"
              value={form[key]?.address ?? ""}
              onChange={(e) => updateVenue(key, { address: e.target.value })}
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              placeholder="Google Maps URL (paste a link with @lat,lng to auto-fill coordinates)"
              value={form[key]?.mapsUrl ?? ""}
              onChange={(e) => updateVenueMapsUrl(key, e.target.value)}
              className={`${inputClass} sm:col-span-2`}
            />
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={form[key]?.lat ?? ""}
              onChange={(e) => updateVenue(key, { lat: e.target.value ? parseFloat(e.target.value) : undefined })}
              className={inputClass}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={form[key]?.lng ?? ""}
              onChange={(e) => updateVenue(key, { lng: e.target.value ? parseFloat(e.target.value) : undefined })}
              className={inputClass}
            />
          </div>
        </section>
      ))}

      <section>
        <h2 className="font-mono text-sm text-terracotta">Our Story</h2>
        <div className="mt-3 space-y-3">
          <div>
            <label className={labelClass}>Story photo URL</label>
            <input
              placeholder="/images/proposal-hero.jpg"
              value={form.ourStoryImageUrl ?? ""}
              onChange={(e) => setForm({ ...form, ourStoryImageUrl: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>The story</label>
            <textarea
              value={form.ourStory}
              onChange={(e) => setForm({ ...form, ourStory: e.target.value })}
              rows={16}
              className={inputClass}
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-sm text-terracotta">Order of the Day</h2>
        <div className="mt-3 space-y-3">
          {form.programOfEvents.map((event, i) => (
            <div key={i} className="rounded-lg border border-sage/15 p-3">
              <div className="grid gap-2 sm:grid-cols-3">
                <input
                  placeholder="Event name"
                  value={event.name}
                  onChange={(e) => {
                    const next = [...form.programOfEvents];
                    next[i] = { ...next[i], name: e.target.value };
                    setForm({ ...form, programOfEvents: next });
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Time (e.g. 8:00 AM)"
                  value={event.time}
                  onChange={(e) => {
                    const next = [...form.programOfEvents];
                    next[i] = { ...next[i], time: e.target.value };
                    setForm({ ...form, programOfEvents: next });
                  }}
                  className={inputClass}
                />
                <input
                  placeholder="Note (e.g. Strictly by invitation)"
                  value={event.note}
                  onChange={(e) => {
                    const next = [...form.programOfEvents];
                    next[i] = { ...next[i], note: e.target.value };
                    setForm({ ...form, programOfEvents: next });
                  }}
                  className={inputClass}
                />
              </div>

              <div className="mt-3 border-t border-sage/10 pt-3">
                <p className={labelClass}>Colour of the day for this event</p>
                <div className="mt-2 space-y-2">
                  {event.colors.map((color, ci) => (
                    <div key={ci} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => {
                          const next = [...event.colors];
                          next[ci] = { ...next[ci], hex: e.target.value };
                          updateEventColors(i, next);
                        }}
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-sage/25 bg-white p-1"
                      />
                      <input
                        placeholder="Label (e.g. Wine)"
                        value={color.label}
                        onChange={(e) => {
                          const next = [...event.colors];
                          next[ci] = { ...next[ci], label: e.target.value };
                          updateEventColors(i, next);
                        }}
                        className={`${inputClass} mt-0 flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() => updateEventColors(i, event.colors.filter((_, idx) => idx !== ci))}
                        className="shrink-0 rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => updateEventColors(i, [...event.colors, { ...emptyColorOfDay }])}
                    className="rounded-full border border-sage/30 px-4 py-2 font-mono text-xs text-sage hover:bg-sage/10"
                  >
                    + Add color
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, programOfEvents: form.programOfEvents.filter((_, idx) => idx !== i) })
                }
                className="mt-3 rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
              >
                Remove event
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({ ...form, programOfEvents: [...form.programOfEvents, { ...emptyProgramEvent }] })
            }
            className="rounded-full border border-sage/30 px-4 py-2 font-mono text-xs text-sage hover:bg-sage/10"
          >
            + Add event
          </button>
        </div>
      </section>

      <section>
        <h2 className="font-mono text-sm text-terracotta">Photoshoot</h2>
        <div className="mt-3">
          <label className={labelClass}>Image URLs (one per line)</label>
          <textarea
            value={photoshootImagesText}
            onChange={(e) => setPhotoshootImagesText(e.target.value)}
            rows={4}
            className={inputClass}
          />
        </div>
      </section>

      <section>
        <h2 className="font-mono text-sm text-terracotta">Gifts</h2>
        <div className="mt-3">
          <label className={labelClass}>Note shown on the Gifts page</label>
          <textarea
            value={form.giftNote}
            onChange={(e) => setForm({ ...form, giftNote: e.target.value })}
            rows={2}
            className={inputClass}
          />
        </div>

        <div className="mt-4 space-y-3">
          {form.giftAccounts.map((account, i) => (
            <div key={i} className="grid gap-2 rounded-lg border border-sage/15 p-3 sm:grid-cols-2">
              <input
                placeholder="Label (e.g. Naira account)"
                value={account.label}
                onChange={(e) => {
                  const next = [...form.giftAccounts];
                  next[i] = { ...next[i], label: e.target.value };
                  setForm({ ...form, giftAccounts: next });
                }}
                className={`${inputClass} sm:col-span-2`}
              />
              <input
                placeholder="Account name"
                value={account.accountName}
                onChange={(e) => {
                  const next = [...form.giftAccounts];
                  next[i] = { ...next[i], accountName: e.target.value };
                  setForm({ ...form, giftAccounts: next });
                }}
                className={inputClass}
              />
              <input
                placeholder="Bank name"
                value={account.bankName}
                onChange={(e) => {
                  const next = [...form.giftAccounts];
                  next[i] = { ...next[i], bankName: e.target.value };
                  setForm({ ...form, giftAccounts: next });
                }}
                className={inputClass}
              />
              <input
                placeholder="Account number"
                value={account.accountNumber}
                onChange={(e) => {
                  const next = [...form.giftAccounts];
                  next[i] = { ...next[i], accountNumber: e.target.value };
                  setForm({ ...form, giftAccounts: next });
                }}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => setForm({ ...form, giftAccounts: form.giftAccounts.filter((_, idx) => idx !== i) })}
                className="self-start rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setForm({ ...form, giftAccounts: [...form.giftAccounts, { ...emptyGiftAccount }] })}
            className="rounded-full border border-sage/30 px-4 py-2 font-mono text-xs text-sage hover:bg-sage/10"
          >
            + Add gift account
          </button>
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-sage">Saved.</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-full bg-sage px-6 py-3 font-mono text-sm text-ivory disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
