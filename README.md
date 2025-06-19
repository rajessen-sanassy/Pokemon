# 🎮 PokeBinder 🎴

A comprehensive web application for Pokémon card collectors to search, track, and manage their card collections. This guide will help you build your own version of PokeBinder from scratch!

![PokeBinder](https://pokemon-liart-phi.vercel.app/pokemon-banner.jpg)

## ✨ Features

- **🔍 Card Search**: Find any Pokémon card with smart autocomplete - from vintage Base Set Charizards to the latest expansions
- **📊 Price Tracking**: Watch your collection value grow with interactive price history charts
- **📚 Collection Management**: Create custom binders to organize your cards by set, type, or whatever system makes sense to you
- **💰 Investment Tracking**: Track purchase prices and see your profit/loss over time
- **🌐 Community Collections**: Discover and browse other collectors' public binders for inspiration
- **📱 Responsive Design**: Looks great on everything from phones to desktops
- **🔒 Secure Authentication**: Your collection data is safe with Supabase authentication

## 🚀 Live Demo

Check out the live application at [https://pokemon-liart-phi.vercel.app/](https://pokemon-liart-phi.vercel.app/)

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript - for a fast, type-safe UI
- **UI Library**: Chakra UI - for beautiful, accessible components
- **API Integration**: Pokémon TCG API - for comprehensive card data
- **Backend & Auth**: Supabase - for database, authentication, and storage
- **Hosting**: Vercel - for seamless deployment and hosting
- **Build Tool**: Vite - for lightning-fast development

## 📊 Database Schema Implementation

The application uses Supabase (PostgreSQL) with the following tables:

### 1. `users` (managed by Supabase Auth)
- Automatically created by Supabase Auth
- Contains authentication data

### 2. `profiles`
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 3. `cards`
```sql
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  original_id TEXT,
  name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  set_name TEXT,
  set_code TEXT,
  card_number TEXT,
  rarity TEXT,
  artist TEXT,
  release_date DATE,
  market_price DECIMAL(10,2),
  types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 4. `collections`
```sql
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### 5. `collection_cards`
```sql
CREATE TABLE collection_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id TEXT REFERENCES cards(id) NOT NULL,
  collection_id UUID REFERENCES collections(id) NOT NULL,
  purchase_price DECIMAL(10,2),
  purchase_date DATE,
  condition TEXT,
  notes TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
```

### Row-Level Security (RLS) Policies

For collections:
```sql
-- Allow users to see their own collections and public collections
CREATE POLICY "Users can view own collections and public ones" ON collections
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

-- Allow users to insert their own collections
CREATE POLICY "Users can insert own collections" ON collections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own collections
CREATE POLICY "Users can update own collections" ON collections
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own collections
CREATE POLICY "Users can delete own collections" ON collections
  FOR DELETE USING (auth.uid() = user_id);
```

Similar policies should be created for collection_cards and profiles tables.

## 🔌 API Integration Implementation

### Pokémon TCG API Setup

1. Sign up for an API key at [https://pokemontcg.io/](https://pokemontcg.io/)

2. Create a service for API calls (`src/services/pokemonCardApi.ts`):

```typescript
// Base URL and headers setup
const API_BASE_URL = 'https://api.pokemontcg.io/v2';
const API_KEY = import.meta.env.VITE_POKEMON_TCG_API_KEY; // Optional but recommended

// Function to search cards
export async function searchCards(query: string): Promise<PokemonCard[]> {
  try {
    const searchParams = new URLSearchParams({
      q: `name:"${query}*"`,
      orderBy: 'name',
      page: '1',
      pageSize: '20',
    });
    
    const response = await fetch(`${API_BASE_URL}/cards?${searchParams.toString()}`, {
      headers: API_KEY ? { 'X-Api-Key': API_KEY } : {}
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Map API cards to our format and save to database
    const cards = data.data.map(mapApiCardToCard);
    for (const card of cards) {
      await saveCardToDatabase(card);
    }
    
    return cards;
  } catch (error) {
    console.error('Error searching cards:', error);
    return [];
  }
}
```

### Card ID Encoding/Decoding

Important: The API uses IDs with hyphens, but for database safety we encode them:

```typescript
// Encode card ID for database storage
function encodeCardId(id: string): string {
  return id.replace(/-/g, '__');
}

// Decode card ID when needed
function decodeCardId(encodedId: string): string {
  return encodedId.replace(/__/g, '-');
}
```

### Saving Cards to Database

```typescript
export async function saveCardToDatabase(card: PokemonCard): Promise<boolean> {
  try {
    const encodedCardId = encodeCardId(card.id);
    
    // Check if card exists
    const { data: existingCard } = await supabase
      .from('cards')
      .select('id')
      .eq('id', encodedCardId)
      .maybeSingle();
    
    if (existingCard) {
      // Update existing card
      await supabase
        .from('cards')
        .update({
          name: card.name,
          image_url: card.imageUrl,
          // other fields...
          updated_at: new Date()
        })
        .eq('id', encodedCardId);
    } else {
      // Insert new card
      await supabase
        .from('cards')
        .insert({
          id: encodedCardId,
          original_id: card.id,
          name: card.name,
          image_url: card.imageUrl,
          // other fields...
        });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving card:', error);
    return false;
  }
}
```

## 📁 Component & Page Structure

### Key Components

1. **`<Layout />`** (`src/components/Layout.tsx`)
   - Main layout wrapper with navigation
   - Includes header, footer, and sidebar
   - Handles responsive layout adjustments

2. **`<CardItem />`** (`src/components/CardItem.tsx`)
   - Displays a single card with image and basic info
   - Handles click events for card selection
   - Supports hover effects and loading states

3. **`<CollectionCardItem />`** (`src/components/CollectionCardItem.tsx`)
   - Extends CardItem with collection-specific data
   - Shows purchase price, profit/loss, etc.

4. **`<PriceChart />`** (`src/components/PriceChart.tsx`)
   - Interactive chart for price history
   - Uses Chart.js or Recharts
   - Supports different time ranges

5. **`<SearchBar />`** (`src/components/SearchBar.tsx`)
   - Autocomplete search input
   - Debounced API calls
   - Search history

### Page Components

1. **`<HomePage />`** (`src/pages/HomePage.tsx`)
   - Landing page with featured cards
   - Quick access to collections
   - Recent activity

2. **`<SearchPage />`** (`src/pages/SearchPage.tsx`)
   - Advanced search interface
   - Filtering by set, type, rarity
   - Grid/list view toggle

3. **`<CardDetailPage />`** (`src/pages/CardDetailPage.tsx`)
   - Detailed card information
   - Price history chart
   - Add to collection button
   - Similar cards

4. **`<CollectionsPage />`** (`src/pages/CollectionsPage.tsx`)
   - List of user's collections
   - Create new collection
   - Collection stats

5. **`<CollectionDetailPage />`** (`src/pages/CollectionDetailPage.tsx`)
   - Cards in a specific collection
   - Collection value and stats
   - Grid/table view toggle
   - Sorting options

6. **`<ProfilePage />`** (`src/pages/ProfilePage.tsx`)
   - User profile information
   - Account settings
   - Collection summary

7. **`<CommunityCollectionsPage />`** (`src/pages/CommunityCollectionsPage.tsx`)
   - Browse public collections
   - Sort by popularity, value, etc.

## 🧠 Context & State Management

### Auth Context

```typescript
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext<{
  user: any | null;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  // other auth methods...
}>({
  user: null,
  signIn: async () => ({}),
  signOut: async () => {},
  // other defaults...
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and set the user
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Define auth methods
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Other auth methods...

  return (
    <AuthContext.Provider value={{ user, signIn, signOut /* other methods */ }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

## 🏗️ Project Structure

```
─ public/                # Static assets
  ├── favicon.ico        # Site favicon
  └── pokemon-banner.jpg # Banner image
─ src/                   # Source code
  ├── components/        # Reusable UI components
  │   ├── CardItem.tsx
  │   ├── CollectionCardItem.tsx
  │   ├── Layout.tsx
  │   ├── Navbar.tsx
  │   ├── PriceChart.tsx
  │   ├── ProtectedRoute.tsx
  │   └── SearchBar.tsx
  ├── context/           # React context providers
  │   ├── AuthContext.tsx
  │   └── ThemeContext.tsx
  ├── pages/             # Page components
  │   ├── HomePage.tsx
  │   ├── SearchPage.tsx
  │   ├── CardDetailPage.tsx
  │   ├── CollectionsPage.tsx
  │   ├── CollectionDetailPage.tsx
  │   ├── ProfilePage.tsx
  │   ├── LoginPage.tsx
  │   ├── RegisterPage.tsx
  │   └── CommunityCollectionsPage.tsx
  ├── services/          # API and service functions
  │   ├── supabaseClient.ts
  │   ├── pokemonCardApi.ts
  │   └── collectionService.ts
  ├── types/             # TypeScript type definitions
  │   ├── index.ts
  │   └── supabase.ts
  ├── hooks/             # Custom React hooks
  │   ├── useDebounce.ts
  │   └── useLocalStorage.ts
  ├── utils/             # Utility functions
  │   ├── formatters.ts
  │   └── validators.ts
  ├── App.tsx            # Main application component
  ├── main.tsx           # Application entry point
  └── index.css          # Global styles
─ supabase/              # Supabase configuration
  └── migrations/        # Database migrations
─ index.html             # HTML entry point
─ package.json           # Dependencies and scripts
─ tsconfig.json          # TypeScript configuration
─ vite.config.ts         # Vite configuration
─ vercel.json            # Vercel deployment configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- A Supabase account (free tier works great!)

### Step 1: Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the table creation scripts from the Database Schema section above
3. Set up authentication (Email/Password)
4. Create storage buckets if needed for user uploads
5. Get your API keys from the API settings page

### Step 2: Clone and Install

1. Clone the repository
```bash
git clone https://github.com/rajessen-sanassy/Pokemon.git
cd Pokemon
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file with the following variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_POKEMON_TCG_API_KEY=your_optional_pokemon_tcg_api_key
```

### Step 3: Run Development Server

```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

### Step 4: Implementing Key Features

#### Card Search Implementation

The search functionality combines local state, debounced API calls, and database caching:

```tsx
// src/pages/SearchPage.tsx (simplified)
import { useState, useEffect } from 'react';
import { useDebounce } from '../hooks/useDebounce';
import { searchCards } from '../services/pokemonCardApi';
import { CardItem } from '../components/CardItem';

export function SearchPage() {
  const [query, setQuery] = useState('');
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Debounce search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 500);
  
  useEffect(() => {
    if (debouncedQuery.length < 2) return;
    
    const fetchCards = async () => {
      setLoading(true);
      const results = await searchCards(debouncedQuery);
      setCards(results);
      setLoading(false);
    };
    
    fetchCards();
  }, [debouncedQuery]);
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for cards..."
      />
      
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="card-grid">
          {cards.map(card => (
            <CardItem key={card.id} card={card} />
          ))}
        </div>
      )}
    </div>
  );
}
```

#### Collection Management Implementation

Adding cards to collections requires careful handling of IDs and database synchronization:

```tsx
// src/pages/CardDetailPage.tsx (simplified)
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCardById } from '../services/pokemonCardApi';
import { getUserCollections, addCardToCollection } from '../services/collectionService';
import { useAuth } from '../context/AuthContext';

