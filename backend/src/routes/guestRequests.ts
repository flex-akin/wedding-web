import { Router } from "express";
import { GuestModel } from "../models/Guest";
import { GuestRequestModel } from "../models/GuestRequest";
import { requireAdmin } from "../middleware/requireAdmin";
import { toStoredPhone } from "../utils/phone";
import { slugify, uniqueGuestSlug } from "../utils/guestSlug";

export const guestRequestsRouter = Router();

// Public: ask to be added to the guest list (phone wasn't found on /rsvp)
guestRequestsRouter.post("/", async (req, res) => {
  const { name, phone } = req.body as { name?: string; phone?: string };
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "name and phone are required" });
  }

  const storedPhone = toStoredPhone(phone);
  if (!storedPhone) return res.status(400).json({ error: "Enter a valid phone number" });

  const existingGuest = await GuestModel.exists({ phone: storedPhone });
  if (existingGuest) {
    return res.status(409).json({ error: "That number is already on the guest list. Try searching again." });
  }

  const existingRequest = await GuestRequestModel.findOne({ phone: storedPhone, status: "pending" });
  if (existingRequest) {
    existingRequest.name = name.trim();
    await existingRequest.save();
    return res.status(200).json(existingRequest);
  }

  const request = await GuestRequestModel.create({ name: name.trim(), phone: storedPhone });
  res.status(201).json(request);
});

// Admin: list all requests
guestRequestsRouter.get("/", requireAdmin, async (_req, res) => {
  const requests = await GuestRequestModel.find().sort({ createdAt: -1 });
  res.json(requests);
});

// Admin: approve a request, creating the real guest record
guestRequestsRouter.patch("/:id/approve", requireAdmin, async (req, res) => {
  const request = await GuestRequestModel.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "pending") return res.status(400).json({ error: "Request already resolved" });

  const slug = await uniqueGuestSlug(slugify(request.name));
  const guest = await GuestModel.create({
    name: request.name,
    slug,
    partySize: 1,
    phone: request.phone,
  });

  request.status = "approved";
  request.guestId = guest._id;
  await request.save();

  res.json({ request, guest });
});

// Admin: reject a request
guestRequestsRouter.patch("/:id/reject", requireAdmin, async (req, res) => {
  const request = await GuestRequestModel.findById(req.params.id);
  if (!request) return res.status(404).json({ error: "Request not found" });
  if (request.status !== "pending") return res.status(400).json({ error: "Request already resolved" });

  request.status = "rejected";
  await request.save();
  res.json(request);
});
