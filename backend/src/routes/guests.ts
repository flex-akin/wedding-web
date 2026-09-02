import { Router } from "express";
import { GuestModel } from "../models/Guest";
import { GuestRequestModel } from "../models/GuestRequest";
import { requireAdmin } from "../middleware/requireAdmin";
import { toStoredPhone } from "../utils/phone";
import { slugify, uniqueGuestSlug as uniqueSlug } from "../utils/guestSlug";

export const guestsRouter = Router();

// Public: fetch guest by slug for the personalized RSVP page
guestsRouter.get("/slug/:slug", async (req, res) => {
  const guest = await GuestModel.findOne({ slug: req.params.slug.toLowerCase() });
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  res.json(guest);
});

// Public: look up a guest's personalized RSVP link by name or phone number
// (accepts +234..., 234..., or a local 0... number — all normalize the same way)
guestsRouter.get("/lookup", async (req, res) => {
  const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
  if (q.length < 2) return res.json({ matches: [], rejected: false });

  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const phoneCandidate = toStoredPhone(q);

  const matches = await GuestModel.find({
    $or: [{ name: new RegExp(escaped, "i") }, ...(phoneCandidate ? [{ phone: phoneCandidate }] : [])],
  })
    .select("name slug")
    .limit(10);

  let rejected = false;
  if (matches.length === 0 && phoneCandidate) {
    rejected = Boolean(await GuestRequestModel.exists({ phone: phoneCandidate, status: "rejected" }));
  }

  res.json({ matches, rejected });
});

// Public: submit RSVP — guests confirm per-event (Garden Wedding / Engagement)
guestsRouter.post("/slug/:slug/rsvp", async (req, res) => {
  const guest = await GuestModel.findOne({ slug: req.params.slug.toLowerCase() });
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const { attendingCeremony, attendingReception, plusOnes, notes } = req.body as {
    attendingCeremony?: boolean;
    attendingReception?: boolean;
    plusOnes?: { name: string }[];
    notes?: string;
  };

  guest.attendingCeremony = Boolean(attendingCeremony);
  guest.attendingReception = Boolean(attendingReception);
  guest.rsvpStatus = guest.attendingCeremony || guest.attendingReception ? "attending" : "declined";

  if (Array.isArray(plusOnes)) {
    const cleaned = plusOnes
      .filter((p) => p?.name?.trim())
      .slice(0, Math.max(0, guest.partySize - 1))
      .map((p) => ({ name: p.name.trim() }));
    guest.set("plusOnes", cleaned);
  }
  if (notes !== undefined) guest.notes = notes;
  guest.respondedAt = new Date();
  await guest.save();
  res.json(guest);
});

// Admin: list all guests
guestsRouter.get("/", requireAdmin, async (_req, res) => {
  const guests = await GuestModel.find().sort({ createdAt: -1 });
  res.json(guests);
});

// Admin: add one guest
guestsRouter.post("/", requireAdmin, async (req, res) => {
  const { name, partySize, phone, email } = req.body as {
    name?: string;
    partySize?: number;
    phone?: string;
    email?: string;
  };
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });

  const slug = await uniqueSlug(slugify(name));
  const guest = await GuestModel.create({
    name: name.trim(),
    slug,
    partySize: partySize && partySize > 0 ? partySize : 1,
    phone: toStoredPhone(phone),
    email,
  });
  res.status(201).json(guest);
});

// Admin: bulk add guests, either as plain names or { name, phone } pairs
guestsRouter.post("/bulk", requireAdmin, async (req, res) => {
  const { names, entries } = req.body as {
    names?: string[];
    entries?: { name?: string; phone?: string }[];
  };

  const rawRows: { name?: string; phone?: string }[] = [
    ...(Array.isArray(names) ? names.map((n) => ({ name: n, phone: undefined })) : []),
    ...(Array.isArray(entries) ? entries : []),
  ];
  const rows = rawRows
    .map((r) => ({ name: r.name?.trim() ?? "", phone: r.phone?.trim() }))
    .filter((r) => r.name);

  if (rows.length === 0) {
    return res.status(400).json({ error: "names or entries must be a non-empty array" });
  }

  const created = [];
  for (const row of rows) {
    const slug = await uniqueSlug(slugify(row.name));
    created.push(
      await GuestModel.create({ name: row.name, slug, partySize: 1, phone: toStoredPhone(row.phone) })
    );
  }
  res.status(201).json(created);
});

// Admin: update a guest
guestsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const patch = { ...req.body };
  if (typeof patch.phone === "string") patch.phone = toStoredPhone(patch.phone);
  const guest = await GuestModel.findByIdAndUpdate(req.params.id, patch, { new: true });
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  res.json(guest);
});

// Admin: delete a guest
guestsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const guest = await GuestModel.findByIdAndDelete(req.params.id);
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  res.status(204).send();
});
