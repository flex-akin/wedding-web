interface SiteTagProps {
  size?: "sm" | "lg";
  className?: string;
}

export function SiteTag({ size = "sm", className = "" }: SiteTagProps) {
  const textSize = size === "lg" ? "text-3xl sm:text-5xl" : "text-base sm:text-lg";
  return (
    <span
      className={`font-mono font-medium tracking-tight whitespace-nowrap ${textSize} ${className}`}
      aria-label="Felix and Flora"
    >
      <span className="text-terracotta">{"<"}</span>
      <span className="text-sage">Felix &amp; Flora</span>
      <span className="text-terracotta"> {"/>"}</span>
    </span>
  );
}
