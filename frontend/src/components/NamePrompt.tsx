import { useState } from "react";

interface NamePromptProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NamePrompt({ onSubmit, onCancel }: NamePromptProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 px-4"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
    >
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xs rounded-2xl bg-ivory p-6 shadow-xl"
      >
        <p className="font-display text-xl">What's your name?</p>
        <p className="mt-1 text-sm text-ink/60">So we know who to thank for the love.</p>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="mt-4 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
        />
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-full border border-sage/30 py-2.5 font-mono text-xs text-sage"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-full bg-terracotta py-2.5 font-mono text-xs text-ivory"
          >
            Like it ♥
          </button>
        </div>
      </form>
    </div>
  );
}
