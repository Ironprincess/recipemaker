type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function isRateLimited(key: string, maxPerMinute = 10): boolean {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + 60_000 });
    return false;
  }

  if (existing.count >= maxPerMinute) {
    return true;
  }

  existing.count += 1;
  buckets.set(key, existing);
  return false;
}
