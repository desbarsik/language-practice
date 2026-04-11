import type { CustomCard } from '../types';

const USER_CARDS_KEY = 'english_master_user_cards';

export const userCardsService = {
  getAll: (): CustomCard[] => {
    const stored = localStorage.getItem(USER_CARDS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveAll: (cards: CustomCard[]) => {
    localStorage.setItem(USER_CARDS_KEY, JSON.stringify(cards));
  },

  addCard: (card: Omit<CustomCard, 'id' | 'created_at' | 'updated_at'>): CustomCard => {
    const cards = userCardsService.getAll();
    const newCard: CustomCard = {
      ...card,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    cards.push(newCard);
    userCardsService.saveAll(cards);
    return newCard;
  },

  updateCard: (id: string, updates: Partial<Pick<CustomCard, 'front_text' | 'back_text' | 'hint' | 'type'>>): CustomCard | null => {
    const cards = userCardsService.getAll();
    const index = cards.findIndex(c => c.id === id);
    if (index === -1) return null;

    cards[index] = {
      ...cards[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    userCardsService.saveAll(cards);
    return cards[index];
  },

  deleteCard: (id: string): boolean => {
    const cards = userCardsService.getAll();
    const filtered = cards.filter(c => c.id !== id);
    if (filtered.length === cards.length) return false;
    userCardsService.saveAll(filtered);
    return true;
  },

  clearAll: () => {
    localStorage.removeItem(USER_CARDS_KEY);
  },

  count: (): number => {
    return userCardsService.getAll().length;
  },
};
