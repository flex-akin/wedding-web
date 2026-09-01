import { GuestModel } from "../models/Guest";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function uniqueGuestSlug(base: string): Promise<string> {
  let slug = base || "guest";
  let suffix = 1;
  while (await GuestModel.exists({ slug })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }
  return slug;
}
