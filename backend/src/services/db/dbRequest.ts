import { getCache, setCache } from "@/utils/cache";
import { CACHE_CONFIG } from "@/config/cache";
import { db } from "@/config/db";

export const dbRequest = async <T>(
  key: string,
  query: () => Promise<T>,
  ttlMs?: number
): Promise<T> => {
  const cached = null// getCache<T>(key);
  if (cached) return cached;
  const result = await query();
  setCache(key, result, ttlMs || CACHE_CONFIG.DEFAULT_TTL_MS);
  return result;
};
