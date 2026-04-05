import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Download, FileText, Music, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

const Library = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: purchases = [], isLoading } = useQuery({
    queryKey: ["my-purchases", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("purchases")
        .select(`*, tracks (id, title, bpm, key, genre, producer_id, profiles:producer_id (display_name)), licenses (terms_text, signed_at)`)
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p className="font-mono text-sm text-muted-foreground">Please sign in to view your library.</p>
          <Button variant="gold-outline" size="sm" className="mt-4" onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Your Collection</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">My Library</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 text-primary animate-spin" /></div>
        ) : purchases.length === 0 ? (
          <div className="py-20 text-center">
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-mono text-sm text-muted-foreground">No tracks purchased yet.</p>
            <Button variant="gold-outline" size="sm" className="mt-4" onClick={() => navigate("/marketplace")}>Browse Marketplace</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {purchases.map((purchase) => {
              const track = purchase.tracks as any;
              const license = Array.isArray(purchase.licenses) ? purchase.licenses[0] : purchase.licenses;
              const producerName = track?.profiles?.display_name || "Unknown";

              return (
                <div key={purchase.id} className="rounded-lg border border-border bg-card p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold text-foreground">{track?.title || "Unknown Track"}</h3>
                      <p className="font-mono text-xs text-muted-foreground mt-1">by {producerName}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {[`${track?.bpm} BPM`, track?.key, track?.genre].filter(Boolean).map((tag) => (
                          <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <Button variant="gold" size="sm" className="text-xs gap-2">
                        <Download className="h-3 w-3" />Download
                      </Button>
                      <span className="font-mono text-[10px] text-muted-foreground">{purchase.download_count} of 3 downloads used</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded border border-border bg-surface p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-3 w-3 text-primary" />
                      <span className="font-mono text-[10px] uppercase tracking-wider text-primary">License</span>
                    </div>
                    <div className="grid gap-1">
                      <p className="font-mono text-[10px] text-muted-foreground">Token: <span className="text-foreground">{purchase.license_token}</span></p>
                      <p className="font-mono text-[10px] text-muted-foreground">Purchased: <span className="text-foreground">{new Date(purchase.created_at).toLocaleDateString()}</span></p>
                      <p className="font-mono text-[10px] text-muted-foreground">{license?.terms_text || "Non-transferable · Live DJ sets only · No redistribution"}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Library;
