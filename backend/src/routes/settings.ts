import { Router } from "express";
import { getOrCreateSettings } from "../models/Settings";
import { requireAdmin } from "../middleware/requireAdmin";
import { env } from "../config/env";

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res) => {
  const settings = await getOrCreateSettings();
  res.json(settings);
});

settingsRouter.get("/payment-mode", (_req, res) => {
  res.json({ mode: env.paymentMode, paystackPublicKey: env.paymentMode === "paystack" ? env.paystackPublicKey : undefined });
});

settingsRouter.put("/", requireAdmin, async (req, res) => {
  const settings = await getOrCreateSettings();
  Object.assign(settings, req.body);
  await settings.save();
  res.json(settings);
});
