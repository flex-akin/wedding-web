import { Schema, model } from "mongoose";

// One document per seed batch, keyed by `key`. Its presence means that seed
// has already run — checked before seeding so restarts/redeploys never
// re-insert (or re-duplicate) the same records.
const seedFlagSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    seededAt: { type: Date, default: Date.now },
    count: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const SeedFlagModel = model("SeedFlag", seedFlagSchema);
