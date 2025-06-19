import { supabase } from './supabaseClient';
import type { Collection, CardInCollection, PokemonCard } from '../types';

export async function getUserCollections(userId: string): Promise<Collection[]> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching collections:', error);
    return [];
  }

  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    userId: item.user_id,
    isPublic: item.is_public,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
}

export async function getPublicCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching public collections:', error);
    return [];
  }

  return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      userId: item.user_id,
    isPublic: item.is_public,
      createdAt: item.created_at,
    updatedAt: item.updated_at
    }));
}

export async function getPublicCollectionsWithUserDetails(): Promise<Collection[]> {
  // First, get all public collections
  const { data: collectionsData, error: collectionsError } = await supabase
    .from('collections')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (collectionsError) {
    console.error('Error fetching public collections:', collectionsError);
    return [];
  }

  if (!collectionsData || collectionsData.length === 0) {
    return [];
  }

  // Get unique user IDs from collections
  const userIds = [...new Set(collectionsData.map(item => item.user_id))];
  
  // Create a map of user ID to profile data for quick lookup
  const profilesMap: Record<string, { username: string; avatarUrl: string | null }> = {};
  
  // Get user profiles for the collections
  // Use direct fetch instead of Supabase client to avoid type issues
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/profiles?id=in.(${userIds.join(',')})&select=id,username,avatar_url`,
      {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      }
    );
    
    if (!response.ok) {
      console.error('Error fetching profiles:', response.statusText);
    } else {
      const profilesData = await response.json();
      
      // Create a map of user profiles
      profilesData.forEach((profile: any) => {
        profilesMap[profile.id] = {
          username: profile.username,
          avatarUrl: profile.avatar_url
        };
      });
    }
  } catch (error) {
    console.error('Error fetching profiles:', error);
  }

  // Combine the data
  return collectionsData.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    userId: item.user_id,
    isPublic: item.is_public,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    username: profilesMap[item.user_id]?.username || 'Unknown User',
    avatarUrl: profilesMap[item.user_id]?.avatarUrl || undefined
  }));
}

export async function getCollectionById(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('id', id)
      .single();
    
  if (error) {
    console.error('Error fetching collection:', error);
    return null;
  }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
    isPublic: data.is_public,
      createdAt: data.created_at,
    updatedAt: data.updated_at
    };
}

export async function getCollectionCards(collectionId: string): Promise<CardInCollection[]> {
  try {
    // First, get all collection cards
    const { data: collectionCardsData, error: collectionCardsError } = await supabase
      .from('collection_cards')
      .select('*')
      .eq('collection_id', collectionId);

    if (collectionCardsError) {
      console.error('Error fetching collection cards:', collectionCardsError);
      return [];
    }

    if (!collectionCardsData || collectionCardsData.length === 0) {
      return [];
    }

    // Extract all card IDs
    const cardIds = collectionCardsData.map(item => item.card_id);

    // Fetch the cards separately
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('*')
      .in('id', cardIds);
    
    if (cardsError) {
      console.error('Error fetching cards:', cardsError);
      return [];
    }

    // Create a map of card ID to card data for quick lookup
    const cardsMap: Record<string, PokemonCard> = {};
    cardsData?.forEach(card => {
      cardsMap[card.id] = {
        id: card.id,
        name: card.name,
        imageUrl: card.image_url,
        setName: card.set_name,
        setCode: card.set_code,
        cardNumber: card.card_number,
        rarity: card.rarity,
        artist: card.artist || undefined,
        releaseDate: card.release_date || undefined,
        marketPrice: card.market_price || undefined,
        types: card.types || undefined
      };
    });

    // Combine the data
    return collectionCardsData.map(item => ({
      id: item.id,
      cardId: item.card_id,
      collectionId: item.collection_id,
      purchasePrice: item.purchase_price || undefined,
      purchaseDate: item.purchase_date || undefined,
      condition: item.condition || undefined,
      notes: item.notes || undefined,
      quantity: item.quantity,
      card: cardsMap[item.card_id]
    }));
  } catch (error) {
    console.error('Error in getCollectionCards:', error);
    return [];
  }
}

export async function addCardToCollection(
  cardId: string,
  collectionId: string, 
  purchasePrice?: number,
  purchaseDate?: string,
  condition?: string,
  notes?: string
): Promise<boolean> {
    const { error } = await supabase
      .from('collection_cards')
      .insert({
      card_id: cardId,
        collection_id: collectionId,
      purchase_price: purchasePrice,
      purchase_date: purchaseDate,
      condition,
      notes
      });
    
  if (error) {
    console.error('Error adding card to collection:', error);
    return false;
  }

  return true;
}

export async function removeCardFromCollection(cardInCollectionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('collection_cards')
      .delete()
    .eq('id', cardInCollectionId);
    
  if (error) {
    console.error('Error removing card from collection:', error);
    return false;
  }

  return true;
}

export async function getCollectionValue(collectionId: string): Promise<number> {
  try {
    // First, get all collection cards for this collection
    const { data: collectionCardsData, error: collectionCardsError } = await supabase
      .from('collection_cards')
      .select('card_id, quantity')
      .eq('collection_id', collectionId);

    if (collectionCardsError) {
      console.error('Error fetching collection cards:', collectionCardsError);
      return 0;
    }

    if (!collectionCardsData || collectionCardsData.length === 0) {
      return 0;
    }

    // Extract all card IDs
    const cardIds = collectionCardsData.map(item => item.card_id);

    // Fetch the market prices separately
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('id, market_price')
      .in('id', cardIds);

    if (cardsError) {
      console.error('Error fetching card prices:', cardsError);
      return 0;
    }

    // Create a map of card ID to market price for quick lookup
    const pricesMap: Record<string, number> = {};
    cardsData?.forEach(card => {
      pricesMap[card.id] = card.market_price || 0;
    });

    // Calculate total value
    return collectionCardsData.reduce((total, item) => {
      const cardPrice = pricesMap[item.card_id] || 0;
      const quantity = item.quantity || 1;
      return total + (cardPrice * quantity);
    }, 0);
  } catch (error) {
    console.error('Error calculating collection value:', error);
    return 0;
  }
}

export async function createCollection(
  name: string,
  description?: string,
  isPublic: boolean = false
): Promise<Collection | null> {
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();

    if (!session || !session.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }
    
    const userId = session.user.id;

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
    
    if (error) {
      console.error('Error creating collection:', error);
      throw new Error(`Failed to create collection: ${error.message}`);
    }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
      isPublic: data.is_public,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error in createCollection:', error);
    throw error;
  }
}

export async function duplicateCollection(
  collectionId: string,
  newName?: string
): Promise<Collection | null> {
  try {
    // Get the current user
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.error('User not authenticated');
      throw new Error('User not authenticated');
    }

    // Get the source collection
    const sourceCollection = await getCollectionById(collectionId);
    if (!sourceCollection) {
      console.error('Source collection not found');
      throw new Error('Source collection not found');
    }

    // Create a new collection
    const duplicatedCollection = await createCollection(
      newName || `${sourceCollection.name} (Copy)`,
      sourceCollection.description || undefined,
      false // Always set new collection to private initially
    );

    if (!duplicatedCollection) {
      console.error('Failed to create duplicated collection');
      throw new Error('Failed to create duplicated collection');
    }

    // Get all cards from the source collection
    const sourceCards = await getCollectionCards(collectionId);

    // Add all cards to the new collection
    for (const card of sourceCards) {
      await addCardToCollection(
        card.cardId,
        duplicatedCollection.id,
        card.purchasePrice,
        card.purchaseDate,
        card.condition,
        card.notes
      );
    }

    return duplicatedCollection;
  } catch (error) {
    console.error('Error duplicating collection:', error);
    throw error;
  }
}

export async function toggleCollectionVisibility(
  id: string,
  makePublic: boolean
): Promise<Collection | null> {
  return updateCollection(id, { isPublic: makePublic });
}

export async function updateCollection(
  id: string,
  updates: Partial<Collection>
): Promise<Collection | null> {
  // Convert from our frontend model to the database schema
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;

    const { data, error } = await supabase
      .from('collections')
    .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();
    
  if (error) {
    console.error('Error updating collection:', error);
    return null;
  }
    
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      userId: data.user_id,
    isPublic: data.is_public,
      createdAt: data.created_at,
    updatedAt: data.updated_at
    };
}

export async function deleteCollection(id: string): Promise<boolean> {
  // First delete all cards in the collection
  const { error: cardsError } = await supabase
    .from('collection_cards')
    .delete()
    .eq('collection_id', id);

  if (cardsError) {
    console.error('Error deleting cards in collection:', cardsError);
    return false;
  }

  // Then delete the collection itself
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);
    
  if (error) {
    console.error('Error deleting collection:', error);
    return false;
  }

  return true;
}

// Fix the getCollectionCardPreviews function to use the correct database schema
export async function getCollectionCardPreviews(collectionId: string, limit: number = 9): Promise<any[]> {
  try {
    // First, get collection cards with limit
    const { data: collectionCardsData, error: collectionCardsError } = await supabase
      .from('collection_cards')
      .select('card_id')
      .eq('collection_id', collectionId)
      .limit(limit);

    if (collectionCardsError || !collectionCardsData || collectionCardsData.length === 0) {
      return [];
    }

    // Extract card IDs
    const cardIds = collectionCardsData.map(item => item.card_id);

    // Fetch the card data
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('id, name, image_url')
      .in('id', cardIds);

    if (cardsError) {
      console.error('Error fetching card previews:', cardsError);
      return [];
    }

    return cardsData || [];
  } catch (error) {
    console.error('Error in getCollectionCardPreviews:', error);
    return [];
  }
} 