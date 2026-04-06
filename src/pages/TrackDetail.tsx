import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import { mockTracks } from "@/data/mockTracks";
import { ArrowLeft, Shield, Loader2 } from "lucide-react";
import WaveformPlayer from "@/components/WaveformPlayer";
import TrackRatings from "@/components/TrackRatings";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import type { Track } from "@/components/TrackCard";

const TrackDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: dbTrack } = useQuery({
    queryKey: ["track-detail", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tracks")
        .select("*, profiles:producer_id (display_name)")
        .eq("id", id!)
        .single();
      if (error) return null;
      return {
        id: data.id,
        title: data.title,
        producer_id: data.producer_id,
        producer_name: (data.profiles as any)?.display_name || "Unknown",
        bpm: data.bpm,
        key: data.key,
        genre: data.genre,
        price_eur: Number(data.price_eur),
        exclusivity_type: data.exclusivity_type as "single" | "limited",
        max_copies: data.max_copies,
        copies_sold: data.copies_sold,
        description: data.description,
        preview_path: data.preview_path,
      } as Track;
    },
    enabled: !!id,
  });

  const mockTrack = mockTracks.find((t) => t.id === id);
  const track = dbTrack || mockTrack;

  if (!track) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p className="font-mono text-sm text-muted-foreground">Track not found.</p>
          <Link to="/marketplace" className="mt-4 inline-block">
            <Button variant="gold-outline" size="sm">Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const remaining = track.max_copies - track.copies_sold;
  const isSoldOut = remaining <= 0;

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please sign in to purchase tracks.");
      return;
    }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { trackId: track.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.url) window.open(data.url, "_blank");
    } catch (error: any) {
      toast.error(error.message || "Failed to create checkout session");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link to="/marketplace" className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          <div>
            <div className="rounded-lg border border-border bg-surface p-6">
              <WaveformPlayer
                title={`${track.title} — ${track.producer_name || "Unknown"}`}
                audioUrl={track.preview_path ? supabase.storage.from("track-previews").getPublicUrl(track.preview_path).data.publicUrl : undefined}
              />
            </div>
          </div>

          <div>
            <Badge className="font-mono text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20 mb-4">
              {isSoldOut ? "Sold Out" : track.exclusivity_type === "single" ? "1 of 1 · Exclusive" : `${remaining} of ${track.max_copies} remaining`}
            </Badge>

            <h1 className="font-display text-4xl font-bold text-foreground">{track.title}</h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">by {track.producer_name || "Unknown"}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[`${track.bpm} BPM`, track.key, track.genre].map((tag) => (
                <span key={tag} className="font-mono text-xs uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded border border-border">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-border bg-surface p-6">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-primary">€{track.price_eur}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">one-time payment</span>
              </div>

              <Button variant="gold" size="lg" className="mt-6 w-full text-sm" disabled={isSoldOut || isProcessing} onClick={handlePurchase}>
                {isProcessing ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Processing...</>
                ) : isSoldOut ? "Sold Out" : !user ? "Sign In to Purchase" : "Purchase Exclusive License"}
              </Button>

              <div className="mt-4 flex items-start gap-2">
                <Shield className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                  This purchase includes a unique license token. The track file will be watermarked with your identity. Redistribution is traceable.
                </p>
              </div>
            </div>
        </div>

        <TrackRatings trackId={track.id} />
      </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackDetail;
