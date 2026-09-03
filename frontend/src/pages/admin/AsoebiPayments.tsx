import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { AsoebiContributionWithPayment, AsoebiPaymentWithTotals } from "../../types";

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export function AdminAsoebiPayments() {
  const [payments, setPayments] = useState<AsoebiPaymentWithTotals[]>([]);
  const [pending, setPending] = useState<AsoebiContributionWithPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

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

  async function decide(id: string, decision: "approve" | "reject") {
    await apiRequest(`/asoebi-payments/contributions/${id}/${decision}`, { method: "PATCH", admin: true });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this contributor and their submissions?")) return;
    await apiRequest(`/asoebi-payments/${id}`, { method: "DELETE", admin: true });
    load();
  }

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
        <h2 className="font-mono text-sm text-terracotta">Contributors ({payments.length})</h2>
        <div className="mt-3 space-y-3">
          {payments.map((p) => (
            <div key={p._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="font-mono text-xs text-ink/50">{p.phone}</p>
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
              <p className="mt-2 font-mono text-xs text-ink/60">
                {p.targetAmount > 0
                  ? `${formatNaira(p.confirmedTotal)} of ${formatNaira(p.targetAmount)} confirmed`
                  : "Gender not set — no target yet"}
                {p.pendingCount > 0 && ` · ${p.pendingCount} pending`}
              </p>
              <button
                onClick={() => handleDelete(p._id)}
                className="mt-2 rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
              >
                Remove
              </button>
            </div>
          ))}
          {!loading && payments.length === 0 && <p className="text-sm text-ink/40">No contributors yet.</p>}
        </div>
      </section>
    </div>
  );
}
