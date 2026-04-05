
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('producer', 'dj');

-- Create exclusivity type enum
CREATE TYPE public.exclusivity_type AS ENUM ('single', 'limited');

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  role app_role NOT NULL DEFAULT 'dj',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'dj')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tracks table
CREATE TABLE public.tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  producer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  bpm INTEGER NOT NULL DEFAULT 120,
  key TEXT NOT NULL DEFAULT 'Am',
  genre TEXT NOT NULL DEFAULT 'Electronic',
  description TEXT,
  price_eur NUMERIC(10,2) NOT NULL DEFAULT 0,
  exclusivity_type exclusivity_type NOT NULL DEFAULT 'single',
  max_copies INTEGER NOT NULL DEFAULT 1,
  copies_sold INTEGER NOT NULL DEFAULT 0,
  storage_path TEXT,
  preview_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tracks are viewable by everyone"
  ON public.tracks FOR SELECT USING (true);

CREATE POLICY "Producers can insert their own tracks"
  ON public.tracks FOR INSERT WITH CHECK (auth.uid() = producer_id);

CREATE POLICY "Producers can update their own tracks"
  ON public.tracks FOR UPDATE USING (auth.uid() = producer_id);

CREATE POLICY "Producers can delete their own tracks"
  ON public.tracks FOR DELETE USING (auth.uid() = producer_id);

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON public.tracks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Purchases table
CREATE TABLE public.purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  stripe_payment_id TEXT,
  license_token UUID NOT NULL DEFAULT gen_random_uuid(),
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers can view their own purchases"
  ON public.purchases FOR SELECT USING (auth.uid() = buyer_id);

CREATE POLICY "Authenticated users can create purchases"
  ON public.purchases FOR INSERT WITH CHECK (auth.uid() = buyer_id);

-- Licenses table
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  terms_text TEXT NOT NULL DEFAULT 'Non-transferable license for live DJ sets only. No redistribution, no sublicensing.',
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own licenses"
  ON public.licenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = licenses.purchase_id
      AND purchases.buyer_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = licenses.purchase_id
      AND purchases.buyer_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_tracks_producer ON public.tracks(producer_id);
CREATE INDEX idx_tracks_genre ON public.tracks(genre);
CREATE INDEX idx_purchases_buyer ON public.purchases(buyer_id);
CREATE INDEX idx_purchases_track ON public.purchases(track_id);
