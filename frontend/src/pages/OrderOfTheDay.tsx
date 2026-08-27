import { useSettings } from "../lib/useSettings";
import { OrderOfDayPanel } from "../components/OrderOfDayPanel";

export function OrderOfTheDay() {
  const { settings, loading, error } = useSettings();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Order of the Day</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">One day, three moments.</p>

      {loading && <p className="mt-10 text-center text-sm text-ink/50">Loading…</p>}
      {error && <p className="mt-10 text-center text-sm text-red-600">{error}</p>}

      {settings && (
        <div className="mt-10">
          <OrderOfDayPanel events={settings.programOfEvents} />
        </div>
      )}
    </div>
  );
}
