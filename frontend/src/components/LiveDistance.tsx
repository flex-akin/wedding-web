import { useState } from "react";
import { haversineDistanceKm } from "../lib/geo";

type Status = "idle" | "locating" | "done" | "error";

export function LiveDistance({ lat, lng }: { lat: number; lng: number }) {
  const [status, setStatus] = useState<Status>("idle");
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  function locate() {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMsg("Geolocation isn't supported on this device.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDistanceKm(haversineDistanceKm(pos.coords.latitude, pos.coords.longitude, lat, lng));
        setStatus("done");
      },
      () => {
        setStatus("error");
        setErrorMsg("Couldn't get your location — check permissions and try again.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={locate}
        className="font-mono text-xs text-terracotta underline underline-offset-2"
      >
        📍 How far am I from here?
      </button>
    );
  }

  if (status === "locating") {
    return <p className="font-mono text-xs text-ink/50">Locating…</p>;
  }

  if (status === "error") {
    return <p className="font-mono text-xs text-red-600">{errorMsg}</p>;
  }

  return (
    <p className="font-mono text-xs text-sage">You're about {distanceKm!.toFixed(1)} km away 🚗</p>
  );
}
