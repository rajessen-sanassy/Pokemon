import { supabase } from './supabaseClient';
import type { Collection, CardInCollection } from '../types';

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
    console.log('Fetching cards for collection:', collectionId);
    
    // First, get all collection cards
    const { data: collectionCardsData, error: collectionCardsError } = await supabase
      .from('collection_cards')
      .select('*')
      .eq('collection_id', collectionId);

    if (collectionCardsError) {
      console.error('Error fetching collection cards:', collectionCardsError);
      return [];
    }

    console.log('Collection cards found:', collectionCardsData?.length || 0);
    
    if (!collectionCardsData || collectionCardsData.length === 0) {
      return [];
    }

    // Import the pokemonCardApi module
    const { getCardById } = await import('./pokemonCardApi');
    
    // For each card in the collection, fetch its data using the API service
    // This will ensure we have the most up-to-date data and handle any ID encoding issues
    const result: CardInCollection[] = [];
    const failedCardIds: string[] = [];
    
    // Process cards in batches to avoid overwhelming the API
    const batchSize = 5;
    for (let i = 0; i < collectionCardsData.length; i += batchSize) {
      const batch = collectionCardsData.slice(i, i + batchSize);
      
      // Process each batch in parallel
      const batchPromises = batch.map(async (item) => {
        try {
          // Try to get the card data
          const cardData = await getCardById(item.card_id);
          
          if (cardData) {
            return {
              id: item.id,
              cardId: item.card_id,
              collectionId: item.collection_id,
              purchasePrice: item.purchase_price || undefined,
              purchaseDate: item.purchase_date || undefined,
              condition: item.condition || undefined,
              notes: item.notes || undefined,
              card: cardData
            };
          } else {
            failedCardIds.push(item.card_id);
            return null;
          }
        } catch (cardError) {
          console.error(`Error fetching card ${item.card_id}:`, cardError);
          failedCardIds.push(item.card_id);
          return null;
        }
      });
      
      // Wait for all cards in this batch to be processed
      const batchResults = await Promise.all(batchPromises);
      
      // Add successful results to our final array
      batchResults.forEach(item => {
        if (item) result.push(item);
      });
    }
    
    // Log any failed cards
    if (failedCardIds.length > 0) {
      console.warn(`Failed to fetch data for ${failedCardIds.length} cards:`, failedCardIds);
    }
    
    console.log('Final mapped collection cards:', result.length);
    return result;
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
    console.log('Adding card to collection:', { cardId, collectionId });
    
    try {
      // Validate inputs
      if (!cardId || !collectionId) {
        console.error('Missing required parameters:', { cardId, collectionId });
        return false;
      }
      
      // First, check if the card is already in the collection to avoid duplicates
      const { data: existingCards, error: checkError } = await supabase
        .from('collection_cards')
        .select('id')
        .eq('card_id', cardId)
        .eq('collection_id', collectionId);
        
      if (checkError) {
        console.error('Error checking for existing card in collection:', checkError);
      } else if (existingCards && existingCards.length > 0) {
        console.log('Card already exists in collection, skipping add');
        return true; // Return true because the card is already in the collection
      }
      
      // Make sure the card exists in our database by fetching it from the API
      // This will save it to the database if it doesn't exist
      const { getCardById } = await import('./pokemonCardApi');
      
      // Try up to 3 times to fetch the card data (with exponential backoff)
      let card = null;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (!card && attempts < maxAttempts) {
        try {
          attempts++;
          card = await getCardById(cardId);
          if (card) break;
          
          console.warn(`Attempt ${attempts}/${maxAttempts}: Failed to fetch card data for ID: ${cardId}`);
          
          // Wait with exponential backoff before retrying
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
          }
        } catch (fetchError) {
          console.error(`Attempt ${attempts}/${maxAttempts}: Error fetching card:`, fetchError);
          
          // Wait with exponential backoff before retrying
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts - 1)));
          }
        }
      }
      
      if (!card) {
        console.error(`Failed to fetch card data for ID: ${cardId} after ${maxAttempts} attempts`);
        return false;
      }
      
      console.log('Card data fetched successfully:', card.name);
      
      // Now add the card to the collection using the same ID format
      const { data, error } = await supabase
        .from('collection_cards')
        .insert({
          card_id: cardId,
          collection_id: collectionId,
          purchase_price: purchasePrice,
          purchase_date: purchaseDate,
          condition,
          notes,
          quantity: 1 // Ensure quantity is set
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding card to collection:', error);
        return false;
      }

      console.log('Card successfully added to collection:', data);
      return true;
    } catch (error) {
      console.error('Error in addCardToCollection:', error);
      return false;
    }
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
    console.log('Calculating value for collection:', collectionId);
    
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
      console.log('No cards found in collection');
      return 0;
    }

    console.log(`Found ${collectionCardsData.length} cards in collection`);

    // Import the pokemonCardApi module for ID encoding
    const { encodeCardId } = await import('./pokemonCardApi');
    
    // Extract all card IDs and encode them for database lookup
    const cardIds = collectionCardsData.map(item => item.card_id);
    const encodedCardIds = cardIds.map(id => encodeCardId(id));
    
    console.log('Encoded card IDs for lookup:', encodedCardIds);

    // Fetch the market prices separately
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('id, original_id, market_price')
      .in('id', encodedCardIds);

    if (cardsError) {
      console.error('Error fetching card prices:', cardsError);
      return 0;
    }

    console.log(`Found ${cardsData?.length || 0} cards with prices`);

    // Create a map of card ID to market price for quick lookup
    const pricesMap: Record<string, number> = {};
    cardsData?.forEach(card => {
      // Use original_id as the key to match with collection_cards
      if (card.original_id) {
        pricesMap[card.original_id] = card.market_price || 0;
      }
      // Also map by encoded ID
      pricesMap[card.id] = card.market_price || 0;
    });

    // Calculate total value
    const totalValue = collectionCardsData.reduce((total, item) => {
      const cardPrice = pricesMap[item.card_id] || 0;
      const quantity = item.quantity || 1;
      return total + (cardPrice * quantity);
    }, 0);
    
    console.log('Total collection value calculated:', totalValue);
    return totalValue;
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

