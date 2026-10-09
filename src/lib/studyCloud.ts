import { supabase } from "@/integrations/supabase/client";
import { REVIEW_DAYS } from "@/lib/spacedReview";

export type CloudCard = {
  id: string; deck_id: string; deck_name: string; trail_id: string | null; subject: string | null;
  front: string; back: string; card_type: string; hint: string | null;
  review_level: number; next_review: string; times_reviewed: number; last_reviewed: string | null; is_correct: boolean | null;
};

export async function saveCardsToAccount(userId: string, deck: { id: string; name: string; trailId?: string; subject?: string }, cards: { id?: string; front: string; back: string; type?: string; hint?: string }[]) {
  return supabase.from("study_cards").upsert(cards.map(c => ({
    ...(c.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(c.id) ? { id: c.id } : {}),
    user_id: userId, deck_id: deck.id, deck_name: deck.name, trail_id: deck.trailId ?? null, subject: deck.subject ?? null,
    front: c.front, back: c.back, card_type: c.type || "qa", hint: c.hint ?? null,
  })), { onConflict: "id", ignoreDuplicates: true }).select("*");
}

export async function reviewCloudCard(card: CloudCard, correct: boolean) {
  const level = correct ? Math.min(card.review_level + 1, REVIEW_DAYS.length - 1) : 0;
  const next = new Date();
  if (correct) next.setDate(next.getDate() + REVIEW_DAYS[Math.max(level, 0)]); else next.setMinutes(next.getMinutes() + 10);
  const patch = { review_level: level, next_review: next.toISOString(), last_reviewed: new Date().toISOString(), times_reviewed: card.times_reviewed + 1, is_correct: correct };
  await supabase.from("study_cards").update(patch).eq("id", card.id);
  return { ...card, ...patch };
}

export async function saveQuizAttempt(userId: string, a: { trailId?: string; phaseId?: string; topic: string; correct: number; total: number }) {
  return supabase.from("quiz_attempts").insert({ user_id: userId, trail_id: a.trailId ?? null, phase_id: a.phaseId ?? null, topic: a.topic, correct: a.correct, total: a.total });
}

export async function loadAccountCards(userId: string) {
  const { data, error } = await supabase.from("study_cards").select("*").eq("user_id", userId).order("created_at");
  if (error) throw error;
  return (data as CloudCard[]) || [];
}

export async function updateCardStats(id: string, patch: Record<string, unknown>) {
  return supabase.from("study_cards").update(patch).eq("id", id);
}

export async function deleteAccountDeck(userId: string, deckId: string) {
  return supabase.from("study_cards").delete().eq("user_id", userId).eq("deck_id", deckId);
}
