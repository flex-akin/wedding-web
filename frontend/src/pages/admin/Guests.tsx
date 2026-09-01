import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { apiRequest } from "../../api/client";
import { CopyButton } from "../../components/CopyButton";
import type { Guest } from "../../types";

const statusColors: Record<Guest["rsvpStatus"], string> = {
  attending: "bg-sage/15 text-sage",
  declined: "bg-terracotta/15 text-terracotta",
  pending: "bg-gold/15 text-gold",
};

export function AdminGuests() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [partySize, setPartySize] = useState(1);
  const [bulkNames, setBulkNames] = useState("");
  const [bulkPhoneRows, setBulkPhoneRows] = useState("");
  const [search, setSearch] = useState("");
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiRequest<Guest[]>("/guests", { admin: true })
      .then(setGuests)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  const filteredGuests = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter(
      (g) => g.name.toLowerCase().includes(q) || (g.phone ?? "").toLowerCase().includes(q)
    );
  }, [guests, search]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest("/guests", {
        method: "POST",
        admin: true,
        body: { name, partySize, phone: phone || undefined },
      });
      setName("");
      setPhone("");
      setPartySize(1);
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleBulkAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const names = bulkNames.split("\n").map((n) => n.trim()).filter(Boolean);
    if (names.length === 0) return;
    try {
      await apiRequest("/guests/bulk", { method: "POST", admin: true, body: { names } });
      setBulkNames("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleBulkPhoneAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const entries = bulkPhoneRows
      .split("\n")
      .map((line) => {
        const [name, phone] = line.split(",");
        return { name: name?.trim() ?? "", phone: phone?.trim() };
      })
      .filter((entry) => entry.name);
    if (entries.length === 0) return;
    try {
      await apiRequest("/guests/bulk", { method: "POST", admin: true, body: { entries } });
      setBulkPhoneRows("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this guest?")) return;
    await apiRequest(`/guests/${id}`, { method: "DELETE", admin: true });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl">Guests</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <form onSubmit={handleAdd} className="rounded-xl border border-sage/15 bg-white/60 p-4">
          <h2 className="font-mono text-sm text-sage">Add one guest</h2>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Guest name"
            className="mt-3 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number (optional)"
            className="mt-2 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            value={partySize}
            onChange={(e) => setPartySize(Math.max(1, Number(e.target.value)))}
            className="mt-2 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
          />
          <button className="mt-3 w-full rounded-full bg-sage py-2 font-mono text-xs text-ivory">
            Add guest
          </button>
        </form>

        <form onSubmit={handleBulkAdd} className="rounded-xl border border-sage/15 bg-white/60 p-4">
          <h2 className="font-mono text-sm text-sage">Bulk add (one name per line)</h2>
          <textarea
            value={bulkNames}
            onChange={(e) => setBulkNames(e.target.value)}
            rows={3}
            placeholder={"The Okafors\nJane Doe"}
            className="mt-3 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
          />
          <button className="mt-3 w-full rounded-full bg-terracotta py-2 font-mono text-xs text-ivory">
            Add all
          </button>
        </form>
      </div>

      <form onSubmit={handleBulkPhoneAdd} className="mt-4 rounded-xl border border-sage/15 bg-white/60 p-4">
        <h2 className="font-mono text-sm text-sage">Bulk add with phone numbers</h2>
        <p className="mt-1 text-xs text-ink/50">
          One guest per line, as <span className="font-mono">Name, Phone</span>. Any format works.
          +234, 234, and 0-prefixed numbers all match on search.
        </p>
        <textarea
          value={bulkPhoneRows}
          onChange={(e) => setBulkPhoneRows(e.target.value)}
          rows={4}
          placeholder={"Jane Doe, 08012345678\nJohn Okafor, +2348098765432"}
          className="mt-3 w-full rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
        />
        <button className="mt-3 rounded-full bg-terracotta px-6 py-2 font-mono text-xs text-ivory">
          Add all
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search guests by name or phone…"
        className="mt-8 w-full max-w-md rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
      />

      <div className="mt-4 space-y-3">
        {loading && <p className="text-sm text-ink/50">Loading…</p>}
        {filteredGuests.map((guest) => {
          const link = `${window.location.origin}/rsvp/${guest.slug}`;
          return (
            <div key={guest._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{guest.name}</p>
                  <p className="font-mono text-xs text-ink/50">
                    party of {guest.partySize} · /rsvp/{guest.slug}
                    {guest.phone ? ` · ${guest.phone}` : ""}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 font-mono text-xs ${statusColors[guest.rsvpStatus]}`}>
                  {guest.rsvpStatus}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <CopyButton value={link} label="Copy RSVP link" />
                <button
                  onClick={() => setQrSlug(qrSlug === guest.slug ? null : guest.slug)}
                  className="rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10"
                >
                  {qrSlug === guest.slug ? "Hide QR" : "Show QR"}
                </button>
                <button
                  onClick={() => handleDelete(guest._id)}
                  className="rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>

              {qrSlug === guest.slug && (
                <div className="mt-3 inline-block rounded-lg bg-white p-3">
                  <QRCodeSVG value={link} size={140} />
                </div>
              )}
            </div>
          );
        })}
        {!loading && filteredGuests.length === 0 && (
          <p className="text-sm text-ink/40">No guests match that search.</p>
        )}
      </div>
    </div>
  );
}
