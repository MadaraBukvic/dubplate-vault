
CREATE TABLE public.track_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_id UUID NOT NULL REFERENCES public.tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (track_id, user_id),
  CONSTRAINT rating_range CHECK (rating >= 1 AND rating <= 5)
);

ALTER TABLE public.track_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are viewable by everyone"
ON public.track_ratings FOR SELECT USING (true);

CREATE POLICY "Buyers can rate purchased tracks"
ON public.track_ratings FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.purchases
    WHERE purchases.track_id = track_ratings.track_id
    AND purchases.buyer_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own ratings"
ON public.track_ratings FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ratings"
ON public.track_ratings FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_track_ratings_updated_at
BEFORE UPDATE ON public.track_ratings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
