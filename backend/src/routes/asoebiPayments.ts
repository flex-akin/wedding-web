import { Router } from "express";
import { Types } from "mongoose";
import { AsoebiPaymentModel, targetAmountFor, PackageType } from "../models/AsoebiPayment";
import { AsoebiContributionModel } from "../models/AsoebiContribution";
import { requireAdmin } from "../middleware/requireAdmin";
import { uploadReceipt } from "../middleware/uploadReceipt";
import { toStoredPhone } from "../utils/phone";

export const asoebiPaymentsRouter = Router();

const PACKAGE_TYPES: PackageType[] = ["part", "full", "couple"];

function withTarget<T extends { package?: PackageType | null; gender?: "M" | "F" | null; toObject?: () => object }>(
  payment: T
) {
  const plain = typeof payment.toObject === "function" ? payment.toObject() : payment;
  return { ...plain, targetAmount: targetAmountFor(payment) };
}

async function confirmedTotal(paymentId: Types.ObjectId | string): Promise<number> {
  const result = await AsoebiContributionModel.aggregate([
    { $match: { paymentId: new Types.ObjectId(paymentId), status: "approved" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return result[0]?.total ?? 0;
}

// For a couples-package contributor, the confirmed total is shared across
// both members — either of them may have submitted the proof of payment.
async function combinedConfirmedTotal(payment: {
  _id: Types.ObjectId;
  package?: PackageType | null;
  partnerId?: Types.ObjectId | null;
}): Promise<number> {
  if (payment.package !== "couple" || !payment.partnerId) {
    return confirmedTotal(payment._id);
  }
  const [own, partner] = await Promise.all([
    confirmedTotal(payment._id),
    confirmedTotal(payment.partnerId),
  ]);
  return own + partner;
}

// Links two contributors as a couple, mutually. Refuses to steal someone
// who is already paired with a different third person.
async function linkCouple(payment: InstanceType<typeof AsoebiPaymentModel>, partnerId: string) {
  if (partnerId === String(payment._id)) {
    throw new Error("You can't pair with yourself");
  }
  const partner = await AsoebiPaymentModel.findById(partnerId);
  if (!partner) throw new Error("Partner not found");
  if (partner.partnerId && String(partner.partnerId) !== String(payment._id)) {
    throw new Error(`${partner.name} is already paired with someone else`);
  }

  payment.package = "couple";
  payment.partnerId = partner._id;
  await payment.save();

  partner.package = "couple";
  partner.partnerId = payment._id;
  await partner.save();

  return partner;
}

// Unlinks a contributor from their couple partner, if any, so the partner
// falls back to having no package set rather than pointing at a ghost.
async function unlinkCouple(payment: { _id: Types.ObjectId; partnerId?: Types.ObjectId | null }) {
  if (!payment.partnerId) return;
  await AsoebiPaymentModel.findByIdAndUpdate(payment.partnerId, { package: null, partnerId: null });
}

async function partnerName(partnerId?: Types.ObjectId | null): Promise<string | null> {
  if (!partnerId) return null;
  const partner = await AsoebiPaymentModel.findById(partnerId).select("name");
  return partner?.name ?? null;
}

// Public: list contributor names for the couples-package partner picker
asoebiPaymentsRouter.get("/names", async (_req, res) => {
  const payments = await AsoebiPaymentModel.find().select("name").sort({ name: 1 });
  res.json(payments.map((p) => ({ _id: p._id, name: p.name })));
});

// Public: find a contributor's record by phone number
asoebiPaymentsRouter.get("/lookup", async (req, res) => {
  const phone = typeof req.query.phone === "string" ? req.query.phone.trim() : "";
  const stored = toStoredPhone(phone);
  if (!stored) return res.status(400).json({ error: "A valid phone number is required" });

  const payment = await AsoebiPaymentModel.findOne({ phone: stored });
  if (!payment) return res.status(404).json({ error: "Not found" });

  const contributions = await AsoebiContributionModel.find({ paymentId: payment._id }).sort({ createdAt: -1 });
  const confirmed = await combinedConfirmedTotal(payment);

  res.json({
    payment: { ...withTarget(payment), partnerName: await partnerName(payment.partnerId) },
    contributions,
    confirmedTotal: confirmed,
  });
});

// Public: submit a contribution (amount + receipt) — starts as "pending".
// On a contributor's first submission, a package (and a partner, for the
// couples package) must be chosen; later submissions just top it up.
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

    if (!payment.package) {
      const { package: pkg, partnerId } = req.body as { package?: string; partnerId?: string };
      if (!pkg || !PACKAGE_TYPES.includes(pkg as PackageType)) {
        return res.status(400).json({ error: "Choose a package: Part, Full, or Couples" });
      }
      if (pkg === "full" && !payment.gender) {
        return res.status(400).json({
          error: "Your gender hasn't been set yet, so the Full Package amount isn't known. Try Part or Couples Package, or reach out to the couple.",
        });
      }
      if (pkg === "couple") {
        if (!partnerId) return res.status(400).json({ error: "Pick who you're pairing with" });
        try {
          await linkCouple(payment, partnerId);
        } catch (e) {
          return res.status(409).json({ error: (e as Error).message });
        }
      } else {
        payment.package = pkg as PackageType;
        await payment.save();
      }
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
      ...withTarget(p),
      partnerName: await partnerName(p.partnerId),
      confirmedTotal: await combinedConfirmedTotal(p),
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
  if (!stored) return res.status(400).json({ error: "Enter a valid phone number" });
  if (await AsoebiPaymentModel.exists({ phone: stored })) {
    return res.status(409).json({ error: "A contributor with that phone number already exists" });
  }
  const payment = await AsoebiPaymentModel.create({
    name: name.trim(),
    phone: stored,
    gender: gender ?? null,
  });
  res.status(201).json(withTarget(payment));
});

// Admin: update a contributor (gender, name, or package/partner)
asoebiPaymentsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const { gender, name, package: pkg, partnerId, clothesReceived } = req.body as {
    gender?: "M" | "F" | null;
    name?: string;
    package?: PackageType | null;
    partnerId?: string | null;
    clothesReceived?: boolean;
  };

  const payment = await AsoebiPaymentModel.findById(req.params.id);
  if (!payment) return res.status(404).json({ error: "Not found" });

  if (name !== undefined) payment.name = name;
  if (gender !== undefined) payment.gender = gender;
  if (clothesReceived !== undefined) payment.clothesReceived = clothesReceived;

  if (pkg === "couple" && partnerId) {
    try {
      await linkCouple(payment, partnerId);
    } catch (e) {
      return res.status(409).json({ error: (e as Error).message });
    }
  } else if (pkg !== undefined) {
    await unlinkCouple(payment);
    payment.package = pkg;
    payment.partnerId = null;
  }

  await payment.save();
  res.json({ ...withTarget(payment), partnerName: await partnerName(payment.partnerId) });
});

// Admin: remove a contributor
asoebiPaymentsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const payment = await AsoebiPaymentModel.findByIdAndDelete(req.params.id);
  if (!payment) return res.status(404).json({ error: "Not found" });
  await unlinkCouple(payment);
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