export function CardDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  
  useEffect(() => {
    // Fetch card details
    const loadCard = async () => {
      const cardData = await getCardById(id);
      setCard(cardData);
    };
    
    // Fetch user's collections
    const loadCollections = async () => {
      if (user) {
        const userCollections = await getUserCollections(user.id);
        setCollections(userCollections);
      }
    };
    
    loadCard();
    loadCollections();
  }, [id, user]);
  
  const handleAddToCollection = async () => {
    if (!selectedCollection) return;
    
    const success = await addCardToCollection(
      id,
      selectedCollection,
      purchasePrice ? parseFloat(purchasePrice) : undefined
    );
    
    if (success) {
      alert('Card added to collection!');
    } else {
      alert('Failed to add card to collection');
    }
  };
  
  // Render card details and add to collection form
  return (
    <div>
      {/* Card details display */}
      
      {user && (
        <div>
          <select 
            value={selectedCollection}
            onChange={(e) => setSelectedCollection(e.target.value)}
          >
            <option value="">Select a collection</option>
            {collections.map(collection => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
          
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="Purchase price (optional)"
          />
          
          <button onClick={handleAddToCollection}>
            Add to Collection
          </button>
        </div>
      )}
    </div>
  );
}
```

## 🏗️ Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory, ready to be deployed to Vercel or your hosting provider of choice.

### Deploying to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to link your project
4. Set environment variables in the Vercel dashboard

## 🧠 The Story Behind the App

I built PokeBinder for my friend who loves Pokémon cards but struggled to keep track of his growing collection. Spreadsheets were getting unwieldy, and he wanted a more visual way to organize and track the value of his cards over time. This project combines our shared love for Pokémon with modern web development.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Pokémon and Pokémon TCG are trademarks of Nintendo, Game Freak, and Creatures Inc.
- Thanks to the [Pokémon TCG API](https://pokemontcg.io/) for providing card data
- This project is for educational purposes only and is not affiliated with or endorsed by Nintendo or The Pokémon Company.
- Built with ❤️ by Pokémon fans, for Pokémon fans
