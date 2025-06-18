export interface User {
  id: string;
  email: string;
  username?: string;
}

export interface PokemonCard {
  id: string;
  name: string;
  imageUrl: string;
  setName: string;
  cardNumber: string;
  rarity: string;
  marketPrice?: number;
}

export interface CardPrice {
  id: string;
  cardId: string;
  store: string;
  price: number;
  date: string;
  condition?: string;
}

export interface Collection {
  id: string;
  name: string;
  userId: string;
  description?: string | null;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionCard {
  id: string;
  collectionId: string;
  cardId: string;
  quantity: number;
  purchasePrice?: number | null;
  purchaseDate?: string | null;
  condition?: string | null;
  notes?: string | null;
  card?: PokemonCard;
  createdAt: string;
  updatedAt: string;
}

// Mapping functions to convert between Supabase and app models
export function mapSupabaseCollectionToCollection(supabaseCollection: any): Collection {
  return {
    id: supabaseCollection.id,
    name: supabaseCollection.name,
    userId: supabaseCollection.user_id,
    description: supabaseCollection.description,
    isPublic: supabaseCollection.is_public,
    createdAt: supabaseCollection.created_at,
    updatedAt: supabaseCollection.updated_at
  };
}

export function mapSupabaseCollectionCardToCollectionCard(supabaseCard: any): CollectionCard {
  return {
    id: supabaseCard.id,
    collectionId: supabaseCard.collection_id,
    cardId: supabaseCard.card_id,
    quantity: supabaseCard.quantity,
    purchasePrice: supabaseCard.purchase_price,
    purchaseDate: supabaseCard.purchase_date,
    condition: supabaseCard.condition,
    notes: supabaseCard.notes,
    createdAt: supabaseCard.created_at,
    updatedAt: supabaseCard.updated_at
  };
} 