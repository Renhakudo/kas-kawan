CREATE TABLE IF NOT EXISTS public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null default 'Dompet Utama',
  is_primary boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS wallet_id uuid references public.wallets(id);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own wallets" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wallets" ON public.wallets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wallets" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wallets" ON public.wallets
  FOR DELETE USING (auth.uid() = user_id);

-- Create a trigger to automatically create a default wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_wallet()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id, name, is_primary)
  VALUES (new.id, 'Dompet Utama', true);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on multiple runs
DROP TRIGGER IF EXISTS on_auth_user_created_wallet ON auth.users;

CREATE TRIGGER on_auth_user_created_wallet
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_wallet();

-- Backfill wallets for existing profiles/users
INSERT INTO public.wallets (user_id, name, is_primary)
SELECT id, 'Dompet Utama', true FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM public.wallets WHERE wallets.user_id = auth.users.id);

-- Update existing transactions to point to the user's default wallet
UPDATE public.transactions t
SET wallet_id = w.id
FROM public.wallets w
WHERE t.user_id = w.user_id AND t.wallet_id IS NULL;
