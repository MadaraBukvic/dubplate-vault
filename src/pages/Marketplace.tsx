import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackCard from "@/components/TrackCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GENRE_CATEGORIES } from "@/data/genres";
import { Search, Loader2, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import type { Track } from "@/components/TrackCard";
import { Button } from "@/components/ui/button";

const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  .flatMap((k) => [`${k}m`, k]);

const Marketplace = () => {
  const [search, setSearch] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [sort, setSort] = useState("newest");
  const [keyFilter, setKeyFilter] = useState("all");
  const [exclusivity, setExclusivity] = useState("all");
  const [bpmRange, setBpmRange] = useState<[number, number]>([60, 200]);
  const [showFilters, setShowFilters] = useState(false);

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

  const filtered = useMemo(() => {
    let tracks = dbTracks;
    if (search) tracks = tracks.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()) || (t.producer_name || "").toLowerCase().includes(search.toLowerCase()));
    if (genres.length > 0) tracks = tracks.filter((t) => genres.includes(t.genre));
    if (keyFilter !== "all") tracks = tracks.filter((t) => t.key === keyFilter);
    if (exclusivity !== "all") tracks = tracks.filter((t) => t.exclusivity_type === exclusivity);
    tracks = tracks.filter((t) => t.bpm >= bpmRange[0] && t.bpm <= bpmRange[1]);
    if (sort === "price-asc") tracks = [...tracks].sort((a, b) => a.price_eur - b.price_eur);
    if (sort === "price-desc") tracks = [...tracks].sort((a, b) => b.price_eur - a.price_eur);
    if (sort === "bpm") tracks = [...tracks].sort((a, b) => a.bpm - b.bpm);
    return tracks;
  }, [search, genres, sort, keyFilter, exclusivity, bpmRange, dbTracks]);

  const activeFilterCount = [genres.length > 0, keyFilter !== "all", exclusivity !== "all", bpmRange[0] !== 60 || bpmRange[1] !== 200].filter(Boolean).length;

  const toggleGenre = (g: string) => {
    setGenres((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]));
  };

  const toggleCategory = (subs: string[]) => {
    const allSelected = subs.every((s) => genres.includes(s));
    setGenres((prev) =>
      allSelected
        ? prev.filter((g) => !subs.includes(g))
        : Array.from(new Set([...prev, ...subs])),
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Browse</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Marketplace</h1>
        </div>

        {/* Search + toggle */}
        <div className="mb-4 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search tracks or producers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 font-mono text-xs bg-surface border-border"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="font-mono text-xs gap-2"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters{activeFilterCount > 0 && ` (${activeFilterCount})`}
          </Button>
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

        {/* Filter panel */}
        {showFilters && (
          <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-lg border border-border bg-surface/50 p-4">
            {/* Genre */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Genres{genres.length > 0 && ` (${genres.length})`}
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-border bg-surface px-3 py-2 font-mono text-xs text-foreground"
                  >
                    <span className="truncate">
                      {genres.length === 0
                        ? "All Genres"
                        : `${genres.length} selected`}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-72 p-0 bg-popover border-border">
                  <div className="flex items-center justify-between border-b border-border px-3 py-2">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      {genres.length} selected
                    </span>
                    {genres.length > 0 && (
                      <button
                        onClick={() => setGenres([])}
                        className="font-mono text-[10px] uppercase tracking-wider text-primary hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <ScrollArea className="h-72">
                    <div className="p-2">
                      {Object.entries(GENRE_CATEGORIES).map(([cat, subs]) => {
                        const allSelected = subs.every((s) => genres.includes(s));
                        const someSelected = subs.some((s) => genres.includes(s));
                        return (
                          <div key={cat} className="mb-3">
                            <button
                              type="button"
                              onClick={() => toggleCategory(subs)}
                              className="mb-1 flex w-full items-center justify-between px-2 py-1 text-left"
                            >
                              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/80">
                                {cat}
                              </span>
                              <span className="font-mono text-[9px] text-primary">
                                {allSelected ? "Unselect all" : someSelected ? "Select all" : "Select all"}
                              </span>
                            </button>
                            <div className="space-y-0.5">
                              {subs.map((g) => {
                                const checked = genres.includes(g);
                                return (
                                  <label
                                    key={g}
                                    className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 hover:bg-accent"
                                  >
                                    <Checkbox
                                      checked={checked}
                                      onCheckedChange={() => toggleGenre(g)}
                                    />
                                    <span className="font-mono text-xs text-foreground">{g}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            </div>

            {/* Key */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Key</label>
              <Select value={keyFilter} onValueChange={setKeyFilter}>
                <SelectTrigger className="w-full font-mono text-xs bg-surface border-border">
                  <SelectValue placeholder="Key" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all" className="font-mono text-xs">All Keys</SelectItem>
                  {KEYS.map((k) => (
                    <SelectItem key={k} value={k} className="font-mono text-xs">{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Exclusivity */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Exclusivity</label>
              <Select value={exclusivity} onValueChange={setExclusivity}>
                <SelectTrigger className="w-full font-mono text-xs bg-surface border-border">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-mono text-xs">All</SelectItem>
                  <SelectItem value="single" className="font-mono text-xs">Single (1 copy)</SelectItem>
                  <SelectItem value="limited" className="font-mono text-xs">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* BPM Range */}
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                BPM: {bpmRange[0]} – {bpmRange[1]}
              </label>
              <div className="pt-2">
                <Slider
                  min={60}
                  max={200}
                  step={5}
                  value={bpmRange}
                  onValueChange={(v) => setBpmRange(v as [number, number])}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
        ) : (
          <>
            <p className="mb-4 font-mono text-xs text-muted-foreground">{filtered.length} track{filtered.length !== 1 ? "s" : ""}</p>
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
