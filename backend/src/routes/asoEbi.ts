import { Router } from "express";
import crypto from "crypto";
import { AsoEbiOrderModel } from "../models/AsoEbiOrder";
import { requireAdmin } from "../middleware/requireAdmin";
import { env } from "../config/env";
import { initializeTransaction, verifyTransaction } from "../services/paystack";

export const asoEbiRouter = Router();

const PRICE_PER_UNIT_KOBO = 2_500_000; // ₦25,000 flat price, adjust in Settings later if needed

// Public: submit an order
asoEbiRouter.post("/", async (req, res) => {
  const { guestName, contact, color, fabric, size, quantity, notes, email } = req.body as {
    guestName?: string;
    contact?: string;
    color?: string;
    fabric?: string;
    size?: string;
    quantity?: number;
    notes?: string;
    email?: string;
  };

  if (!guestName?.trim() || !contact?.trim() || !color || !fabric || !size) {
    return res.status(400).json({ error: "guestName, contact, color, fabric, and size are required" });
  }

  const order = await AsoEbiOrderModel.create({
    guestName: guestName.trim(),
    contact: contact.trim(),
    color,
    fabric,
    size,
    quantity: quantity && quantity > 0 ? quantity : 1,
    notes,
    paymentMethod: env.paymentMode,
    status: "pending",
  });

  if (env.paymentMode === "paystack") {
    if (!email?.trim()) {
      return res.status(400).json({ error: "email is required to initialize Paystack payment" });
    }
    const reference = `asoebi-${order._id}-${crypto.randomBytes(4).toString("hex")}`;
    const amountKobo = PRICE_PER_UNIT_KOBO * order.quantity;
    const init = await initializeTransaction({ email, amountKobo, reference });
    order.paystackReference = reference;
    await order.save();
    return res.status(201).json({ order, authorizationUrl: init.authorizationUrl });
  }

  res.status(201).json({ order });
});

// Universal: check payment status regardless of mode
asoEbiRouter.get("/:id/payment-status", async (req, res) => {
  const order = await AsoEbiOrderModel.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json({ status: order.status, method: order.paymentMethod });
});

// Public: verify a Paystack payment after redirect back
asoEbiRouter.post("/:id/pay/verify", async (req, res) => {
  const order = await AsoEbiOrderModel.findById(req.params.id);
  if (!order) return res.status(404).json({ error: "Order not found" });
  if (order.paymentMethod !== "paystack" || !order.paystackReference) {
    return res.status(400).json({ error: "This order is not a Paystack order" });
  }
  const result = await verifyTransaction(order.paystackReference);
  if (result.paid) {
    order.status = "paid";
    await order.save();
  }
  res.json({ status: order.status });
});

// Paystack webhook (safety net for async confirmation). Signature-verified so
// only Paystack (holder of the secret key) can flip an order to paid this way.
asoEbiRouter.post("/webhook/paystack", async (req, res) => {
  const signature = req.headers["x-paystack-signature"];
  const rawBody = (req as unknown as { rawBody?: Buffer }).rawBody;
  if (!env.paystackSecretKey || !signature || !rawBody) {
    return res.sendStatus(401);
  }
  const expected = crypto.createHmac("sha512", env.paystackSecretKey).update(rawBody).digest("hex");
  if (expected !== signature) {
    return res.sendStatus(401);
  }

  const event = req.body as { event?: string; data?: { reference?: string } };
  if (event.event === "charge.success" && event.data?.reference) {
    await AsoEbiOrderModel.findOneAndUpdate(
      { paystackReference: event.data.reference },
      { status: "paid" }
    );
  }
  res.sendStatus(200);
});

// Admin: list all orders
asoEbiRouter.get("/", requireAdmin, async (_req, res) => {
  const orders = await AsoEbiOrderModel.find().sort({ createdAt: -1 });
  res.json(orders);
});

// Admin: update an order (e.g. mark as paid manually)
asoEbiRouter.patch("/:id", requireAdmin, async (req, res) => {
  const order = await AsoEbiOrderModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!order) return res.status(404).json({ error: "Order not found" });
  res.json(order);
});
