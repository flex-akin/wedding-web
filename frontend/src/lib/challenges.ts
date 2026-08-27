export type ChallengeId = "groomsmen" | "bridal-team" | "parents";

export interface Challenge {
  id: ChallengeId;
  emoji: string;
  label: string;
}

export const CHALLENGES: Challenge[] = [
  { id: "groomsmen", emoji: "🤵", label: "With the groomsmen" },
  { id: "bridal-team", emoji: "👰", label: "With the bridal team" },
  { id: "parents", emoji: "❤️", label: "With either parents" },
];

export const CHALLENGE_PRIZES = ["₦20,000", "₦10,000", "₦5,000"];

export function challengeLabel(id: string | null | undefined): Challenge | undefined {
  return CHALLENGES.find((c) => c.id === id);
}
