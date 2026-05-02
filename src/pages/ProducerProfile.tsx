import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackCard from "@/components/TrackCard";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Music, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import FollowButton from "@/components/FollowButton";

const SOCIAL_ICONS: Record<string, string> = {
  instagram: "Instagram",
  soundcloud: "SoundCloud",
  spotify: "Spotify",
  twitter: "X / Twitter",
  bandcamp: "Bandcamp",
  website: "Website",
};

const ProducerProfile = () => {
  const { id } = useParams<{ id: string }>();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["producer-profile", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", id!)
        .eq("role", "producer")
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: tracks, isLoading: tracksLoading } = useQuery({
    queryKey: ["producer-tracks", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("producer_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const isLoading = profileLoading || tracksLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <Music className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Producer not found</h2>
          <p className="text-muted-foreground font-mono text-sm">This profile doesn't exist or isn't a producer.</p>
          <Link to="/marketplace" className="mt-6 text-primary hover:underline font-mono text-sm">
            ← Back to Marketplace
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const socialLinks = (profile.social_links as Record<string, string>) || {};
  const genres = (profile.genre_specialization as string[]) || [];
  const totalSold = tracks?.reduce((sum, t) => sum + t.copies_sold, 0) || 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="mb-12 flex flex-col md:flex-row gap-8 items-start">
          <div className="h-28 w-28 shrink-0 rounded-lg border-2 border-primary/30 bg-surface flex items-center justify-center overflow-hidden">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.display_name} className="h-full w-full object-cover" />
            ) : (
              <Music className="h-10 w-10 text-primary/50" />
            )}
          </div>

          <div className="flex-1">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {profile.display_name}
            </h1>

            {genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {genres.map((g) => (
                  <Badge key={g} variant="outline" className="font-mono text-[10px] uppercase tracking-wider border-primary/20 text-primary">
                    {g}
                  </Badge>
                ))}
              </div>
            )}

            {profile.bio && (
              <p className="text-muted-foreground font-mono text-sm leading-relaxed max-w-2xl mb-4">
                {profile.bio}
              </p>
            )}

            {Object.keys(socialLinks).length > 0 && (
              <div className="flex flex-wrap gap-3">
                {Object.entries(socialLinks).map(([platform, url]) => (
                  url && (
                    <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors">
                      <ExternalLink className="h-3 w-3" />
                      {SOCIAL_ICONS[platform] || platform}
                    </a>
                  )
                ))}
              </div>
            )}

            <div className="mt-6 flex gap-6">
              <div>
                <span className="font-mono text-2xl font-bold text-primary">{tracks?.length || 0}</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Tracks</span>
              </div>
              <div>
                <span className="font-mono text-2xl font-bold text-primary">{totalSold}</span>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Sold</span>
              </div>
            </div>

            <div className="mt-6">
              <FollowButton producerId={id!} />
            </div>
          </div>
        </div>

        <h2 className="font-display text-xl font-semibold text-foreground mb-6 border-b border-border pb-3">Tracks</h2>

        {tracks && tracks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tracks.map((t) => (
              <TrackCard key={t.id} track={{ ...t, producer_name: profile.display_name }} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground font-mono text-sm py-12">No tracks yet.</p>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ProducerProfile;
