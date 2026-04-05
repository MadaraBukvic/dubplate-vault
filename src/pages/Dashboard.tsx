import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Music, DollarSign, BarChart3 } from "lucide-react";
import { mockTracks } from "@/data/mockTracks";

const Dashboard = () => {
  const producerTracks = mockTracks.filter((t) => t.producer === "KRVN");
  const totalEarnings = producerTracks.reduce((sum, t) => sum + t.price * t.copiesSold, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="mb-8">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Producer</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Tracks", value: producerTracks.length, icon: Music },
            { label: "Total Sales", value: producerTracks.reduce((s, t) => s + t.copiesSold, 0), icon: BarChart3 },
            { label: "Earnings", value: `€${totalEarnings}`, icon: DollarSign },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <stat.icon className="h-4 w-4 text-gold" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Upload Form */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Upload Track</h2>
            <div className="rounded-lg border border-border bg-card p-6 space-y-4">
              <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-surface p-12 transition-colors hover:border-gold/30">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="font-mono text-xs text-muted-foreground">Drop MP3/WAV here (max 50MB)</p>
                </div>
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="Track title" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">BPM</Label>
                  <Input type="number" className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="140" />
                </div>
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Key</Label>
                  <Input className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="Am" />
                </div>
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Genre</Label>
                  <Input className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="Dubstep" />
                </div>
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea className="mt-1.5 bg-surface border-border font-mono text-sm" rows={3} placeholder="Describe your track..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Price (EUR)</Label>
                  <Input type="number" className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="45" />
                </div>
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Exclusivity</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5 bg-surface border-border font-mono text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single" className="font-mono text-xs">Single Buyer (1 of 1)</SelectItem>
                      <SelectItem value="limited" className="font-mono text-xs">Limited Copies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button variant="gold" className="w-full text-sm">Upload Track</Button>
            </div>
          </div>

          {/* My Tracks */}
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">My Tracks</h2>
            <div className="space-y-3">
              {producerTracks.map((track) => (
                <div key={track.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-sm font-semibold text-foreground">{track.title}</h3>
                    <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                      {track.bpm} BPM · {track.musicalKey} · {track.genre}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm font-semibold text-gold">€{track.price}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">
                      {track.copiesSold}/{track.maxCopies} sold
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
