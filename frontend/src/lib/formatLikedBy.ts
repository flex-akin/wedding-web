export function formatLikedBy(names: string[]): string {
  if (names.length === 0) return "No likes yet. Be the first!";
  if (names.length <= 3) return `Liked by ${names.join(", ")}`;
  const shown = names.slice(0, 2);
  const rest = names.length - shown.length;
  return `Liked by ${shown.join(", ")} and ${rest} other${rest === 1 ? "" : "s"}`;
}
