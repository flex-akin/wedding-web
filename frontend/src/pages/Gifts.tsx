import { useSettings } from "../lib/useSettings";
import { GiftsPanel } from "../components/GiftsPanel";

export function Gifts() {
  const { settings, loading, error } = useSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Gifts</h1>

      {loading && <p className="mt-10 text-center text-sm text-ink/50">Loading…</p>}
      {error && <p className="mt-10 text-center text-sm text-red-600">{error}</p>}

      {settings && (
        <div className="mt-3">
          <GiftsPanel giftNote={settings.giftNote} giftAccounts={settings.giftAccounts} />
        </div>
      )}
    </div>
  );
}
