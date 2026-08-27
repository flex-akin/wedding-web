import { Router } from "express";
import { PhotoModel } from "../models/Photo";
import { requireAdmin } from "../middleware/requireAdmin";
import { uploadPhoto } from "../middleware/upload";
import { emitPhotoHidden, emitPhotoLiked, emitPhotoNew } from "../sockets";

export const photosRouter = Router();

const CHALLENGE_TAGS = new Set(["groomsmen", "bridal-team", "parents"]);

// Public: list approved photos
photosRouter.get("/", async (_req, res) => {
  const photos = await PhotoModel.find({ approved: true }).sort({ createdAt: -1 }).limit(200);
  res.json(photos);
});

// Public: upload a photo (guests reach this via the QR code)
photosRouter.post("/", uploadPhoto.single("photo"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "photo file is required" });
  const { uploadedBy, challengeTag } = req.body as { uploadedBy?: string; challengeTag?: string };

  if (challengeTag && !CHALLENGE_TAGS.has(challengeTag)) {
    return res.status(400).json({ error: "Invalid challengeTag" });
  }

  const photo = await PhotoModel.create({
    url: `/uploads/${req.file.filename}`,
    uploadedBy,
    approved: true,
    challengeTag: challengeTag || null,
  });
  emitPhotoNew(photo);
  res.status(201).json(photo);
});

// Public: heart a photo (attributed to a name so the wall can show who liked what)
photosRouter.post("/:id/like", async (req, res) => {
  const { name } = req.body as { name?: string };
  if (!name?.trim()) return res.status(400).json({ error: "name is required" });

  const photo = await PhotoModel.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likedBy: name.trim() } },
    { new: true }
  );
  if (!photo) return res.status(404).json({ error: "Photo not found" });
  emitPhotoLiked(String(photo._id), photo.likedBy);
  res.json({ likedBy: photo.likedBy });
});

// Admin: list all photos including hidden ones
photosRouter.get("/all", requireAdmin, async (_req, res) => {
  const photos = await PhotoModel.find().sort({ createdAt: -1 });
  res.json(photos);
});

// Admin: toggle approval (show/hide)
photosRouter.patch("/:id", requireAdmin, async (req, res) => {
  const photo = await PhotoModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!photo) return res.status(404).json({ error: "Photo not found" });
  if (photo.approved === false) emitPhotoHidden(String(photo._id));
  res.json(photo);
});
