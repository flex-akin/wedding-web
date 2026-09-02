import { GuestModel } from "../models/Guest";
import { SeedFlagModel } from "../models/SeedFlag";
import { toStoredPhone } from "../utils/phone";
import { slugify, uniqueGuestSlug } from "../utils/guestSlug";

type SeedEntry = { name: string; phone: string };

// Each batch runs at most once, guarded independently by its own key in
// SeedFlagModel. To add a new batch of guests later: add a new
// `{ key: "phone-guest-list-vN", entries: [...] }` block below — never edit
// an already-deployed batch's key or entries, since that key being present
// is what stops it from re-running (and duplicating) on every restart.
const BATCHES: { key: string; entries: SeedEntry[] }[] = [
  {
    key: "phone-guest-list-v1",
    entries: [
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
    ],
  },
  {
    key: "phone-guest-list-v2",
    entries: [
      { name: "Olanrewaju Abisola", phone: "234 706 103 0085" },
      { name: "Ajayi Ayodeji", phone: "234 816 770 4453" },
      { name: "Bashirudeen Ibrahim", phone: "234 812 929 5952" },
      { name: "Braimah Godsgift", phone: "0810 326 6677" },
      { name: "Bello Emmanuel", phone: "234 903 451 2441" },
      { name: "Ehidiamen Godsfavour", phone: "234 813 157 6819" },
      { name: "Adegbingbe Godwin", phone: "234 810 541 9249" },
      { name: "Bezaleel Honourjesus", phone: "234 909 416 0426" },
      { name: "Adeyeye-Kayode Ifeoluwa", phone: "234 814 301 8599" },
      { name: "Jushua Jumobi", phone: "234 902 054 1984" },
      { name: "Eze-Mbey Kachi", phone: "250 796 599 689" },
      { name: "Oluwole Laurencia", phone: "234 903 619 2020" },
      { name: "Tayo-Feleye Favour", phone: "234 903 722 6080" },
      { name: "Odebode Pleasant", phone: "234 706 881 5972" },
      { name: "Owoso Sola", phone: "234 817 562 4920" },
      { name: "Tobi Olayanju", phone: "234 810 656 1767" },
      { name: "Tobi Shalom", phone: "234 813 620 8758" },
      { name: "Rgeha Tega", phone: "44 7867 041348" },
      { name: "Oladipupo Favour", phone: "234 810 724 5724" },
      { name: "Ngim-Ngim Ewezu", phone: "234 706 569 5535" },
      { name: "Olomu God'sgift", phone: "234 8166764013" },
      { name: "Ezulu Priscillia", phone: "234 8103919099" },
    ],
  },
];

async function seedBatch(key: string, entries: SeedEntry[]): Promise<void> {
  if (entries.length === 0) return;

  const alreadySeeded = await SeedFlagModel.exists({ key });
  if (alreadySeeded) return;

  let count = 0;
  let skipped = 0;
  for (const { name, phone } of entries) {
    const trimmedName = name.trim();
    if (!trimmedName) continue;

    const storedPhone = toStoredPhone(phone);
    if (storedPhone && (await GuestModel.exists({ phone: storedPhone }))) {
      skipped += 1;
      continue;
    }

    const slug = await uniqueGuestSlug(slugify(trimmedName));
    await GuestModel.create({
      name: trimmedName,
      slug,
      partySize: 1,
      phone: storedPhone,
    });
    count += 1;
  }

  await SeedFlagModel.create({ key, count, skipped });
  console.log(`Seeded ${count} guests from phone list (key: ${key}${skipped ? `, skipped ${skipped} duplicates` : ""})`);
}

export async function seedPhoneGuests(): Promise<void> {
  for (const batch of BATCHES) {
    await seedBatch(batch.key, batch.entries);
  }
}
