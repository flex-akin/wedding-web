import { Router } from "express";
import { WishModel } from "../models/Wish";
import { requireAdmin } from "../middleware/requireAdmin";

export const wishesRouter = Router();

// Public: list approved wishes
wishesRouter.get("/", async (_req, res) => {
  const wishes = await WishModel.find({ approved: true }).sort({ createdAt: -1 }).limit(300);
  res.json(wishes);
});

// Public: leave a wish
wishesRouter.post("/", async (req, res) => {
  const { name, message } = req.body as { name?: string; message?: string };
  if (!name?.trim() || !message?.trim()) {
    return res.status(400).json({ error: "name and message are required" });
  }
  const wish = await WishModel.create({ name: name.trim(), message: message.trim() });
  res.status(201).json(wish);
});

// Admin: list all wishes including hidden ones
wishesRouter.get("/all", requireAdmin, async (_req, res) => {
  const wishes = await WishModel.find().sort({ createdAt: -1 });
  res.json(wishes);
});

// Admin: toggle visibility
wishesRouter.patch("/:id", requireAdmin, async (req, res) => {
  const wish = await WishModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!wish) return res.status(404).json({ error: "Wish not found" });
  res.json(wish);
});

// Admin: delete a wish
wishesRouter.delete("/:id", requireAdmin, async (req, res) => {
  const wish = await WishModel.findByIdAndDelete(req.params.id);
  if (!wish) return res.status(404).json({ error: "Wish not found" });
  res.status(204).send();
});
