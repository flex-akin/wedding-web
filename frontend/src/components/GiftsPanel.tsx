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
              {account.currency === "USD" && (
                <div className="mt-4 space-y-1.5 border-t border-sage/10 pt-4 text-left">
                  {account.accountType && (
                    <p className="text-xs text-ink/60">
                      <span className="text-sage">Account type:</span> {account.accountType}
                    </p>
                  )}
                  {account.wireRouting && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-ink/60">
                        <span className="text-sage">Wire routing:</span>{" "}
                        <span className="font-mono">{account.wireRouting}</span>
                      </span>
                      <CopyButton value={account.wireRouting} label="Copy wire routing number" iconOnly />
                    </div>
                  )}
                  {account.achRouting && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs text-ink/60">
                        <span className="text-sage">ACH routing:</span>{" "}
                        <span className="font-mono">{account.achRouting}</span>
                      </span>
                      <CopyButton value={account.achRouting} label="Copy ACH routing number" iconOnly />
                    </div>
                  )}
                  {account.bankAddress && (
                    <p className="text-xs text-ink/60">
                      <span className="text-sage">Bank address:</span> {account.bankAddress}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
