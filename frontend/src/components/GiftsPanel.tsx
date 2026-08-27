import { CopyButton } from "./CopyButton";
import type { GiftAccount } from "../types";

interface GiftsPanelProps {
  giftNote: string;
  giftAccounts: GiftAccount[];
  cardClassName?: string;
}

export function GiftsPanel({ giftNote, giftAccounts, cardClassName = "bg-white/60" }: GiftsPanelProps) {
  return (
    <>
      <p className="mx-auto max-w-md text-balance text-center text-sm text-ink/70">{giftNote}</p>

      {giftAccounts.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink/40">Gift details coming soon.</p>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {giftAccounts.map((account, i) => (
            <div key={i} className={`rounded-2xl border border-sage/15 p-6 text-center ${cardClassName}`}>
              {account.label && <p className="font-mono text-xs text-terracotta">{account.label}</p>}
              <p className="mt-2 font-medium">{account.accountName}</p>
              <p className="mt-1 text-sm text-ink/70">{account.bankName}</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="font-mono text-lg text-sage">{account.accountNumber}</span>
                <CopyButton value={account.accountNumber} label="Copy account number" iconOnly />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
