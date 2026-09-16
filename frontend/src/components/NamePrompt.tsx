import { useState } from "react";
import { NameFields, joinName } from "./NameFields";

interface NamePromptProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export function NamePrompt({ onSubmit, onCancel }: NamePromptProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const name = joinName(firstName, lastName);
    if (!name) return;
    onSubmit(name);
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
        <div className="mt-4">
          <NameFields
            firstName={firstName}
            lastName={lastName}
            onFirstNameChange={setFirstName}
            onLastNameChange={setLastName}
            stack
            autoFocus
          />
        </div>
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
