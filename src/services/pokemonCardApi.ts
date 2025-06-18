import type { PokemonCard, CardPrice } from '../types';

// Pokemon TCG API base URL
const API_BASE_URL = 'https://api.pokemontcg.io/v2';

// Cache for autocomplete suggestions
const suggestionCache: Record<string, string[]> = {};
const pokemonNames: string[] = [];

// Function to convert Pokemon TCG API card to our PokemonCard type
const mapApiCardToCard = (apiCard: any): PokemonCard => {
  // Add the Pokemon name to our autocomplete list if it's not already there
  if (apiCard.name && !pokemonNames.includes(apiCard.name)) {
    pokemonNames.push(apiCard.name);
  }
  
  return {
    id: apiCard.id,
    name: apiCard.name,
    imageUrl: apiCard.images?.large || apiCard.images?.small || `https://via.placeholder.com/245x342.png?text=${encodeURIComponent(apiCard.name)}`,
    setName: apiCard.set?.name || 'Unknown Set',
    cardNumber: `${apiCard.number || '?'}/${apiCard.set?.printedTotal || apiCard.set?.total || '?'}`,
    rarity: apiCard.rarity || 'Unknown',
    marketPrice: apiCard.cardmarket?.prices?.averageSellPrice || 
                apiCard.cardmarket?.prices?.trendPrice || 
                apiCard.tcgplayer?.prices?.holofoil?.market || 
                apiCard.tcgplayer?.prices?.normal?.market ||
                null,
  };
};

// Mock stores for price history (since the real API doesn't provide historical data)
const mockStores = ['eBay', 'TCGPlayer', 'CardMarket', 'Troll and Toad', 'CoolStuffInc'];

// Common Pokemon names for autocomplete if API fails
const commonPokemonNames = [
  'Pikachu', 'Charizard', 'Bulbasaur', 'Squirtle', 'Mewtwo', 
  'Eevee', 'Jigglypuff', 'Snorlax', 'Gengar', 'Gyarados',
  'Alakazam', 'Dragonite', 'Machamp', 'Articuno', 'Zapdos',
  'Moltres', 'Mew', 'Lugia', 'Ho-Oh', 'Celebi',
  'Blaziken', 'Gardevoir', 'Lucario', 'Rayquaza', 'Garchomp'
];

/**
 * Get autocomplete suggestions for Pokemon names
 */
export async function getAutocompleteSuggestions(query: string): Promise<string[]> {
  if (query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  
  // Check cache first
  if (suggestionCache[lowerQuery]) {
    return suggestionCache[lowerQuery];
  }
  
  try {
    // Try to get suggestions from the API
    const searchParams = new URLSearchParams({
      q: `name:"${lowerQuery}*"`,
      orderBy: 'name',
      page: '1',
      pageSize: '10',
      select: 'name'
    });
    
    const response = await fetch(`${API_BASE_URL}/cards?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract unique names with proper type casting
    const names: string[] = Array.from(
      new Set(
        data.data.map((card: any) => card.name as string)
      )
    );
    
    // Cache the results
    suggestionCache[lowerQuery] = names;
    
    return names;
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    
    // Fallback to local filtering of common Pokemon names
    const filteredNames = commonPokemonNames.filter(name => 
      name.toLowerCase().includes(lowerQuery)
    );
    
    // Cache the results
    suggestionCache[lowerQuery] = filteredNames;
    
    return filteredNames;
  }
}

export async function searchCards(query: string): Promise<PokemonCard[]> {
  try {
    // Build the search query
    const searchParams = new URLSearchParams({
      q: `name:"${query}*"`,
      orderBy: 'name',
      page: '1',
      pageSize: '20',
    });
    
    // Fetch cards from Pokemon TCG API
    const response = await fetch(`${API_BASE_URL}/cards?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map API cards to our format
    return data.data.map(mapApiCardToCard);
  } catch (error) {
    console.error('Error searching cards:', error);
    
    // Fallback to mock data if API fails
    return Array(10).fill(null).map((_, index) => ({
      id: `card-${index}-${Date.now()}`,
      name: `${query} ${index + 1}`,
      imageUrl: `https://via.placeholder.com/245x342.png?text=${encodeURIComponent(query)}+${index + 1}`,
      setName: ['Base Set', 'Jungle', 'Fossil', 'Team Rocket', 'Gym Heroes'][Math.floor(Math.random() * 5)],
      cardNumber: `${Math.floor(Math.random() * 100)}/${Math.floor(Math.random() * 100) + 100}`,
      rarity: ['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Ultra Rare'][Math.floor(Math.random() * 5)],
      marketPrice: Math.floor(Math.random() * 1000) / 10,
    }));
  }
}

export async function getCardById(id: string): Promise<PokemonCard | null> {
  try {
    // Fetch card details from Pokemon TCG API
    const response = await fetch(`${API_BASE_URL}/cards/${id}`);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map API card to our format
    return mapApiCardToCard(data.data);
  } catch (error) {
    console.error('Error fetching card:', error);
    
    // Fallback to mock data if API fails
    return {
      id,
      name: `Pokemon Card ${id.substring(0, 5)}`,
      imageUrl: `https://via.placeholder.com/245x342.png?text=Card+${id.substring(0, 5)}`,
      setName: ['Base Set', 'Jungle', 'Fossil', 'Team Rocket', 'Gym Heroes'][Math.floor(Math.random() * 5)],
      cardNumber: `${Math.floor(Math.random() * 100)}/${Math.floor(Math.random() * 100) + 100}`,
      rarity: ['Common', 'Uncommon', 'Rare', 'Holo Rare', 'Ultra Rare'][Math.floor(Math.random() * 5)],
      marketPrice: Math.floor(Math.random() * 1000) / 10,
    };
  }
}

export async function getCardPrices(cardId: string): Promise<CardPrice[]> {
  try {
    // Fetch card details to get current price
    const card = await getCardById(cardId);
    const currentPrice = card?.marketPrice || 10;
    
    // Generate price history for the last 30 days (since the API doesn't provide historical data)
    const today = new Date();
    const prices: CardPrice[] = [];
    
    // Generate prices for different stores
    mockStores.forEach(store => {
      // Base price for this store (different for each store)
      const basePrice = currentPrice * (0.8 + Math.random() * 0.4); // 80% to 120% of current price
      
      // Generate price history for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Add some random fluctuation to the price
        const fluctuation = basePrice * (Math.random() * 0.2 - 0.1); // -10% to +10%
        const price = Math.max(0.99, basePrice + fluctuation);
        
        prices.push({
          id: `price-${store}-${i}-${cardId}`,
          cardId,
          store,
          price: parseFloat(price.toFixed(2)),
          date: date.toISOString().split('T')[0],
          condition: ['Mint', 'Near Mint', 'Excellent', 'Good', 'Poor'][Math.floor(Math.random() * 5)],
        });
      }
    });
    
    return prices;
  } catch (error) {
    console.error('Error getting card prices:', error);
    
    // Return empty array if there's an error
    return [];
  }
} 