
-- Create private bucket for full tracks
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('track-files', 'track-files', false, 52428800, ARRAY['audio/mpeg', 'audio/wav', 'audio/flac', 'audio/aiff', 'audio/x-aiff']);

-- Create public bucket for previews
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('track-previews', 'track-previews', true, 10485760, ARRAY['audio/mpeg', 'audio/wav']);

-- RLS policies for track-files (private)
CREATE POLICY "Producers can upload track files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'track-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Producers can view their own track files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'track-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Producers can delete their own track files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'track-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Buyers can download purchased track files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'track-files'
  AND EXISTS (
    SELECT 1 FROM public.purchases p
    JOIN public.tracks t ON t.id = p.track_id
    WHERE p.buyer_id = auth.uid()
    AND t.storage_path = name
  )
);

-- RLS policies for track-previews (public)
CREATE POLICY "Anyone can view track previews"
ON storage.objects FOR SELECT
USING (bucket_id = 'track-previews');

CREATE POLICY "Producers can upload track previews"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'track-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Producers can delete their own previews"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'track-previews'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
