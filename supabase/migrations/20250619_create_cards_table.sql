-- Create cards table with original_id column
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  original_id TEXT NOT NULL,
  name TEXT NOT NULL,
  image_url TEXT,
  set_name TEXT,
  set_code TEXT,
  card_number TEXT,
  rarity TEXT,
  artist TEXT,
  release_date TEXT,
  market_price NUMERIC,
  types TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;

-- Allow public access to cards
CREATE POLICY "Cards are viewable by everyone" ON cards
  FOR SELECT USING (true);

-- Allow authenticated users to insert cards
CREATE POLICY "Authenticated users can insert cards" ON cards
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update cards
CREATE POLICY "Authenticated users can update cards" ON cards
  FOR UPDATE USING (auth.role() = 'authenticated');
