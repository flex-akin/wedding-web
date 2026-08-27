import { useState } from "react";

interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
  iconOnly?: boolean;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 12.5h-1a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CopyButton({ value, label = "Copy", className = "", iconOnly = false }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied" : label}
        title={copied ? "Copied" : label}
        className={`flex h-8 w-8 items-center justify-center rounded-md border border-sage/30 text-sage transition-colors hover:bg-sage/10 ${className}`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`rounded-md border border-sage/30 px-3 py-1.5 font-mono text-xs text-sage transition-colors hover:bg-sage/10 ${className}`}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
