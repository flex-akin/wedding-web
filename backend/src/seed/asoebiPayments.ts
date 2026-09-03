import { GuestModel } from "../models/Guest";
import { AsoebiPaymentModel } from "../models/AsoebiPayment";
import { SeedFlagModel } from "../models/SeedFlag";

// One-time snapshot migration: copies every guest that exists *today* into
// the aso-ebi payment tracker. New guests added after this runs are NOT
// auto-added — add them via Admin → Aso-Ebi Payments instead. Guarded by
// SeedFlagModel so it never re-runs (or duplicates) on restart/redeploy.
const SEED_KEY = "asoebi-payment-migration-v1";

export async function seedAsoebiPayments(): Promise<void> {
  const alreadyRan = await SeedFlagModel.exists({ key: SEED_KEY });
  if (alreadyRan) return;

  const guests = await GuestModel.find();
  let count = 0;
  let skipped = 0;

  for (const guest of guests) {
    if (!guest.phone) {
      skipped += 1;
      continue;
    }
    const existing = await AsoebiPaymentModel.exists({ phone: guest.phone });
    if (existing) {
      skipped += 1;
      continue;
    }
    await AsoebiPaymentModel.create({
      name: guest.name,
      phone: guest.phone,
      guestId: guest._id,
    });
    count += 1;
  }

  await SeedFlagModel.create({ key: SEED_KEY, count, skipped });
  console.log(`Migrated ${count} guests into aso-ebi payment tracker (key: ${SEED_KEY}, skipped ${skipped})`);
}
