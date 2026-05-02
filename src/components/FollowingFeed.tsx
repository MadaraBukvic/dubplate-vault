import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import TrackCard, { type Track } from "@/components/TrackCard";
import { Loader2, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const FollowingFeed = () => {
  const { user } = useAuth();

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["following-feed", user?.id],
    queryFn: async () => {
      if (!user) return [] as Track[];
      const { data: follows, error: fErr } = await supabase
        .from("producer_follows")
        .select("producer_id")
        .eq("follower_id", user.id);
      if (fErr) throw fErr;
      const ids = (follows ?? []).map((f) => f.producer_id);
      if (ids.length === 0) return [] as Track[];
      const { data, error } = await supabase
        .from("tracks")
        .select("*, profiles:producer_id (display_name)")
        .in("producer_id", ids)
        .order("created_at", { ascending: false })
        .limit(24);
      if (error) throw error;
      return (data ?? []).map((t): Track => ({
        id: t.id,
        title: t.title,
        producer_id: t.producer_id,
        producer_name: (t.profiles as any)?.display_name || "Unknown",
        bpm: t.bpm,
        key: t.key,
        genre: t.genre,
        price_eur: Number(t.price_eur),
        exclusivity_type: t.exclusivity_type as "single" | "limited",
        max_copies: t.max_copies,
        copies_sold: t.copies_sold,
        description: t.description,
        preview_path: t.preview_path,
        created_at: t.created_at,
      }));
    },
    enabled: !!user,
  });

  if (!user) return null;

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">Following</p>
          <h2 className="mt-1 font-display text-2xl font-semibold text-foreground">New from your producers</h2>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : tracks.length === 0 ? (
        <div className="rounded-lg border border-border bg-surface/50 py-12 text-center">
          <Heart className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-mono text-sm text-muted-foreground">
            You're not following any producers yet.
          </p>
          <Link
            to="/marketplace"
            className="mt-3 inline-block font-mono text-xs text-primary hover:underline"
          >
            → Discover producers in the marketplace
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((t) => (
            <TrackCard key={t.id} track={t} />
          ))}
        </div>
      )}
    </section>
  );
};

export default FollowingFeed;