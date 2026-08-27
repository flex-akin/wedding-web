import type { ProgramEvent } from "../types";

interface OrderOfDayPanelProps {
  events: ProgramEvent[];
}

export function OrderOfDayPanel({ events }: OrderOfDayPanelProps) {
  return (
    <div className="space-y-4">
      {events.map((event, i) => (
        <div key={i} className="rounded-2xl border border-sage/15 bg-white/60 p-6">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-xl">{event.name}</h3>
            <span className="font-mono text-sm text-terracotta">{event.time}</span>
          </div>
          {event.note && <p className="mt-1 font-mono text-xs text-ink/50">{event.note}</p>}

          {event.colors.length > 0 && (
            <div className="mt-4 border-t border-sage/10 pt-4">
              <p className="font-mono text-[10px] tracking-wide text-terracotta">COLOUR OF THE DAY</p>
              <div className="mt-3 flex flex-wrap gap-4">
                {event.colors.map((color) => (
                  <div key={color.label} className="flex flex-col items-center gap-1.5">
                    <span
                      className="h-8 w-8 rounded-full border border-ink/10 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-[10px] text-ink/60">{color.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
