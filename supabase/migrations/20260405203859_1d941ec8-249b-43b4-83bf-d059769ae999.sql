
ALTER TABLE public.profiles
ADD COLUMN bio TEXT DEFAULT '',
ADD COLUMN social_links JSONB DEFAULT '{}',
ADD COLUMN genre_specialization TEXT[] DEFAULT '{}';
