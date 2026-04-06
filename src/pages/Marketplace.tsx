import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackCard from "@/components/TrackCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GENRE_CATEGORIES } from "@/data/genres";
import { Search, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Track } from "@/components/TrackCard";

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("all");
  const [sort, setSort] = useState("newest");

  const { data: dbTracks = [], isLoading } = useQuery({
    queryKey: ["marketplace-tracks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*, profiles:producer_id (display_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data.map((t): Track => ({
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
  });

  const genres = useMemo(() => {
    const g = new Set(dbTracks.map((t) => t.genre));
    return Array.from(g);
  }, [dbTracks]);

  const filtered = useMemo(() => {
    let tracks = dbTracks;
    if (search) tracks = tracks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || (t.producer_name || "").toLowerCase().includes(search.toLowerCase()));
    if (genre !== "all") tracks = tracks.filter((t) => t.genre === genre);
    if (sort === "price-asc") tracks = [...tracks].sort((a, b) => a.price_eur - b.price_eur);
    if (sort === "price-desc") tracks = [...tracks].sort((a, b) => b.price_eur - a.price_eur);
    if (sort === "bpm") tracks = [...tracks].sort((a, b) => a.bpm - b.bpm);
    return tracks;
  }, [search, genre, sort, dbTracks]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Browse</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Marketplace</h1>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracks or producers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 font-mono text-xs bg-surface border-border"
            />
          </div>
          <Select value={genre} onValueChange={setGenre}>
            <SelectTrigger className="w-40 font-mono text-xs bg-surface border-border">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-mono text-xs">All Genres</SelectItem>
              {genres.map((g) => (
                <SelectItem key={g} value={g} className="font-mono text-xs">{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-40 font-mono text-xs bg-surface border-border">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest" className="font-mono text-xs">Newest</SelectItem>
              <SelectItem value="price-asc" className="font-mono text-xs">Price ↑</SelectItem>
              <SelectItem value="price-desc" className="font-mono text-xs">Price ↓</SelectItem>
              <SelectItem value="bpm" className="font-mono text-xs">BPM</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
            {filtered.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-mono text-sm text-muted-foreground">No tracks found.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Marketplace;
