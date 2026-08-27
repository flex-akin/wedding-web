import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { HotelReservation } from "../../types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function AdminHotelReservations() {
  const [reservations, setReservations] = useState<HotelReservation[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiRequest<HotelReservation[]>("/hotel-reservations", { admin: true })
      .then(setReservations)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function confirm(id: string) {
    await apiRequest(`/hotel-reservations/${id}`, { method: "PATCH", admin: true, body: { status: "confirmed" } });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl">Hotel Reservations</h1>

      {loading && <p className="mt-6 text-sm text-ink/50">Loading…</p>}

      <div className="mt-6 space-y-3">
        {reservations.map((r) => (
          <div key={r._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{r.name}</p>
                <p className="font-mono text-xs text-ink/50">{r.contact}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs ${
                  r.status === "confirmed" ? "bg-sage/15 text-sage" : "bg-gold/15 text-gold"
                }`}
              >
                {r.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/70">
              {formatDate(r.checkIn)} → {formatDate(r.checkOut)} · {r.rooms} room{r.rooms === 1 ? "" : "s"} ·{" "}
              {r.budgetPerRoom}
            </p>
            {r.notes && <p className="mt-1 text-sm text-ink/50">{r.notes}</p>}

            {r.status === "pending" && (
              <button
                onClick={() => confirm(r._id)}
                className="mt-3 rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10"
              >
                Mark as confirmed
              </button>
            )}
          </div>
        ))}

        {!loading && reservations.length === 0 && <p className="text-sm text-ink/40">No reservations yet.</p>}
      </div>
    </div>
  );
}