// Get card previews for collection display
export async function getCollectionCardPreviews(collectionId: string, limit: number = 9): Promise<any[]> {
  try {
    console.log('Fetching card previews for collection:', collectionId);
    
    // First, get collection cards with limit
    const { data: collectionCardsData, error: collectionCardsError } = await supabase
      .from('collection_cards')
      .select('card_id')
      .eq('collection_id', collectionId)
      .limit(limit);

    if (collectionCardsError || !collectionCardsData || collectionCardsData.length === 0) {
      console.log('No cards found for previews');
      return [];
    }

    console.log(`Found ${collectionCardsData.length} cards for previews`);
    
    // Use the API service to get card data with proper ID handling
    const { getCardById } = await import('./pokemonCardApi');
    
    // Process cards in parallel
    const previewPromises = collectionCardsData.map(async (item) => {
      try {
        const cardData = await getCardById(item.card_id);
        if (cardData) {
          return {
            id: item.card_id,
            name: cardData.name,
            image_url: cardData.imageUrl
          };
        }
        return null;
      } catch (error) {
        console.error(`Error fetching preview for card ${item.card_id}:`, error);
        return null;
      }
    });
    
    // Wait for all preview data to be fetched
    const previewResults = await Promise.all(previewPromises);
    
    // Filter out any null results
    const validPreviews = previewResults.filter(preview => preview !== null);
    
    console.log(`Successfully fetched ${validPreviews.length} card previews`);
    return validPreviews;
  } catch (error) {
    console.error('Error in getCollectionCardPreviews:', error);
    return [];
  }
} 