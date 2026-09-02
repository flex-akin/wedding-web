// One large git-branch mark spanning the splash screen — draws itself in on
// mount, then drifts in a slow continuous rotation for as long as it's visible.
export function GitMark() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <svg
        viewBox="0 0 100 140"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="h-[85vmin] w-[85vmin] text-ivory/10 animate-mark-spin"
      >
        <path className="animate-mark-draw" style={{ animationDelay: "0.5s" }} d="M25 23V117" />
        <path className="animate-mark-draw" style={{ animationDelay: "0.9s" }} d="M25 70C25 70 25 53 45 53H67" />
        <circle className="animate-mark-draw" style={{ animationDelay: "0s" }} cx="25" cy="15" r="8" />
        <circle className="animate-mark-draw" style={{ animationDelay: "1.3s" }} cx="25" cy="125" r="8" />
        <circle className="animate-mark-draw" style={{ animationDelay: "1.1s" }} cx="75" cy="45" r="8" />
      </svg>
    </div>
  );
}
