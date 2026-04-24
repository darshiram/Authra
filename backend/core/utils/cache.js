const cache = new Map();

export const setCache = (key, value, ttlInSeconds = 300) => {
  const expiresAt = Date.now() + ttlInSeconds * 1000;
  cache.set(key, { value, expiresAt });
};

export const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cache.delete(key);
    return null;
  }
  return item.value;
};

export const deleteCache = (key) => {
  cache.delete(key);
};
