import { QRCodeSVG } from "qrcode.react";
import type { Guest } from "../types";

interface AccessCardProps {
  guest: Guest;
  partnerOneName: string;
  partnerTwoName: string;
}

export function AccessCard({ guest, partnerOneName, partnerTwoName }: AccessCardProps) {
  const partyNames = [guest.name, ...guest.plusOnes.map((p) => p.name)].filter(Boolean);
  const verifyValue = `${window.location.origin}/rsvp/${guest.slug}`;

  return (
    <div className="mx-auto mt-8 max-w-sm overflow-hidden rounded-3xl border-4 border-ivory bg-white shadow-xl">
      <div className="bg-sage px-6 py-5 text-center">
        <p className="font-mono text-xs tracking-wide text-ivory/70">ACCESS CARD</p>
        <p className="mt-1 font-display text-2xl text-ivory">
          {partnerOneName} &amp; {partnerTwoName}
        </p>
      </div>
      <div className="p-6 text-center">
        <p className="font-mono text-xs text-terracotta">CONFIRMED</p>
        <p className="mt-2 text-xl font-medium">{guest.name}</p>
        {partyNames.length > 1 && (
          <p className="mt-1 text-sm text-ink/60">
            Party of {partyNames.length}: {partyNames.join(", ")}
          </p>
        )}
        <div className="mx-auto mt-5 w-fit rounded-xl border border-sage/15 p-3">
          <QRCodeSVG value={verifyValue} size={140} />
        </div>
        <p className="mt-4 text-xs text-ink/50">Present this at entry.</p>
      </div>
    </div>
  );
}
