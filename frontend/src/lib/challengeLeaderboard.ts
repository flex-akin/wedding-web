import { CHALLENGES, type ChallengeId } from "./challenges";
import type { Photo } from "../types";

export interface ChallengeFinisher {
  name: string;
  completedAt: string;
}

const REQUIRED_TAGS = CHALLENGES.map((c) => c.id);

export function computeChallengeLeaderboard(photos: Photo[]): ChallengeFinisher[] {
  const byPerson = new Map<string, { name: string; earliest: Partial<Record<ChallengeId, string>> }>();

  for (const photo of photos) {
    const tag = photo.challengeTag as ChallengeId | null;
    const rawName = photo.uploadedBy?.trim();
    if (!tag || !rawName) continue;

    const key = rawName.toLowerCase();
    const entry = byPerson.get(key) ?? { name: rawName, earliest: {} };
    const existing = entry.earliest[tag];
    if (!existing || photo.createdAt < existing) {
      entry.earliest[tag] = photo.createdAt;
    }
    byPerson.set(key, entry);
  }

  const finishers: ChallengeFinisher[] = [];
  for (const { name, earliest } of byPerson.values()) {
    if (!REQUIRED_TAGS.every((tag) => earliest[tag])) continue;
    const completedAt = REQUIRED_TAGS.map((tag) => earliest[tag] as string).sort().at(-1)!;
    finishers.push({ name, completedAt });
  }

  return finishers.sort((a, b) => (a.completedAt < b.completedAt ? -1 : 1));
}
