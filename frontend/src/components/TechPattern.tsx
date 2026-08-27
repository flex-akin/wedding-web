import type { SVGProps } from "react";

function BranchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
      <circle cx="4" cy="3" r="1.6" />
      <circle cx="4" cy="13" r="1.6" />
      <circle cx="12" cy="6" r="1.6" />
      <path d="M4 4.6V11.4" />
      <path d="M4 8.5C4 8.5 4 6.8 6.5 6.8H10.4" />
    </svg>
  );
}

function ForkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
      <circle cx="4" cy="3" r="1.6" />
      <circle cx="12" cy="3" r="1.6" />
      <circle cx="8" cy="13" r="1.6" />
      <path d="M4 4.6V6C4 7.4 5 7.9 6.5 7.9H9.5C11 7.9 12 7.4 12 6V4.6" />
      <path d="M8 7.9V11.4" />
    </svg>
  );
}

function StarIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" {...props}>
      <path d="M8 1.5l1.9 4.1 4.5.4-3.4 3 1 4.5L8 11.2l-4 2.3 1-4.5-3.4-3 4.5-.4L8 1.5z" />
    </svg>
  );
}

function PullRequestIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="4" cy="3" r="1.6" />
      <circle cx="4" cy="13" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M4 4.6V11.4" />
      <path d="M12 10.4V6.5C12 5 11 4.5 9.5 4.5H8.3" />
      <path d="M10 6.2L8.3 4.5L10 2.8" />
    </svg>
  );
}

function CommitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
      <path d="M1 8H5.3" />
      <path d="M10.7 8H15" />
      <circle cx="8" cy="8" r="2.7" />
    </svg>
  );
}

function TerminalIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="1" y="2" width="14" height="12" rx="1.5" />
      <path d="M4 6.2L6.5 8.2L4 10.2" />
      <path d="M8 10.2H11.5" />
    </svg>
  );
}

const ICONS = [BranchIcon, StarIcon, ForkIcon, PullRequestIcon, CommitIcon, TerminalIcon];

function IconRow() {
  const items = Array.from({ length: 42 }, (_, i) => ICONS[i % ICONS.length]);
  return (
    <div className="flex flex-wrap gap-x-10 gap-y-8">
      {items.map((Icon, i) => (
        <Icon key={i} className="h-7 w-7 shrink-0 text-ivory" />
      ))}
    </div>
  );
}

// Decorative tiled background of git/GitHub-style icon glyphs, drifting slowly upward.
// Pure inline SVG, no image asset or external icon font.
export function TechPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -inset-x-10 top-0 flex flex-col gap-8 rotate-[-6deg] opacity-[0.12] animate-tech-drift">
        <IconRow />
        <IconRow />
      </div>
    </div>
  );
}
