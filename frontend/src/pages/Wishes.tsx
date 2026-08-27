import { WishesPanel } from "../components/WishesPanel";

export function Wishes() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Wishes</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
        Leave the couple a note for the journey ahead.
      </p>
      <div className="mt-8">
        <WishesPanel />
      </div>
    </div>
  );
}
