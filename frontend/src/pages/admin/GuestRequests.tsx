import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { GuestRequest } from "../../types";

const statusColors: Record<GuestRequest["status"], string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-sage/15 text-sage",
  rejected: "bg-terracotta/15 text-terracotta",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AdminGuestRequests() {
  const [requests, setRequests] = useState<GuestRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    apiRequest<GuestRequest[]>("/guest-requests", { admin: true })
      .then(setRequests)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function approve(id: string) {
    setError(null);
    try {
      await apiRequest(`/guest-requests/${id}/approve`, { method: "PATCH", admin: true });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function reject(id: string) {
    setError(null);
    try {
      await apiRequest(`/guest-requests/${id}/reject`, { method: "PATCH", admin: true });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const pending = requests.filter((r) => r.status === "pending");
  const resolved = requests.filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="text-2xl">Guest Requests</h1>
      <p className="mt-2 text-sm text-ink/60">
        People who searched for their number on /rsvp and weren't found. Approving adds them as a real guest.
      </p>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {loading && <p className="mt-6 text-sm text-ink/50">Loading…</p>}

      {!loading && pending.length === 0 && (
        <p className="mt-6 text-sm text-ink/40">No pending requests.</p>
      )}

      <div className="mt-6 space-y-3">
        {pending.map((r) => (
          <div key={r._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="font-mono text-xs text-ink/50">
                  {r.phone} · {formatDate(r.createdAt)}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 font-mono text-xs ${statusColors[r.status]}`}>
                {r.status}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => approve(r._id)}
                className="rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10"
              >
                Approve
              </button>
              <button
                onClick={() => reject(r._id)}
                className="rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="mt-10 font-mono text-sm text-terracotta">Resolved</h2>
          <div className="mt-3 space-y-2">
            {resolved.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl border border-sage/10 bg-white/40 p-3">
                <div>
                  <p className="text-sm">{r.name}</p>
                  <p className="font-mono text-xs text-ink/40">{r.phone}</p>
                </div>
                <span className={`rounded-full px-3 py-1 font-mono text-xs ${statusColors[r.status]}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
