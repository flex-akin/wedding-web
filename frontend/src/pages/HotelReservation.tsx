import { useState } from "react";
import { apiRequest } from "../api/client";

const BUDGET_OPTIONS = [
  "Under ₦30,000",
  "₦30,000 – ₦50,000",
  "₦50,000 – ₦100,000",
  "₦100,000 – ₦200,000",
  "₦200,000+",
];

export function HotelReservation() {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [budgetPerRoom, setBudgetPerRoom] = useState(BUDGET_OPTIONS[0]);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/hotel-reservations", {
        method: "POST",
        body: { name, contact, checkIn, checkOut, rooms, budgetPerRoom, notes: notes || undefined },
      });
      setSubmitted(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Hotel Reservation</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
        Traveling in for the day? Let us help sort your stay.
      </p>

      {submitted ? (
        <div className="mt-10 rounded-2xl border border-sage/20 bg-white/70 p-8 text-center">
          <p className="text-xl">Got it, thank you! 🏨</p>
          <p className="mt-2 text-sm text-ink/60">We'll follow up with you to confirm the details.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-10 space-y-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
            className="w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Phone or email"
            required
            className="w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs text-sage">Check-in</label>
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-sage">Check-out</label>
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block font-mono text-xs text-sage">Number of rooms</label>
              <input
                type="number"
                min={1}
                value={rooms}
                onChange={(e) => setRooms(parseInt(e.target.value, 10) || 1)}
                className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-sage">Budget per room</label>
              <select
                value={budgetPerRoom}
                onChange={(e) => setBudgetPerRoom(e.target.value)}
                className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
              >
                {BUDGET_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            {submitting ? "Sending…" : "Request reservation"}
          </button>
        </form>
      )}
    </div>
  );
}
