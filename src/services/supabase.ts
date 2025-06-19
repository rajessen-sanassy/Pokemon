import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Remove any trailing % from the key if present (common copy-paste error)
const cleanedAnonKey = supabaseAnonKey.endsWith('%') 
  ? supabaseAnonKey.slice(0, -1) 
  : supabaseAnonKey;

export const supabase = createClient<Database>(
  supabaseUrl, 
  cleanedAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      storageKey: 'pokemon-card-collector-auth',
    }
  }
);

// Helper functions for collections
export const getCollections = async (userId: string) => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data || [];
};

export const getCollection = async (id: string) => {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data;
};

export const createCollection = async (name: string, description: string | null, isPublic: boolean) => {
  const { data, error } = await supabase
    .from('collections')
    .insert({
      name,
      description,
      is_public: isPublic,
      user_id: supabase.auth.getUser().then(({ data }) => data.user?.id) as unknown as string,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCollection = async (id: string, updates: { 
  name?: string; 
  description?: string | null; 
  is_public?: boolean;
}) => {
  const { data, error } = await supabase
    .from('collections')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const deleteCollection = async (id: string) => {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
};

// Helper functions for collection cards
export const getCollectionCards = async (collectionId: string) => {
  const { data, error } = await supabase
    .from('collection_cards')
    .select('*')
    .eq('collection_id', collectionId);
  
  if (error) throw error;
  return data || [];
};

export const addCardToCollection = async (
  collectionId: string, 
  cardId: string, 
  quantity: number = 1,
  purchasePrice?: number,
  purchaseDate?: string,
  condition?: string,
  notes?: string
) => {
  const { data, error } = await supabase
    .from('collection_cards')
    .insert({
      collection_id: collectionId,
      card_id: cardId,
      quantity,
      purchase_price: purchasePrice,
      purchase_date: purchaseDate,
      condition,
      notes
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const updateCollectionCard = async (
  id: string, 
  updates: {
    quantity?: number;
    purchase_price?: number | null;
    purchase_date?: string | null;
    condition?: string | null;
    notes?: string | null;
  }
) => {
  const { data, error } = await supabase
    .from('collection_cards')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const removeCardFromCollection = async (id: string) => {
  const { error } = await supabase
    .from('collection_cards')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
  return true;
}; 