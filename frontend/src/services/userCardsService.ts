import type { CustomCard } from '../types';

const API_BASE = import.meta.env.VITE_CARDS_API || (import.meta.env.DEV ? 'http://127.0.0.1:3001' : 'http://192.168.199.222:3001');
const CACHE_KEY = 'english_master_user_cards_cache';
const OLD_KEY = 'english_master_user_cards';

// Миграция: переносим карточки из старого ключа в новый
const migrateOldStorage = (): CustomCard[] => {
  try {
    const oldData = localStorage.getItem(OLD_KEY);
    if (oldData) {
      const cards: CustomCard[] = JSON.parse(oldData);
      if (Array.isArray(cards) && cards.length > 0) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(cards));
        localStorage.removeItem(OLD_KEY);
        console.log(`Migrated ${cards.length} cards from old storage`);
        return cards;
      }
    }
  } catch { /* ignore */ }
  return [];
};

const getCache = (): CustomCard[] => {
  try {
    const s = localStorage.getItem(CACHE_KEY);
    if (s) return JSON.parse(s);
    // Пробуем старый ключ (миграция)
    return migrateOldStorage();
  } catch { return []; }
};

const setCache = (cards: CustomCard[]) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cards));
};

const api = async (method: string, path: string, body?: unknown) => {
  const opts: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  return fetch(`${API_BASE}${path}`, opts);
};

export const userCardsService = {
  // Load from server, fallback to cache
  getAll: async (): Promise<CustomCard[]> => {
    try {
      const res = await api('GET', '/api/cards');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCache(data.cards);
      return data.cards;
    } catch {
      return getCache();
    }
  },

  // Create card on server + update cache (auto-sync)
  addCard: async (card: Omit<CustomCard, 'id' | 'created_at' | 'updated_at'>): Promise<CustomCard> => {
    const newCard: CustomCard = {
      ...card,
      id: `card-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    try {
      const res = await api('POST', '/api/cards', newCard);
      if (res.ok) {
        const data = await res.json();
        setCache([data.card, ...getCache()]);
        return data.card;
      }
    } catch { /* ignore */ }
    const cache = getCache();
    cache.push(newCard);
    setCache(cache);
    return newCard;
  },

  // Update card on server + update cache (auto-sync)
  updateCard: async (id: string, updates: Partial<Pick<CustomCard, 'front_text' | 'back_text' | 'hint' | 'type'>>): Promise<CustomCard | null> => {
    try {
      const res = await api('PUT', `/api/cards/${id}`, updates);
      if (res.ok) {
        const data = await res.json();
        const cache = getCache();
        const idx = cache.findIndex(c => c.id === id);
        if (idx !== -1) cache[idx] = data.card;
        setCache(cache);
        return data.card;
      }
    } catch { /* ignore */ }
    const cache = getCache();
    const idx = cache.findIndex(c => c.id === id);
    if (idx === -1) return null;
    cache[idx] = { ...cache[idx], ...updates, updated_at: new Date().toISOString() };
    setCache(cache);
    return cache[idx];
  },

  // Delete card on server + update cache (auto-sync)
  deleteCard: async (id: string): Promise<boolean> => {
    try {
      const res = await api('DELETE', `/api/cards/${id}`);
      if (res.ok) {
        setCache(getCache().filter(c => c.id !== id));
        return true;
      }
    } catch { /* ignore */ }
    const before = getCache().length;
    setCache(getCache().filter(c => c.id !== id));
    return getCache().length < before;
  },

  // Bulk sync: replace all cards on server
  syncAll: async (cards: CustomCard[]): Promise<number> => {
    try {
      const res = await api('PUT', '/api/cards', { cards });
      if (res.ok) {
        const data = await res.json();
        setCache(cards);
        return data.count;
      }
    } catch { /* ignore */ }
    return 0;
  },

  clearAll: async (): Promise<void> => {
    localStorage.removeItem(CACHE_KEY);
    try {
      await api('PUT', '/api/cards', { cards: [] });
    } catch { /* ignore */ }
  },

  // Sync (count from cache)
  count: (): number => getCache().length,

  exportAsJSON: (): string => JSON.stringify(getCache(), null, 2),
};
