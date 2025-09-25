type CacheEntry<T> = {
  value: T;
  expiresAt?: number;
};

const cache = new Map<string, CacheEntry<any>>();

export const getCache = <T>(key: string): T | null => {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && entry.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

export const setCache = <T>(key: string, value: T, ttlMs?: number) => {
  const expiresAt = ttlMs ? Date.now() + ttlMs : undefined;
  cache.set(key, { value, expiresAt });
};

export const clearCache = (key: string) => {
  cache.delete(key);
};
