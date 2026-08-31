function Sprig(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 160 220" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" {...props}>
      <path d="M20 210C10 160 30 120 22 80C16 50 34 25 46 8" />
      <path d="M22 80C40 72 54 56 58 38" />
      <path d="M22 80C6 74 -8 60 -14 44" />
      <path d="M28 130C48 122 62 104 66 84" />
      <path d="M28 130C10 124 -6 110 -14 92" />
      <ellipse cx="66" cy="80" rx="13" ry="6.5" transform="rotate(-28 66 80)" />
      <ellipse cx="-16" cy="88" rx="13" ry="6.5" transform="rotate(28 -16 88)" />
      <ellipse cx="60" cy="34" rx="11" ry="5.5" transform="rotate(-32 60 34)" />
      <ellipse cx="-16" cy="40" rx="11" ry="5.5" transform="rotate(32 -16 40)" />
    </svg>
  );
}

// Soft, elegant hero backdrop: a warm radial glow plus a pair of mirrored botanical
// line-art sprigs in opposite corners — restrained, not a tiled wallpaper.
export function FloralPattern() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% 8%, #C9A24B66 0%, #C9A24B26 42%, transparent 75%)",
        }}
      />
      <Sprig className="absolute -top-6 -left-10 h-56 w-40 text-sage/30 sm:h-72 sm:w-52" />
      <Sprig className="absolute -bottom-10 -right-10 h-56 w-40 rotate-180 text-terracotta/30 sm:h-72 sm:w-52" />
    </div>
  );
}
