import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Music } from "lucide-react";

const purchasedTracks = [
  {
    id: "1",
    title: "Warehouse Protocol",
    producer: "Nøir",
    bpm: 128,
    key: "Dm",
    genre: "Techno",
    purchaseDate: "2026-03-15",
    licenseToken: "a3f8c2e1-7b4d-4e9a-b5c6-1d2e3f4a5b6c",
    downloadsUsed: 1,
    maxDownloads: 3,
  },
  {
    id: "2",
    title: "Concrete Ritual",
    producer: "Sublow Hz",
    bpm: 138,
    key: "Fm",
    genre: "Garage",
    purchaseDate: "2026-03-20",
    licenseToken: "d7e8f9a0-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
    downloadsUsed: 0,
    maxDownloads: 3,
  },
];

const Library = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Your Collection</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">My Library</h1>
        </div>

        {purchasedTracks.length === 0 ? (
          <div className="py-20 text-center">
            <Music className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="font-mono text-sm text-muted-foreground">No tracks purchased yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {purchasedTracks.map((track) => (
              <div key={track.id} className="rounded-lg border border-border bg-card p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <h3 className="font-display text-xl font-semibold text-foreground">{track.title}</h3>
                    <p className="font-mono text-xs text-muted-foreground mt-1">by {track.producer}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[`${track.bpm} BPM`, track.key, track.genre].map((tag) => (
                        <span key={tag} className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <Button variant="gold" size="sm" className="text-xs gap-2">
                      <Download className="h-3 w-3" />
                      Download
                    </Button>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {track.downloadsUsed} of {track.maxDownloads} downloads used
                    </span>
                  </div>
                </div>

                {/* License info */}
                <div className="mt-4 rounded border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="h-3 w-3 text-gold" />
                    <span className="font-mono text-[10px] uppercase tracking-wider text-gold">License</span>
                  </div>
                  <div className="grid gap-1">
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Token: <span className="text-foreground">{track.licenseToken}</span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Purchased: <span className="text-foreground">{track.purchaseDate}</span>
                    </p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      Non-transferable · Live DJ sets only · No redistribution
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Library;
