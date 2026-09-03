import { useRef, useState } from "react";
import { apiRequest } from "../api/client";
import type { AsoebiLookupResponse } from "../types";

const statusStyles: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-sage/15 text-sage",
  rejected: "bg-terracotta/15 text-terracotta",
};

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function AsoebiPayment() {
  const [phone, setPhone] = useState("");
  const [data, setData] = useState<AsoebiLookupResponse | null>(null);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [amount, setAmount] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setSearching(true);
    setError(null);
    setSubmitted(false);
    try {
      const response = await apiRequest<AsoebiLookupResponse>(
        `/asoebi-payments/lookup?phone=${encodeURIComponent(phone.trim())}`
      );
      setData(response);
    } catch (e) {
      setData(null);
      setError((e as Error).message);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  async function handleSubmitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file || !amount) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append("amount", amount);
      form.append("receipt", file);
      await apiRequest(`/asoebi-payments/${data.payment._id}/contributions`, {
        method: "POST",
        body: form,
        isFormData: true,
      });
      setSubmitted(true);
      setAmount("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      const refreshed = await apiRequest<AsoebiLookupResponse>(
        `/asoebi-payments/lookup?phone=${encodeURIComponent(phone.trim())}`
      );
      setData(refreshed);
    } catch (e) {
      setSubmitError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  const targetAmount = data?.payment.targetAmount ?? 0;
  const confirmed = data?.confirmedTotal ?? 0;
  const progressPct = targetAmount > 0 ? Math.min(100, Math.round((confirmed / targetAmount) * 100)) : 0;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Aso-Ebi Contribution</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
        Enter your phone number to see your contribution and add to it.
      </p>

      <form onSubmit={handleSearch} className="mx-auto mt-8 flex max-w-md gap-3">
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your phone number"
          className="flex-1 rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={searching || !phone.trim()}
          className="rounded-full bg-sage px-6 py-3 font-mono text-sm text-ivory disabled:opacity-60"
        >
          {searching ? "Searching…" : "Find me"}
        </button>
      </form>

      {searched && !data && (
        <div className="mt-8 rounded-2xl border border-terracotta/20 bg-white/70 p-6 text-center">
          <p className="text-sm text-ink/80">
            {error === "Not found"
              ? "This number isn't on the aso-ebi contribution list."
              : error ?? "Something went wrong."}
          </p>
          <p className="mt-1 text-xs text-ink/50">If you believe this is a mistake, reach out to the couple.</p>
        </div>
      )}

      {data && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-sage/15 bg-white/60 p-6">
            <p className="font-medium">{data.payment.name}</p>
            {targetAmount > 0 ? (
              <>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sage/10">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mt-2 font-mono text-xs text-ink/60">
                  {formatNaira(confirmed)} of {formatNaira(targetAmount)} confirmed ({progressPct}%)
                </p>
              </>
            ) : (
              <p className="mt-2 font-mono text-xs text-ink/50">
                Your goal hasn't been set yet — you can still submit a contribution.
              </p>
            )}
          </div>

          {data.contributions.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-xs text-sage">YOUR SUBMISSIONS</p>
              {data.contributions.map((c) => (
                <div
                  key={c._id}
                  className="flex items-center justify-between rounded-xl border border-sage/15 bg-white/60 p-3"
                >
                  <span className="text-sm">{formatNaira(c.amount)}</span>
                  <span className={`rounded-full px-3 py-1 font-mono text-xs ${statusStyles[c.status]}`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}

          {submitted ? (
            <div className="rounded-2xl border border-sage/20 bg-white/70 p-6 text-center">
              <p className="text-sm text-ink/80">
                Submitted — it'll show as pending until confirmed.
              </p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-3 font-mono text-xs text-terracotta underline"
              >
                Add another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitProof} className="rounded-2xl border border-sage/15 bg-white/60 p-5">
              <p className="font-mono text-xs text-terracotta">ADD A PAYMENT</p>
              <div className="mt-3">
                <label className="block font-mono text-xs text-sage">Amount paid</label>
                <input
                  required
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 20000"
                  className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
                />
              </div>
              <div className="mt-3">
                <label className="block font-mono text-xs text-sage">Payment receipt</label>
                <input
                  required
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-3 py-2.5 text-sm file:mr-2 file:rounded-md file:border-0 file:bg-sage file:px-3 file:py-1.5 file:text-ivory"
                />
              </div>
              {submitError && <p className="mt-2 text-xs text-red-600">{submitError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="mt-4 w-full rounded-full bg-terracotta py-3 font-mono text-sm text-ivory disabled:opacity-60"
              >
                {submitting ? "Submitting…" : "Submit for confirmation"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
