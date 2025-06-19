// Pokemon Card related types
export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  setName: string;
  setCode: string;
  cardNumber: string;
  rarity: string;
  artist?: string;
  releaseDate?: string;
  marketPrice?: number;
  types?: string[];
}

export interface CardPrice {
  date: string;
  price: number;
  store: string;
  condition: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  username?: string;
  avatarUrl?: string;
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

export interface Card {
  id: string;
  name: string;
  imageUrl: string;
  setName: string;
  setCode: string;
  rarity: string;
  number: string;
  artist: string;
  releaseDate: string;
  marketPrice: number;
  types?: string[];
}

export interface CardInCollection {
  id: string;
  cardId: string;
  collectionId: string;
  purchasePrice?: number;
  purchaseDate?: string;
  condition?: string;
  notes?: string;
  card?: PokemonCard;
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface SearchFilters {
  types?: string[];
  rarity?: string;
  set?: string;
  minPrice?: number;
  maxPrice?: number;
} 