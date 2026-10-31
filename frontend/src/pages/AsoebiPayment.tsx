import { useRef, useState } from "react";
import { apiRequest } from "../api/client";
import type { AsoebiLookupResponse, AsoebiPackage, AsoebiPartnerOption } from "../types";

const statusStyles: Record<string, string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-sage/15 text-sage",
  rejected: "bg-terracotta/15 text-terracotta",
};

const PACKAGE_OPTIONS: { id: AsoebiPackage; label: string; description: string }[] = [
  { id: "part", label: "Part Package", description: "₦30,000" },
  { id: "full", label: "Full Package", description: "₦45,000 men / ₦40,000 women" },
  { id: "couple", label: "Couples Package", description: "₦70,000 for two" },
];

const PACKAGE_LABELS: Record<AsoebiPackage, string> = {
  part: "Part Package",
  full: "Full Package",
  couple: "Couples Package",
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

  const [chosenPackage, setChosenPackage] = useState<AsoebiPackage | "">("");
  const [partnerOptions, setPartnerOptions] = useState<AsoebiPartnerOption[]>([]);
  const [loadingPartners, setLoadingPartners] = useState(false);
  const [partnerId, setPartnerId] = useState("");

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
      setChosenPackage("");
      setPartnerId("");
    } catch (e) {
      setData(null);
      setError((e as Error).message);
    } finally {
      setSearching(false);
      setSearched(true);
    }
  }

  async function handlePackageSelect(pkg: AsoebiPackage) {
    setChosenPackage(pkg);
    if (pkg === "couple" && partnerOptions.length === 0 && data) {
      setLoadingPartners(true);
      try {
        const names = await apiRequest<AsoebiPartnerOption[]>("/asoebi-payments/names");
        setPartnerOptions(names.filter((n) => n._id !== data.payment._id));
      } finally {
        setLoadingPartners(false);
      }
    }
  }

  async function handleSubmitProof(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    const file = fileInputRef.current?.files?.[0];
    if (!file || !amount) return;
    const needsPackage = !data.payment.package;
    if (needsPackage && !chosenPackage) return;
    if (needsPackage && chosenPackage === "couple" && !partnerId) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const form = new FormData();
      form.append("amount", amount);
      form.append("receipt", file);
      if (needsPackage) {
        form.append("package", chosenPackage);
        if (chosenPackage === "couple") form.append("partnerId", partnerId);
      }
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
  const remaining = Math.max(0, targetAmount - confirmed);
  const needsPackage = Boolean(data && !data.payment.package);

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
            {data.payment.package && (
              <p className="mt-1 font-mono text-xs text-sage">
                {PACKAGE_LABELS[data.payment.package]}
                {data.payment.partnerName && ` — paired with ${data.payment.partnerName}`}
              </p>
            )}
            {targetAmount > 0 ? (
              <>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-sage/10">
                  <div className="h-full rounded-full bg-sage" style={{ width: `${progressPct}%` }} />
                </div>
                <p className="mt-2 font-mono text-xs text-ink/60">
                  {formatNaira(confirmed)} of {formatNaira(targetAmount)} confirmed ({progressPct}%)
                </p>
                <p className="mt-1 font-mono text-sm text-terracotta">
                  {remaining > 0 ? `${formatNaira(remaining)} left to pay` : "Fully paid — thank you!"}
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

              {needsPackage && (
                <div className="mt-3 space-y-2">
                  <label className="block font-mono text-xs text-sage">Which package are you paying for?</label>
                  {PACKAGE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handlePackageSelect(opt.id)}
                      className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left font-mono text-sm ${
                        chosenPackage === opt.id ? "border-sage bg-sage text-ivory" : "border-sage/30 text-sage"
                      }`}
                    >
                      <span>{opt.label}</span>
                      <span className="text-xs opacity-80">{opt.description}</span>
                    </button>
                  ))}

                  {chosenPackage === "couple" && (
                    <div className="mt-2">
                      <label className="block font-mono text-xs text-sage">Who are you pairing with?</label>
                      <select
                        required
                        value={partnerId}
                        onChange={(e) => setPartnerId(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
                      >
                        <option value="">{loadingPartners ? "Loading…" : "Select a name"}</option>
                        {partnerOptions.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

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
                disabled={
                  submitting || (needsPackage && (!chosenPackage || (chosenPackage === "couple" && !partnerId)))
                }
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
