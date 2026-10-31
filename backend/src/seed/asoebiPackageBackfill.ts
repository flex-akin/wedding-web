import { AsoebiPaymentModel } from "../models/AsoebiPayment";
import { SeedFlagModel } from "../models/SeedFlag";

// One-time backfill for the Part/Full/Couples package feature: contributors
// who already had a gender set before packages existed were effectively on
// the (only) package available at the time, now called "Full". Without this,
// they'd read as package: null and silently lose their existing target and
// progress. Guarded by SeedFlagModel so it never re-runs.
const SEED_KEY = "asoebi-package-backfill-v1";

export async function backfillAsoebiPackages(): Promise<void> {
  const alreadyRan = await SeedFlagModel.exists({ key: SEED_KEY });
  if (alreadyRan) return;

  const result = await AsoebiPaymentModel.updateMany(
    { gender: { $in: ["M", "F"] }, package: null },
    { $set: { package: "full" } }
  );

  await SeedFlagModel.create({ key: SEED_KEY, count: result.modifiedCount });
  console.log(
    `Backfilled ${result.modifiedCount} aso-ebi contributors onto the Full Package (key: ${SEED_KEY})`
  );
}
