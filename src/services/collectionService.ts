import { supabase } from './supabase';
import type { Collection, CollectionCard, PokemonCard } from '../types';
import { getCardById } from './pokemonCardApi';

// Map Supabase collection card to our CollectionCard type
const mapSupabaseCollectionCardToCollectionCard = async (item: any): Promise<CollectionCard> => {
  // Fetch the card data using the Pokemon TCG API
  const card = await getCardById(item.card_id);
  
  // Create a default card if the API call fails
  const cardData: PokemonCard = card || {
    id: item.card_id || 'unknown',
    name: 'Unknown Card',
    imageUrl: 'https://via.placeholder.com/245x342.png?text=Card+Not+Found',
    setName: 'Unknown',
    cardNumber: '?/?',
    rarity: 'Unknown',
    marketPrice: 0, // Use 0 instead of null
  };
  
  return {
    id: item.id,
    collectionId: item.collection_id,
    cardId: item.card_id,
    card: cardData,
    quantity: item.quantity || 1,
    purchasePrice: item.purchase_price,
    purchaseDate: item.purchase_date,
    condition: item.condition,
    notes: item.notes,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
};

export async function getUserCollections(userId: string): Promise<Collection[]> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      userId: item.user_id,
      isPublic: item.is_public || false,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export async function getCollectionById(id: string): Promise<Collection | null> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      isPublic: data.is_public || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
}

export async function getCollectionCards(collectionId: string): Promise<CollectionCard[]> {
  try {
    const { data, error } = await supabase
      .from('collection_cards')
      .select('*')
      .eq('collection_id', collectionId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map the Supabase data to our CollectionCard type
    const collectionCards = await Promise.all(
      data.map((item: any) => mapSupabaseCollectionCardToCollectionCard(item))
    );
    
    return collectionCards;
  } catch (error) {
    console.error('Error fetching collection cards:', error);
    return [];
  }
}

export async function addCardToCollection(
  collectionId: string, 
  cardId: string, 
  purchaseInfo?: { 
    price?: number; 
    date?: string; 
    condition?: string; 
    notes?: string;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('collection_cards')
      .insert({
        collection_id: collectionId,
        card_id: cardId,
        quantity: 1, // Add default quantity
        purchase_price: purchaseInfo?.price,
        purchase_date: purchaseInfo?.date,
        condition: purchaseInfo?.condition,
        notes: purchaseInfo?.notes,
      });
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error adding card to collection:', error);
    return false;
  }
}

export async function removeCardFromCollection(collectionId: string, cardId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('collection_cards')
      .delete()
      .eq('collection_id', collectionId)
      .eq('card_id', cardId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error removing card from collection:', error);
    return false;
  }
}

export async function createCollection(name: string, description: string, isPublic: boolean = false): Promise<Collection | null> {
  try {
    // Get the current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('collections')
      .insert({
        name,
        description,
        is_public: isPublic,
        user_id: userId,
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      isPublic: data.is_public || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error creating collection:', error);
    return null;
  }
}

export async function getCollectionValue(collectionId: string): Promise<number> {
  try {
    const cards = await getCollectionCards(collectionId);
    return cards.reduce((total, card) => {
      // Handle null, undefined marketPrice, or undefined card
      const price = card.card && typeof card.card.marketPrice === 'number' ? card.card.marketPrice : 0;
      return total + (price * card.quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating collection value:', error);
    return 0;
  }
}

export async function updateCollection(id: string, updates: { name?: string; description?: string; isPublic?: boolean }): Promise<Collection | null> {
  try {
    const { data, error } = await supabase
      .from('collections')
      .update({
        name: updates.name,
        description: updates.description,
        is_public: updates.isPublic,
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      isPublic: data.is_public || false,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error('Error updating collection:', error);
    return null;
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting collection:', error);
    return false;
  }
} 