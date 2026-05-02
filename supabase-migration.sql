-- =============================================================
-- Kas Kawan - Supabase SQL Migration
-- Run this in your Supabase Dashboard > SQL Editor
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: categories
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income', 'expense')),
  icon VARCHAR(10) DEFAULT '💰'
);

-- Seed default categories
INSERT INTO categories (name, type, icon) VALUES
  ('Penjualan', 'income', '🛒'),
  ('Jasa', 'income', '🔧'),
  ('Investasi', 'income', '📈'),
  ('Lainnya (Masuk)', 'income', '💰'),
  ('Bahan Baku', 'expense', '📦'),
  ('Gaji Karyawan', 'expense', '👥'),
  ('Sewa', 'expense', '🏠'),
  ('Listrik & Air', 'expense', '💡'),
  ('Transport', 'expense', '🚗'),
  ('Makanan & Minuman', 'expense', '🍜'),
  ('Peralatan', 'expense', '🔨'),
  ('Marketing', 'expense', '📢'),
  ('Lainnya (Keluar)', 'expense', '💸')
ON CONFLICT DO NOTHING;

-- Table: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
  amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  description TEXT,
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Categories are public read
CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  USING (true);

-- Create Supabase Storage bucket for receipts
-- NOTE: Run this separately in the Supabase Storage UI or via API
-- Bucket name: receipts (public: false)

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
