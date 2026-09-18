import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../api/client";
import { NameFields, joinName } from "./NameFields";
import type { Wish } from "../types";

const PAGE_SIZE = 9;

export function WishesPanel() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    apiRequest<Wish[]>("/wishes")
      .then(setWishes)
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.max(1, Math.ceil(wishes.length / PAGE_SIZE));
  const pageWishes = useMemo(
    () => wishes.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [wishes, page]
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = joinName(firstName, lastName);
    if (!name || !message.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const wish = await apiRequest<Wish>("/wishes", { method: "POST", body: { name, message } });
      setWishes((prev) => [wish, ...prev]);
      setMessage("");
      setPage(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-md flex-col gap-3">
        <NameFields
          firstName={firstName}
          lastName={lastName}
          onFirstNameChange={setFirstName}
          onLastNameChange={setLastName}
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

      <div className="mx-auto mt-12 max-w-5xl">
        {loading && <p className="text-center text-sm text-ink/50">Loading…</p>}
        {!loading && wishes.length === 0 && (
          <p className="text-center text-sm text-ink/40">No wishes yet. Be the first!</p>
        )}

        {!loading && wishes.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {pageWishes.map((wish) => (
                <div key={wish._id} className="rounded-2xl border border-sage/15 bg-white/60 p-5 text-left">
                  <p className="text-sm leading-relaxed text-ink/80">{wish.message}</p>
                  <p className="mt-3 font-mono text-xs text-terracotta">by {wish.name}</p>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="rounded-full border border-sage/30 px-4 py-1.5 font-mono text-xs text-sage disabled:opacity-30"
                >
                  ← Prev
                </button>
                <span className="font-mono text-xs text-ink/50">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-full border border-sage/30 px-4 py-1.5 font-mono text-xs text-sage disabled:opacity-30"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
