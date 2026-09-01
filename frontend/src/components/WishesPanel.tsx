import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import type { Wish } from "../types";

export function WishesPanel() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<Wish[]>("/wishes")
      .then(setWishes)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const wish = await apiRequest<Wish>("/wishes", { method: "POST", body: { name, message } });
      setWishes((prev) => [wish, ...prev]);
      setMessage("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          className="rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Your wish for Felix and Flora"
          required
          rows={3}
          className="rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-terracotta px-6 py-3 font-mono text-sm text-ivory disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Leave a wish"}
        </button>
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
      </form>

      <div className="mx-auto mt-12 max-w-md space-y-4">
        {loading && <p className="text-center text-sm text-ink/50">Loading…</p>}
        {!loading && wishes.length === 0 && (
          <p className="text-center text-sm text-ink/40">No wishes yet. Be the first!</p>
        )}
        {wishes.map((wish) => (
          <div key={wish._id} className="rounded-2xl border border-sage/15 bg-white/60 p-5 text-left">
            <p className="text-sm leading-relaxed text-ink/80">{wish.message}</p>
            <p className="mt-3 font-mono text-xs text-terracotta">by {wish.name}</p>
          </div>
        ))}
      </div>
    </>
  );
}
