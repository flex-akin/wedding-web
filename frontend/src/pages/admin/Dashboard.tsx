import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { Guest, HotelReservation, Photo, Wish } from "../../types";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-sage/15 bg-white/60 p-5">
      <p className="font-mono text-3xl text-sage">{value}</p>
      <p className="mt-1 text-sm text-ink/60">{label}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [guests, setGuests] = useState<Guest[] | null>(null);
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [wishes, setWishes] = useState<Wish[] | null>(null);
  const [reservations, setReservations] = useState<HotelReservation[] | null>(null);

  useEffect(() => {
    apiRequest<Guest[]>("/guests", { admin: true }).then(setGuests);
    apiRequest<Photo[]>("/photos/all", { admin: true }).then(setPhotos);
    apiRequest<Wish[]>("/wishes/all", { admin: true }).then(setWishes);
    apiRequest<HotelReservation[]>("/hotel-reservations", { admin: true }).then(setReservations);
  }, []);

  const attending = guests?.filter((g) => g.rsvpStatus === "attending").length ?? 0;
  const declined = guests?.filter((g) => g.rsvpStatus === "declined").length ?? 0;
  const pending = guests?.filter((g) => g.rsvpStatus === "pending").length ?? 0;
  const confirmedReservations = reservations?.filter((r) => r.status === "confirmed").length ?? 0;

  return (
    <div>
      <h1 className="text-2xl">Dashboard</h1>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <StatTile label="Guests invited" value={guests?.length ?? "…"} />
        <StatTile label="Attending" value={attending} />
        <StatTile label="Declined" value={declined} />
        <StatTile label="Awaiting response" value={pending} />
        <StatTile label="Photos on the wall" value={photos?.filter((p) => p.approved).length ?? "…"} />
        <StatTile label="Wishes left" value={wishes?.length ?? "…"} />
        <StatTile label="Hotel reservations" value={reservations?.length ?? "…"} />
        <StatTile label="Reservations confirmed" value={confirmedReservations} />
      </div>
    </div>
  );
}
