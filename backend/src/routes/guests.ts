import { Router } from "express";
import { GuestModel } from "../models/Guest";
import { requireAdmin } from "../middleware/requireAdmin";

export const guestsRouter = Router();

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || "guest";
  let suffix = 1;
  while (await GuestModel.exists({ slug })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}

// Public: fetch guest by slug for the personalized RSVP page
guestsRouter.get("/slug/:slug", async (req, res) => {
  const guest = await GuestModel.findOne({ slug: req.params.slug.toLowerCase() });
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  res.json(guest);
});

// Public: submit RSVP
guestsRouter.post("/slug/:slug/rsvp", async (req, res) => {
  const guest = await GuestModel.findOne({ slug: req.params.slug.toLowerCase() });
  if (!guest) return res.status(404).json({ error: "Guest not found" });

  const { rsvpStatus, mealChoice, plusOnes, notes } = req.body as {
    rsvpStatus?: string;
    mealChoice?: string;
    plusOnes?: { name: string }[];
    notes?: string;
  };

  if (!rsvpStatus || !["attending", "declined"].includes(rsvpStatus)) {
    return res.status(400).json({ error: "rsvpStatus must be 'attending' or 'declined'" });
  }

  guest.rsvpStatus = rsvpStatus as "attending" | "declined";
  if (mealChoice !== undefined) guest.mealChoice = mealChoice;
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
    phone,
    email,
  });
  res.status(201).json(guest);
});

// Admin: bulk add guests from a list of names (one per line)
guestsRouter.post("/bulk", requireAdmin, async (req, res) => {
  const { names } = req.body as { names?: string[] };
  if (!Array.isArray(names) || names.length === 0) {
    return res.status(400).json({ error: "names must be a non-empty array" });
  }

  const created = [];
  for (const rawName of names) {
    const name = rawName.trim();
    if (!name) continue;
    const slug = await uniqueSlug(slugify(name));
    created.push(await GuestModel.create({ name, slug, partySize: 1 }));
  }
  res.status(201).json(created);
});

// Admin: update a guest
guestsRouter.patch("/:id", requireAdmin, async (req, res) => {
  const guest = await GuestModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  res.json(guest);
});

// Admin: delete a guest
guestsRouter.delete("/:id", requireAdmin, async (req, res) => {
  const guest = await GuestModel.findByIdAndDelete(req.params.id);
  if (!guest) return res.status(404).json({ error: "Guest not found" });
  res.status(204).send();
});
