import { supabase } from './supabaseClient';
import { getCardById } from './pokemonCardApi';

/**
 * Syncs all cards in collection_cards table with the cards table
 * This ensures that all cards referenced in collections exist in the cards table
 */
export async function syncCollectionCards(): Promise<{success: boolean, synced: number, failed: number}> {
  try {
    // Get all unique card_ids from collection_cards
    const { data: cardIds, error: fetchError } = await supabase
      .from('collection_cards')
      .select('card_id')
      .order('card_id');
    
    if (fetchError) {
      console.error('Error fetching card IDs:', fetchError);
      return { success: false, synced: 0, failed: 0 };
    }
    
    if (!cardIds || cardIds.length === 0) {
      console.log('No cards to sync');
      return { success: true, synced: 0, failed: 0 };
    }
    
    // Get unique card IDs
    const uniqueCardIds = Array.from(new Set(cardIds.map(item => item.card_id)));
    console.log(`Found ${uniqueCardIds.length} unique cards to sync`);
    
    let synced = 0;
    let failed = 0;
    
    // Sync each card
    for (const cardId of uniqueCardIds) {
      try {
        // This will fetch the card from the API and save it to the database
        const card = await getCardById(cardId);
        if (card) {
          synced++;
          console.log(`Synced card: ${card.name} (${cardId})`);
        } else {
          failed++;
          console.error(`Failed to sync card: ${cardId}`);
        }
      } catch (error) {
        failed++;
        console.error(`Error syncing card ${cardId}:`, error);
      }
    }
    
    return { success: true, synced, failed };
  } catch (error) {
    console.error('Error in syncCollectionCards:', error);
    return { success: false, synced: 0, failed: 0 };
  }
} 