export const FREE_AI_QUESTIONS = 3;

export function remainingQuestions(used: number): number {
  return Math.max(0, FREE_AI_QUESTIONS - Math.max(0, used));
}

const usage = new Map<string, { count: number; touchedAt: number }>();

export function consumeFreeQuestion(visitorId: string) {
  const current = usage.get(visitorId)?.count ?? 0;
  if (remainingQuestions(current) === 0) {
    return { allowed: false as const, remaining: 0 };
  }
  const next = current + 1;
  usage.set(visitorId, { count: next, touchedAt: Date.now() });
  return { allowed: true as const, remaining: remainingQuestions(next) };
}

export function refundFreeQuestion(visitorId: string) {
  const current = usage.get(visitorId)?.count ?? 0;
  const next = Math.max(0, current - 1);
  usage.set(visitorId, { count: next, touchedAt: Date.now() });
}