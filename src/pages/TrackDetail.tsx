import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useParams, Link } from "react-router-dom";
import { mockTracks } from "@/data/mockTracks";
import { ArrowLeft, Play, Shield } from "lucide-react";

const TrackDetail = () => {
  const { id } = useParams();
  const track = mockTracks.find((t) => t.id === id);

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

  const remaining = track.maxCopies - track.copiesSold;
  const isSoldOut = remaining <= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <Link to="/marketplace" className="mb-8 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors">
          <ArrowLeft className="h-3 w-3" /> Back
        </Link>

        <div className="mt-6 grid gap-12 lg:grid-cols-2">
          {/* Left - Preview */}
          <div>
            <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gold/30 bg-background">
                  <Play className="h-8 w-8 text-gold ml-1" />
                </div>
                <p className="font-mono text-xs text-muted-foreground">30s Preview</p>
              </div>
            </div>
          </div>

          {/* Right - Info */}
          <div>
            <Badge className="font-mono text-[10px] uppercase tracking-wider bg-gold/10 text-gold border-gold/20 mb-4">
              {isSoldOut ? "Sold Out" : track.exclusivityType === "single" ? "1 of 1 · Exclusive" : `${remaining} of ${track.maxCopies} remaining`}
            </Badge>

            <h1 className="font-display text-4xl font-bold text-foreground">{track.title}</h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">by {track.producer}</p>

            <div className="mt-6 flex flex-wrap gap-3">
              {[`${track.bpm} BPM`, track.musicalKey, track.genre].map((tag) => (
                <span key={tag} className="font-mono text-xs uppercase tracking-wider text-muted-foreground bg-muted px-3 py-1.5 rounded border border-border">
                  {tag}
                </span>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-border bg-surface p-6">
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-bold text-gold">€{track.price}</span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">one-time payment</span>
              </div>

              <Button
                variant="gold"
                size="lg"
                className="mt-6 w-full text-sm"
                disabled={isSoldOut}
              >
                {isSoldOut ? "Sold Out" : "Purchase Exclusive License"}
              </Button>

              <div className="mt-4 flex items-start gap-2">
                <Shield className="mt-0.5 h-3 w-3 shrink-0 text-gold" />
                <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                  This purchase includes a unique license token. The track file will be watermarked with your identity. Redistribution is traceable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TrackDetail;
