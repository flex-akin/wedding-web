import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../../api/client";
import type { AsoebiContributionWithPayment, AsoebiPackage, AsoebiPaymentWithTotals } from "../../types";

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isPaid(p: AsoebiPaymentWithTotals) {
  return p.targetAmount > 0 && p.confirmedTotal >= p.targetAmount;
}

const TABS = [
  { id: "all", label: "All" },
  { id: "paid", label: "Paid" },
  { id: "unpaid", label: "Not Paid" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PACKAGE_LABELS: Record<AsoebiPackage, string> = {
  part: "Part Package",
  full: "Full Package",
  couple: "Couples Package",
};

export function AdminAsoebiPayments() {
  const [payments, setPayments] = useState<AsoebiPaymentWithTotals[]>([]);
  const [pending, setPending] = useState<AsoebiContributionWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabId>("all");
  const [couplePickerId, setCouplePickerId] = useState<string | null>(null);
  const [couplePartnerChoice, setCouplePartnerChoice] = useState("");

  function load() {
    setLoading(true);
    Promise.all([
      apiRequest<AsoebiPaymentWithTotals[]>("/asoebi-payments", { admin: true }),
      apiRequest<AsoebiContributionWithPayment[]>("/asoebi-payments/contributions/pending", { admin: true }),
    ])
      .then(([p, c]) => {
        setPayments(p);
        setPending(c);
      })
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await apiRequest("/asoebi-payments", { method: "POST", admin: true, body: { name, phone } });
      setName("");
      setPhone("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function setGender(id: string, gender: "M" | "F") {
    await apiRequest(`/asoebi-payments/${id}`, { method: "PATCH", admin: true, body: { gender } });
    load();
  }

  async function setPackage(id: string, pkg: AsoebiPackage | null) {
    setError(null);
    try {
      await apiRequest(`/asoebi-payments/${id}`, { method: "PATCH", admin: true, body: { package: pkg } });
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function confirmCouple(id: string) {
    if (!couplePartnerChoice) return;
    setError(null);
    try {
      await apiRequest(`/asoebi-payments/${id}`, {
        method: "PATCH",
        admin: true,
        body: { package: "couple", partnerId: couplePartnerChoice },
      });
      setCouplePickerId(null);
      setCouplePartnerChoice("");
      load();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function decide(id: string, decision: "approve" | "reject") {
    await apiRequest(`/asoebi-payments/contributions/${id}/${decision}`, { method: "PATCH", admin: true });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this contributor and their submissions?")) return;
    await apiRequest(`/asoebi-payments/${id}`, { method: "DELETE", admin: true });
    load();
  }

  const paidCount = useMemo(() => payments.filter(isPaid).length, [payments]);
  const filteredPayments = useMemo(() => {
    if (tab === "paid") return payments.filter(isPaid);
    if (tab === "unpaid") return payments.filter((p) => !isPaid(p));
    return payments;
  }, [payments, tab]);

  return (
    <div>
      <h1 className="text-2xl">Aso-Ebi Payments</h1>

      <section className="mt-6">
        <h2 className="font-mono text-sm text-terracotta">Pending review ({pending.length})</h2>
        <div className="mt-3 space-y-3">
          {pending.map((c) => (
            <div key={c._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{c.payment?.name ?? "Unknown"}</p>
                  <p className="font-mono text-xs text-ink/50">{c.payment?.phone}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-sage">{formatNaira(c.amount)} reported</p>
                </div>
              </div>
              <a
                href={c.receiptUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-mono text-xs text-terracotta underline"
              >
                View receipt →
              </a>
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => decide(c._id, "approve")}
                  className="rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10"
                >
                  Approve
                </button>
                <button
                  onClick={() => decide(c._id, "reject")}
                  className="rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!loading && pending.length === 0 && <p className="text-sm text-ink/40">Nothing waiting on review.</p>}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-sm text-terracotta">Add a contributor</h2>
        <form onSubmit={handleAdd} className="mt-3 flex flex-wrap gap-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="flex-1 rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 rounded-lg border border-sage/25 bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-full bg-sage px-4 py-2 font-mono text-xs text-ivory">Add</button>
        </form>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </section>

      <section className="mt-8">
        <h2 className="font-mono text-sm text-terracotta">
          Contributors ({payments.length}) · {paidCount} paid
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 font-mono text-xs transition-colors ${
                tab === t.id ? "bg-sage text-ivory" : "border border-sage/30 text-sage hover:bg-sage/10"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-3 space-y-3">
          {filteredPayments.map((p) => {
            const paid = isPaid(p);
            return (
              <div key={p._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{p.name}</p>
                      {paid && (
                        <span className="rounded-full bg-sage/15 px-2 py-0.5 font-mono text-[10px] text-sage">
                          ✓ Paid
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-ink/50">{p.phone}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink/40">Added {formatDate(p.createdAt)}</p>
                    <p className="mt-0.5 font-mono text-xs text-sage">
                      {p.package ? PACKAGE_LABELS[p.package] : "No package chosen yet"}
                      {p.partnerName && ` — paired with ${p.partnerName}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setGender(p._id, "M")}
                      className={`rounded-full px-3 py-1 font-mono text-xs ${
                        p.gender === "M" ? "bg-sage text-ivory" : "border border-sage/30 text-sage"
                      }`}
                    >
                      M
                    </button>
                    <button
                      onClick={() => setGender(p._id, "F")}
                      className={`rounded-full px-3 py-1 font-mono text-xs ${
                        p.gender === "F" ? "bg-terracotta text-ivory" : "border border-terracotta/30 text-terracotta"
                      }`}
                    >
                      F
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setPackage(p._id, "part")}
                    className={`rounded-full px-3 py-1 font-mono text-xs ${
                      p.package === "part" ? "bg-sage text-ivory" : "border border-sage/30 text-sage"
                    }`}
                  >
                    Part
                  </button>
                  <button
                    onClick={() => setPackage(p._id, "full")}
                    className={`rounded-full px-3 py-1 font-mono text-xs ${
                      p.package === "full" ? "bg-sage text-ivory" : "border border-sage/30 text-sage"
                    }`}
                  >
                    Full
                  </button>
                  <button
                    onClick={() => {
                      setCouplePickerId(couplePickerId === p._id ? null : p._id);
                      setCouplePartnerChoice("");
                    }}
                    className={`rounded-full px-3 py-1 font-mono text-xs ${
                      p.package === "couple" ? "bg-sage text-ivory" : "border border-sage/30 text-sage"
                    }`}
                  >
                    Couple
                  </button>
                  {p.package && (
                    <button
                      onClick={() => setPackage(p._id, null)}
                      className="font-mono text-[10px] text-ink/40 underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {couplePickerId === p._id && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <select
                      value={couplePartnerChoice}
                      onChange={(e) => setCouplePartnerChoice(e.target.value)}
                      className="rounded-lg border border-sage/25 bg-white px-3 py-1.5 text-sm"
                    >
                      <option value="">Pair with…</option>
                      {payments
                        .filter((other) => other._id !== p._id)
                        .map((other) => (
                          <option key={other._id} value={other._id}>
                            {other.name}
                          </option>
                        ))}
                    </select>
                    <button
                      onClick={() => confirmCouple(p._id)}
                      disabled={!couplePartnerChoice}
                      className="rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10 disabled:opacity-50"
                    >
                      Link
                    </button>
                  </div>
                )}

                <p className="mt-2 font-mono text-xs text-ink/60">
                  {p.targetAmount > 0
                    ? `${formatNaira(p.confirmedTotal)} of ${formatNaira(p.targetAmount)} confirmed`
                    : "No target yet"}
                  {p.pendingCount > 0 && ` · ${p.pendingCount} pending`}
                </p>
                <button
                  onClick={() => handleDelete(p._id)}
                  className="mt-2 rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              </div>
            );
          })}
          {!loading && filteredPayments.length === 0 && (
            <p className="text-sm text-ink/40">
              {payments.length === 0 ? "No contributors yet." : "Nobody in this tab yet."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
