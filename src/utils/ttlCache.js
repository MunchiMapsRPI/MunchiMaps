function createTtlCache({ ttlMs, maxEntries = 200 } = {}) {
  const ttl = Number(ttlMs) || 5000;
  const max = Number(maxEntries) || 200;
  const map = new Map(); // key -> { value, expiresAt }

  function get(key) {
    const entry = map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      map.delete(key);
      return undefined;
    }
    // refresh LRU-ish
    map.delete(key);
    map.set(key, entry);
    return entry.value;
  }

  function set(key, value) {
    if (map.size >= max) {
      const oldestKey = map.keys().next().value;
      if (oldestKey != null) map.delete(oldestKey);
    }
    map.set(key, { value, expiresAt: Date.now() + ttl });
  }

  function clear() {
    map.clear();
  }

  return { get, set, clear };
}

module.exports = { createTtlCache };

