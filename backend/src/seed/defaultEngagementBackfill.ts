import { GuestModel } from "../models/Guest";
import { SeedFlagModel } from "../models/SeedFlag";

// One-time backfill: Engagement now defaults to checked for guests who
// haven't responded yet. Brings existing never-responded guests in line
// with that default rather than leaving them at attendingReception: false.
const SEED_KEY = "default-engagement-backfill-v1";

export async function backfillDefaultEngagement(): Promise<void> {
  const alreadyRan = await SeedFlagModel.exists({ key: SEED_KEY });
  if (alreadyRan) return;

  const result = await GuestModel.updateMany(
    { rsvpStatus: "pending", attendingReception: false },
    { $set: { attendingReception: true } }
  );

  await SeedFlagModel.create({ key: SEED_KEY, count: result.modifiedCount });
  console.log(
    `Backfilled ${result.modifiedCount} never-responded guests onto Engagement by default (key: ${SEED_KEY})`
  );
}
