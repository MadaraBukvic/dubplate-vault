CREATE TABLE public.producer_follows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  follower_id UUID NOT NULL,
  producer_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (follower_id, producer_id)
);

ALTER TABLE public.producer_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Follows are viewable by everyone"
  ON public.producer_follows FOR SELECT
  USING (true);

CREATE POLICY "Users can follow as themselves"
  ON public.producer_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow themselves"
  ON public.producer_follows FOR DELETE
  USING (auth.uid() = follower_id);

CREATE INDEX idx_producer_follows_follower ON public.producer_follows(follower_id);
CREATE INDEX idx_producer_follows_producer ON public.producer_follows(producer_id);