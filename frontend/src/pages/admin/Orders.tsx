import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { AsoEbiOrder } from "../../types";

type Filter = "all" | "pending" | "paid";

export function AdminOrders() {
  const [orders, setOrders] = useState<AsoEbiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");

  function load() {
    setLoading(true);
    apiRequest<AsoEbiOrder[]>("/aso-ebi", { admin: true })
      .then(setOrders)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function markPaid(id: string) {
    await apiRequest(`/aso-ebi/${id}`, { method: "PATCH", admin: true, body: { status: "paid" } });
    load();
  }

  const visible = orders.filter((o) => filter === "all" || o.status === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl">Aso-Ebi Orders</h1>
        <div className="flex gap-1 rounded-full border border-sage/25 p-1">
          {(["all", "pending", "paid"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3 py-1 font-mono text-xs capitalize ${
                filter === f ? "bg-sage text-ivory" : "text-sage"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="mt-6 text-sm text-ink/50">Loading…</p>}

      <div className="mt-6 space-y-3">
        {visible.map((order) => (
          <div key={order._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{order.guestName}</p>
                <p className="font-mono text-xs text-ink/50">{order.contact}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 font-mono text-xs ${
                  order.status === "paid"
                    ? "bg-sage/15 text-sage"
                    : "bg-gold/15 text-gold"
                }`}
              >
                {order.status} · {order.paymentMethod}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/70">
              {order.color} · {order.fabric} · size {order.size} · qty {order.quantity}
            </p>
            {order.notes && <p className="mt-1 text-sm text-ink/50">{order.notes}</p>}

            {order.status === "pending" && order.paymentMethod === "manual" && (
              <button
                onClick={() => markPaid(order._id)}
                className="mt-3 rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10"
              >
                Mark as paid
              </button>
            )}
          </div>
        ))}

        {!loading && visible.length === 0 && (
          <p className="text-sm text-ink/40">No orders here yet.</p>
        )}
      </div>
    </div>
  );
}
