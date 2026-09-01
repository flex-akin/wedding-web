import { GuestModel } from "../models/Guest";
import { SeedFlagModel } from "../models/SeedFlag";
import { toStoredPhone } from "../utils/phone";
import { slugify, uniqueGuestSlug } from "../utils/guestSlug";

// Bump this key if you ever want to intentionally re-run a *new* batch —
// a fresh key means a fresh check, so old guests are never touched or
// duplicated. Leave it alone for edits to the same list.
const SEED_KEY = "phone-guest-list-v1";

// Fill this in with the real invite list, then redeploy — it only runs once
// per SEED_KEY (guarded by SeedFlagModel below), so it's safe to leave here
// permanently after the first successful run.
const PHONE_GUEST_SEED: { name: string; phone: string }[] = [
  // { name: "Jane Doe", phone: "08012345678" },
];

export async function seedPhoneGuests(): Promise<void> {
  if (PHONE_GUEST_SEED.length === 0) return;

  const alreadySeeded = await SeedFlagModel.exists({ key: SEED_KEY });
  if (alreadySeeded) return;

  let count = 0;
  for (const { name, phone } of PHONE_GUEST_SEED) {
    const trimmedName = name.trim();
    if (!trimmedName) continue;

    const slug = await uniqueGuestSlug(slugify(trimmedName));
    await GuestModel.create({
      name: trimmedName,
      slug,
      partySize: 1,
      phone: toStoredPhone(phone),
    });
    count += 1;
  }

  await SeedFlagModel.create({ key: SEED_KEY, count });
  console.log(`Seeded ${count} guests from phone list (key: ${SEED_KEY})`);
}
