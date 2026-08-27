import { useEffect, useState } from "react";
import { apiRequest } from "../../api/client";
import type { Wish } from "../../types";

export function AdminWishes() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    apiRequest<Wish[]>("/wishes/all", { admin: true })
      .then(setWishes)
      .finally(() => setLoading(false));
  }

  useEffect(load, []);

  async function toggleApproved(wish: Wish) {
    await apiRequest(`/wishes/${wish._id}`, { method: "PATCH", admin: true, body: { approved: !wish.approved } });
    load();
  }

  async function remove(id: string) {
    await apiRequest(`/wishes/${id}`, { method: "DELETE", admin: true });
    load();
  }

  return (
    <div>
      <h1 className="text-2xl">Wishes</h1>
      <p className="mt-2 text-sm text-ink/60">Hidden wishes won't show on the public Wishes page.</p>

      {loading && <p className="mt-6 text-sm text-ink/50">Loading…</p>}

      <div className="mt-6 space-y-3">
        {wishes.map((wish) => (
          <div key={wish._id} className="rounded-xl border border-sage/15 bg-white/60 p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm text-ink/80">{wish.message}</p>
                <p className="mt-1 font-mono text-xs text-terracotta">— {wish.name}</p>
              </div>
              <span className={`font-mono text-xs ${wish.approved ? "text-sage" : "text-terracotta"}`}>
                {wish.approved ? "visible" : "hidden"}
              </span>
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => toggleApproved(wish)}
                className="rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage hover:bg-sage/10"
              >
                {wish.approved ? "Hide" : "Show"}
              </button>
              <button
                onClick={() => remove(wish._id)}
                className="rounded-md border border-red-300 px-3 py-1.5 font-mono text-xs text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {!loading && wishes.length === 0 && <p className="text-sm text-ink/40">No wishes yet.</p>}
      </div>
    </div>
  );
}
