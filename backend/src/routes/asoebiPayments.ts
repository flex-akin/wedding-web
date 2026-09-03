import { Router } from "express";
import { Types } from "mongoose";
import { AsoebiPaymentModel, GENDER_TARGETS } from "../models/AsoebiPayment";
import { AsoebiContributionModel } from "../models/AsoebiContribution";
import { requireAdmin } from "../middleware/requireAdmin";
import { uploadReceipt } from "../middleware/uploadReceipt";
import { toStoredPhone } from "../utils/phone";

export const asoebiPaymentsRouter = Router();

async function confirmedTotal(paymentId: string): Promise<number> {
  const result = await AsoebiContributionModel.aggregate([
    { $match: { paymentId: new Types.ObjectId(paymentId), status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
}

// Public: find a contributor's record by phone number
asoebiPaymentsRouter.get("/lookup", async (req, res) => {
  const phone = typeof req.query.phone === "string" ? req.query.phone.trim() : "";
  const stored = toStoredPhone(phone);
  if (!stored) return res.status(400).json({ error: "A valid phone number is required" });

  const payment = await AsoebiPaymentModel.findOne({ phone: stored });
  if (!payment) return res.status(404).json({ error: "Not found" });

  const contributions = await AsoebiContributionModel.find({ paymentId: payment._id }).sort({ createdAt: -1 });
  const confirmed = contributions
    .filter((c) => c.status === "approved")
    .reduce((sum, c) => sum + c.amount, 0);

  res.json({ payment, contributions, confirmedTotal: confirmed });
});

// Public: submit a contribution (amount + receipt) — starts as "pending"
asoebiPaymentsRouter.post(
  "/:id/contributions",
  uploadReceipt.single("receipt"),
  async (req, res) => {
    const payment = await AsoebiPaymentModel.findById(req.params.id);
    if (!payment) return res.status(404).json({ error: "Not found" });
    if (!req.file) return res.status(400).json({ error: "A receipt file is required" });

    const amount = Number((req.body as { amount?: string }).amount);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "A valid amount is required" });
    }

    const receiptUrl = `/uploads/${req.file.filename}`;

    const contribution = await AsoebiContributionModel.create({
      paymentId: payment._id,
      amount,
      receiptUrl,
      status: "pending",
    });
    res.status(201).json(contribution);
  }
);

// Admin: list all contributors with their confirmed totals
asoebiPaymentsRouter.get("/", requireAdmin, async (_req, res) => {
  const payments = await AsoebiPaymentModel.find().sort({ createdAt: -1 });
  const withTotals = await Promise.all(
    payments.map(async (p) => ({
      ...p.toObject(),
      confirmedTotal: await confirmedTotal(String(p._id)),
      pendingCount: await AsoebiContributionModel.countDocuments({ paymentId: p._id, status: "pending" }),
    }))
  );
  res.json(withTotals);
});

// Admin: add one contributor manually
asoebiPaymentsRouter.post("/", requireAdmin, async (req, res) => {
  const { name, phone, gender } = req.body as { name?: string; phone?: string; gender?: "M" | "F" };
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "name and phone are required" });
  }
  const stored = toStoredPhone(phone);
  const payment = await AsoebiPaymentModel.create({
    name: name.trim(),
    phone: stored,
    gender: gender ?? null,
    targetAmount: gender ? GENDER_TARGETS[gender] : 0,
  });
  res.status(201).json(payment);
});

// Admin: update a contributor (mainly to set gender, which sets the target)
asoebiPaymentsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const { gender, name } = req.body as { gender?: "M" | "F" | null; name?: string };
  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (gender !== undefined) {
    patch.gender = gender;
    patch.targetAmount = gender ? GENDER_TARGETS[gender] : 0;
  }
  const payment = await AsoebiPaymentModel.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!payment) return res.status(404).json({ error: "Not found" });
  res.json(payment);
});

// Admin: remove a contributor
asoebiPaymentsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const payment = await AsoebiPaymentModel.findByIdAndDelete(req.params.id);
  if (!payment) return res.status(404).json({ error: "Not found" });
  await AsoebiContributionModel.deleteMany({ paymentId: payment._id });
  res.status(204).send();
});

// Admin: list contributions awaiting review, across everyone
asoebiPaymentsRouter.get("/contributions/pending", requireAdmin, async (_req, res) => {
  const pending = await AsoebiContributionModel.find({ status: "pending" }).sort({ createdAt: 1 });
  const withNames = await Promise.all(
    pending.map(async (c) => {
      const payment = await AsoebiPaymentModel.findById(c.paymentId).select("name phone");
      return { ...c.toObject(), payment };
    })
  );
  res.json(withNames);
});

// Admin: approve or reject a contribution
asoebiPaymentsRouter.patch("/contributions/:id/:decision", requireAdmin, async (req, res) => {
  const { decision } = req.params;
  if (!["approve", "reject"].includes(decision)) {
    return res.status(400).json({ error: "decision must be 'approve' or 'reject'" });
  }
  const contribution = await AsoebiContributionModel.findByIdAndUpdate(
    req.params.id,
    { status: decision === "approve" ? "approved" : "rejected" },
    { new: true }
  );
  if (!contribution) return res.status(404).json({ error: "Not found" });
  res.json(contribution);
});
