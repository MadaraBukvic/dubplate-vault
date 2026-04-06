import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GENRE_CATEGORIES } from "@/data/genres";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Music, DollarSign, BarChart3, Loader2, CreditCard, CheckCircle, AlertCircle } from "lucide-react";
import ProfileEditor from "@/components/ProfileEditor";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [bpm, setBpm] = useState("140");
  const [trackKey, setTrackKey] = useState("Am");
  const [genre, setGenre] = useState("Dubstep");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("45");
  const [exclusivity, setExclusivity] = useState<"single" | "limited">("single");
  const [maxCopies, setMaxCopies] = useState("1");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const previewInputRef = useRef<HTMLInputElement>(null);

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ["producer-tracks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("tracks")
        .select("*")
        .eq("producer_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: connectStatus, isLoading: connectLoading } = useQuery({
    queryKey: ["connect-status", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("connect-status");
      if (error) throw error;
      return data as {
        connected: boolean;
        details_submitted: boolean;
        payouts_enabled: boolean;
        available_balance?: number;
        pending_balance?: number;
        currency?: string;
      };
    },
    enabled: !!user && profile?.role === "producer",
  });

  const connectOnboarding = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("connect-onboarding");
      if (error) throw error;
      return data as { status: string; url?: string; accountId?: string };
    },
    onSuccess: (data) => {
      if (data.status === "onboarding" && data.url) {
        window.open(data.url, "_blank");
      } else if (data.status === "complete") {
        toast.success("Stripe account is already set up!");
        queryClient.invalidateQueries({ queryKey: ["connect-status"] });
      }
    },
    onError: (err: any) => toast.error(err.message),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!audioFile) throw new Error("Please select an audio file");

      const timestamp = Date.now();
      let storagePath: string | null = null;
      let previewPath: string | null = null;

      const fullPath = `${user.id}/${timestamp}-${audioFile.name}`;
      const { error: uploadErr } = await supabase.storage
        .from("track-files")
        .upload(fullPath, audioFile);
      if (uploadErr) throw new Error(`Upload failed: ${uploadErr.message}`);
      storagePath = fullPath;

      if (previewFile) {
        const prevPath = `${user.id}/${timestamp}-${previewFile.name}`;
        const { error: prevErr } = await supabase.storage
          .from("track-previews")
          .upload(prevPath, previewFile);
        if (prevErr) throw new Error(`Preview upload failed: ${prevErr.message}`);
        previewPath = prevPath;
      }

      const { error } = await supabase.from("tracks").insert({
        producer_id: user.id,
        title,
        bpm: parseInt(bpm),
        key: trackKey,
        genre,
        description: description || null,
        price_eur: parseFloat(price),
        exclusivity_type: exclusivity,
        max_copies: exclusivity === "single" ? 1 : parseInt(maxCopies),
        storage_path: storagePath,
        preview_path: previewPath,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Track uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["producer-tracks"] });
      setTitle("");
      setDescription("");
      setAudioFile(null);
      setPreviewFile(null);
      if (audioInputRef.current) audioInputRef.current.value = "";
      if (previewInputRef.current) previewInputRef.current.value = "";
    },
    onError: (err: any) => toast.error(err.message),
  });

  const totalSales = tracks.reduce((s, t) => s + (t.copies_sold || 0), 0);
  const totalEarnings = tracks.reduce((s, t) => s + (Number(t.price_eur) * (t.copies_sold || 0)), 0);

  if (user && profile && profile.role !== "producer") {
    navigate("/marketplace");
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 text-center">
          <p className="font-mono text-sm text-muted-foreground">Please sign in as a producer to access the dashboard.</p>
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
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Producer</p>
          <h1 className="mt-2 font-display text-4xl font-bold text-foreground">Dashboard</h1>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Tracks", value: tracks.length, icon: Music },
            { label: "Total Sales", value: totalSales, icon: BarChart3 },
            { label: "Earnings", value: `€${totalEarnings}`, icon: DollarSign },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-border bg-card p-6">
              <div className="flex items-center gap-3">
                <stat.icon className="h-4 w-4 text-primary" />
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{stat.label}</span>
              </div>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 rounded-lg border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h2 className="font-display text-lg font-semibold text-foreground">Payouts</h2>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground ml-auto">15% platform fee</span>
          </div>

          {connectLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="font-mono text-xs text-muted-foreground">Checking payout status...</span>
            </div>
          ) : connectStatus?.connected && connectStatus.details_submitted ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="font-mono text-xs text-foreground">Payouts {connectStatus.payouts_enabled ? "enabled" : "pending verification"}</span>
              </div>
              <div className="flex gap-6">
                <div>
                  <span className="font-mono text-2xl font-bold text-primary">
                    €{(connectStatus.available_balance ?? 0).toFixed(2)}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Available</span>
                </div>
                <div>
                  <span className="font-mono text-2xl font-bold text-foreground">
                    €{(connectStatus.pending_balance ?? 0).toFixed(2)}
                  </span>
                  <span className="block font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Pending</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <span className="font-mono text-xs text-muted-foreground">
                  Connect your Stripe account to receive payouts from track sales.
                </span>
              </div>
              <Button
                variant="gold"
                size="sm"
                onClick={() => connectOnboarding.mutate()}
                disabled={connectOnboarding.isPending}
              >
                {connectOnboarding.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting up...</>
                ) : (
                  <><CreditCard className="h-4 w-4 mr-2" /> Connect Stripe Account</>
                )}
              </Button>
            </div>
          )}
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Upload Track</h2>
            <form
              onSubmit={(e) => { e.preventDefault(); uploadMutation.mutate(); }}
              className="rounded-lg border border-border bg-card p-6 space-y-4"
            >
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="Track title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">BPM</Label>
                  <Input type="number" className="mt-1.5 bg-surface border-border font-mono text-sm" value={bpm} onChange={(e) => setBpm(e.target.value)} required />
                </div>
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Key</Label>
                  <Input className="mt-1.5 bg-surface border-border font-mono text-sm" value={trackKey} onChange={(e) => setTrackKey(e.target.value)} required />
                </div>
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Genre</Label>
                  <Input className="mt-1.5 bg-surface border-border font-mono text-sm" value={genre} onChange={(e) => setGenre(e.target.value)} required />
                </div>
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea className="mt-1.5 bg-surface border-border font-mono text-sm" rows={3} placeholder="Describe your track..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Price (EUR)</Label>
                  <Input type="number" className="mt-1.5 bg-surface border-border font-mono text-sm" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Exclusivity</Label>
                  <Select value={exclusivity} onValueChange={(v) => setExclusivity(v as "single" | "limited")}>
                    <SelectTrigger className="mt-1.5 bg-surface border-border font-mono text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single" className="font-mono text-xs">Single Buyer (1 of 1)</SelectItem>
                      <SelectItem value="limited" className="font-mono text-xs">Limited Copies</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {exclusivity === "limited" && (
                <div>
                  <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Max Copies</Label>
                  <Input type="number" className="mt-1.5 bg-surface border-border font-mono text-sm" value={maxCopies} onChange={(e) => setMaxCopies(e.target.value)} min="2" required />
                </div>
              )}
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <Upload className="inline h-3 w-3 mr-1" />Full Track (WAV/FLAC/MP3)
                </Label>
                <Input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/mpeg,audio/wav,audio/flac,audio/aiff"
                  className="mt-1.5 bg-surface border-border font-mono text-xs file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:font-mono file:text-xs"
                  onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                  required
                />
                {audioFile && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                  <Music className="inline h-3 w-3 mr-1" />Preview (30s, MP3/WAV — optional)
                </Label>
                <Input
                  ref={previewInputRef}
                  type="file"
                  accept="audio/mpeg,audio/wav"
                  className="mt-1.5 bg-surface border-border font-mono text-xs file:bg-primary/10 file:text-primary file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 file:font-mono file:text-xs"
                  onChange={(e) => setPreviewFile(e.target.files?.[0] || null)}
                />
                {previewFile && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{previewFile.name} ({(previewFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
              </div>
              <Button variant="gold" className="w-full text-sm" disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</> : <><Upload className="h-4 w-4 mr-2" /> Upload Track</>}
              </Button>
            </form>
          </div>

          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground mb-6">My Tracks</h2>
            {isLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 text-primary animate-spin" /></div>
            ) : tracks.length === 0 ? (
              <div className="py-12 text-center">
                <Music className="mx-auto h-8 w-8 text-muted-foreground mb-3" />
                <p className="font-mono text-xs text-muted-foreground">No tracks uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div key={track.id} className="rounded-lg border border-border bg-card p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-foreground">{track.title}</h3>
                      <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                        {track.bpm} BPM · {track.key} · {track.genre}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-semibold text-primary">€{track.price_eur}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">{track.copies_sold}/{track.max_copies} sold</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-12 max-w-2xl">
          <h2 className="font-display text-2xl font-semibold text-foreground mb-6">Profile</h2>
          <ProfileEditor />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
