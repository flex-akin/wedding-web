import { GuestModel } from "../models/Guest";
import { GuestRequestModel } from "../models/GuestRequest";
import { SeedFlagModel } from "../models/SeedFlag";

// One-time backfill: guest requests approved before approval auto-marked the
// guest as attending left those guests stuck on rsvpStatus "pending" even
// though being approved means they're confirmed to come. Brings existing
// approved requests in line with the new approve-route behavior.
const SEED_KEY = "approved-guest-requests-backfill-v1";

export async function backfillApprovedGuestRequests(): Promise<void> {
  const alreadyRan = await SeedFlagModel.exists({ key: SEED_KEY });
  if (alreadyRan) return;

  const approvedGuestIds = await GuestRequestModel.find({ status: "approved", guestId: { $ne: null } }).distinct(
    "guestId"
  );

  const result = await GuestModel.updateMany(
    { _id: { $in: approvedGuestIds }, rsvpStatus: "pending" },
    { $set: { rsvpStatus: "attending", attendingCeremony: true, attendingReception: true, respondedAt: new Date() } }
  );

  await SeedFlagModel.create({ key: SEED_KEY, count: result.modifiedCount });
  console.log(
    `Backfilled ${result.modifiedCount} approved-request guests onto attending (key: ${SEED_KEY})`
  );
}
