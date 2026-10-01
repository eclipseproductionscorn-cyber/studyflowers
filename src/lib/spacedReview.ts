/** A short Leitner ladder: forgotten cards return today; recalled cards spread out. */
export const REVIEW_DAYS = [1, 3, 7, 14, 30, 60] as const;

export interface ReviewCard {
  id: string;
  front: string;
  back: string;
  type: "qa" | "true_false" | "complete" | "practical";
  hint?: string;
  timesReviewed: number;
  lastReviewed: string | null;
  isCorrect?: boolean;
  reviewLevel?: number;
  nextReview?: string;
}

export interface ReviewDeck {
  id: string;
  name: string;
  cards: ReviewCard[];
  color: string;
  subject: string;
  trailId?: string;
}

export const deckStorageKey = (userId: string) => `studyflow-flashcard-decks-${userId}`;
export const isDue = (card: ReviewCard, now = new Date()) => !card.nextReview || new Date(card.nextReview).getTime() <= now.getTime();

export function scheduleReview(card: ReviewCard, correct: boolean, now = new Date()): ReviewCard {
  const level = correct ? Math.min((card.reviewLevel ?? -1) + 1, REVIEW_DAYS.length - 1) : 0;
  const next = new Date(now);
  if (correct) next.setDate(next.getDate() + REVIEW_DAYS[level]);
  else next.setMinutes(next.getMinutes() + 10);
  return { ...card, reviewLevel: level, nextReview: next.toISOString(), lastReviewed: now.toISOString(), timesReviewed: card.timesReviewed + 1, isCorrect: correct };
}

export function readDecks(userId: string): ReviewDeck[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(deckStorageKey(userId)) || "[]");
    return Array.isArray(parsed) ? parsed as ReviewDeck[] : [];
  } catch { return []; }
}

export function saveDecks(userId: string, decks: ReviewDeck[]) {
  localStorage.setItem(deckStorageKey(userId), JSON.stringify(decks));
}
