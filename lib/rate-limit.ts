type AttemptState = {
  count: number;
  firstAttemptAt: number;
  blockedUntil?: number;
};

const WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;

const attempts = new Map<string, AttemptState>();

function cleanup(now: number) {
  for (const [key, value] of attempts.entries()) {
    const blockedExpired = value.blockedUntil ? value.blockedUntil <= now : true;
    if (blockedExpired && now - value.firstAttemptAt > WINDOW_MS) {
      attempts.delete(key);
    }
  }
}

export function isRateLimited(key: string) {
  const now = Date.now();
  cleanup(now);
  const state = attempts.get(key);
  if (!state || !state.blockedUntil) return false;
  if (state.blockedUntil <= now) {
    attempts.delete(key);
    return false;
  }
  return true;
}

export function registerFailedAttempt(key: string) {
  const now = Date.now();
  cleanup(now);

  const current = attempts.get(key);
  if (!current || now - current.firstAttemptAt > WINDOW_MS) {
    attempts.set(key, { count: 1, firstAttemptAt: now });
    return;
  }

  const nextCount = current.count + 1;
  const shouldBlock = nextCount >= MAX_FAILED_ATTEMPTS;

  attempts.set(key, {
    count: nextCount,
    firstAttemptAt: current.firstAttemptAt,
    blockedUntil: shouldBlock ? now + WINDOW_MS : current.blockedUntil,
  });
}

export function clearFailedAttempts(key: string) {
  attempts.delete(key);
}
