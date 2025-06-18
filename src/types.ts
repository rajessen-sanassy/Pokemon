// Pokemon Card related types
export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  marketPrice: number | null;
}

export interface CardPrice {
  id: string;
  cardId: string;
  store: string;
  price: number;
  date: string;
  condition: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionCard {
  id: string;
  collectionId: string;
  cardId: string;
  card: PokemonCard;
  quantity: number;
  purchasePrice?: number;
  purchaseDate?: string;
  condition?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// User related types
export interface User {
  id: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  createdAt: string;
}

// Chart types
export interface ChartDataPoint {
  date: string;
  [store: string]: number | string;
}

export interface TimeSpan {
  label: string;
  days: number;
}

export interface StoreColor {
  [store: string]: string;
} 