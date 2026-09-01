import { useEffect, useState } from "react";
import { apiRequest } from "../api/client";
import { useSettings } from "../lib/useSettings";
import type { AsoEbiOrder, PaymentModeInfo } from "../types";

const COLOR_OPTIONS = ["Wine", "Burgundy", "Purple", "Gold"];
const FABRIC_OPTIONS = ["Aso-Oke", "Lace", "Ankara"];
const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL"];

export function AsoEbi() {
  const { settings } = useSettings();
  const [paymentInfo, setPaymentInfo] = useState<PaymentModeInfo | null>(null);

  const [guestName, setGuestName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("");
  const [fabric, setFabric] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AsoEbiOrder | null>(null);

  useEffect(() => {
    apiRequest<PaymentModeInfo>("/settings/payment-mode").then(setPaymentInfo);
  }, []);

  useEffect(() => {
    if (settings) {
      setColor((c) => c || COLOR_OPTIONS[0]);
      setFabric((f) => f || FABRIC_OPTIONS[0]);
      setSize((s) => s || SIZE_OPTIONS[0]);
    }
  }, [settings]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const response = await apiRequest<{ order: AsoEbiOrder; authorizationUrl?: string }>("/aso-ebi", {
        method: "POST",
        body: { guestName, contact, email: email || undefined, color, fabric, size, quantity, notes },
      });
      if (response.authorizationUrl) {
        window.location.href = response.authorizationUrl;
        return;
      }
      setResult(response.order);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl">Order received 🧵</h1>
        <p className="mt-3 text-sm text-ink/70">
          {result.paymentMethod === "manual"
            ? "We've noted your order. We'll be in touch to confirm payment. Thank you!"
            : "We're finalizing your order."}
        </p>
        <div className="mt-6 rounded-xl border border-sage/20 bg-white/70 p-4 text-left text-sm">
          <p><span className="text-sage">Color:</span> {result.color}</p>
          <p><span className="text-sage">Fabric:</span> {result.fabric}</p>
          <p><span className="text-sage">Size:</span> {result.size}</p>
          <p><span className="text-sage">Quantity:</span> {result.quantity}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-center text-3xl sm:text-4xl">Order Aso-Ebi</h1>
      <p className="mx-auto mt-2 max-w-md text-center text-sm text-ink/60">
        Pick your color, fabric, and size. We'll take it from there.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-5">
        <div>
          <label className="block font-mono text-xs text-sage">Your name</label>
          <input
            required
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-sage">Phone or WhatsApp</label>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
        </div>

        {paymentInfo?.mode === "paystack" && (
          <div>
            <label className="block font-mono text-xs text-sage">Email (for payment receipt)</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block font-mono text-xs text-sage">Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-2 py-3 text-sm"
            >
              {COLOR_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs text-sage">Fabric</label>
            <select
              value={fabric}
              onChange={(e) => setFabric(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-2 py-3 text-sm"
            >
              {FABRIC_OPTIONS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-mono text-xs text-sage">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-2 py-3 text-sm"
            >
              {SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block font-mono text-xs text-sage">Quantity</label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
        </div>

        <div>
          <label className="block font-mono text-xs text-sage">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 w-full rounded-lg border border-sage/25 bg-white px-4 py-3 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-full bg-terracotta py-3 font-mono text-sm text-ivory disabled:opacity-60"
        >
          {submitting ? "Submitting…" : paymentInfo?.mode === "paystack" ? "Continue to payment" : "Submit order"}
        </button>
      </form>
    </div>
  );
}
