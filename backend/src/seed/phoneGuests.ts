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
  { name: "Oyeniran Alaba", phone: "234 808 540 8112" },
  { name: "Oyetade Bisola", phone: "234 903 199 4287" },
  { name: "Akintola Ebenezer", phone: "234 806 318 3930" },
  { name: "Oyebisi Darasimi", phone: "234 808 004 8654" },
  { name: "Adeniran Adetoyese", phone: "234 901 572 3473" },
  { name: "Adoko Roland", phone: "234 816 549 2598" },
  { name: "Makinde Funmilola", phone: "234 810 937 7434" },
  { name: "Gbenga", phone: "234 816 749 0360" },
  { name: "Abu Amos Banji", phone: "234 816 602 3810" },
  { name: "Muku John Kuma", phone: "234 818 808 0018" },
  { name: "Quadri Jumoke", phone: "234 806 058 6113" },
  { name: "Onochie Cynthia", phone: "234 703 837 9724" },
  { name: "Kayode Dada", phone: "234 806 461 4208" },
  { name: "Ladipo Mojisola", phone: "234 813 978 4469" },
  { name: "Dada Damilola", phone: "234 902 113 8367" },
  { name: "Olatigbe Olubusayo", phone: "234 810 701 2517" },
  { name: "Salami Damilola", phone: "234 708 311 7903" },
  { name: "Olufolarin Tunde", phone: "234 816 926 6529" },
  { name: "Famotibe Moses", phone: "234 907 058 2092" },
  { name: "Ajimuda Ifedolapo", phone: "234 903 362 1042" },
  { name: "Samuel Tobi", phone: "234 708 337 7685" },
  { name: "Adejumo Boluwatife", phone: "234 708 047 1796" },
  { name: "Timothy Ifeoluwa", phone: "234 814 482 5903" },
  { name: "Dada Tobi", phone: "234 706 557 6172" },
  { name: "Faleye Tolulope", phone: "234 813 825 7344" },
  { name: "Akinade Adeola", phone: "234 816 467 0729" },
  { name: "Makinde Nike", phone: "234 901 422 6209" },
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
