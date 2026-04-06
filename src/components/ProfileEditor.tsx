import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, User, X, Plus } from "lucide-react";

import { GENRE_CATEGORIES } from "@/data/genres";

const ProfileEditor = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [bio, setBio] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [genres, setGenres] = useState<string[]>([]);
  const [customGenre, setCustomGenre] = useState("");
  const [soundcloud, setSoundcloud] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [website, setWebsite] = useState("");

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile-edit", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profileData) {
      setDisplayName(profileData.display_name || "");
      setBio(profileData.bio || "");
      setGenres(profileData.genre_specialization || []);
      const links = (profileData.social_links as Record<string, string>) || {};
      setSoundcloud(links.soundcloud || "");
      setInstagram(links.instagram || "");
      setTwitter(links.twitter || "");
      setWebsite(links.website || "");
    }
  }, [profileData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName,
          bio,
          genre_specialization: genres,
          social_links: { soundcloud, instagram, twitter, website },
        })
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries({ queryKey: ["profile-edit"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  const addGenre = (genre: string) => {
    if (genre && !genres.includes(genre)) {
      setGenres([...genres, genre]);
    }
    setCustomGenre("");
  };

  const removeGenre = (genre: string) => {
    setGenres(genres.filter((g) => g !== genre));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 space-y-5">
      <div className="flex items-center gap-3 mb-2">
        <User className="h-5 w-5 text-primary" />
        <h2 className="font-display text-lg font-semibold text-foreground">Edit Profile</h2>
      </div>

      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
        <Input
          className="mt-1.5 bg-surface border-border font-mono text-sm"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>

      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Bio</Label>
        <Textarea
          className="mt-1.5 bg-surface border-border font-mono text-sm"
          rows={4}
          placeholder="Tell DJs about your sound..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      <div>
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Genre Specialization</Label>
        <div className="flex flex-wrap gap-2 mb-3">
          {genres.map((g) => (
            <Badge key={g} variant="secondary" className="gap-1 font-mono text-xs">
              {g}
              <button onClick={() => removeGenre(g)} className="ml-1 hover:text-primary">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="space-y-3 mb-3">
          {Object.entries(GENRE_CATEGORIES).map(([category, subgenres]) => {
            const available = subgenres.filter((g) => !genres.includes(g));
            if (available.length === 0) return null;
            return (
              <div key={category}>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground/60 block mb-1.5">{category}</span>
                <div className="flex flex-wrap gap-1.5">
                  {available.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => addGenre(g)}
                      className="rounded border border-border bg-surface px-2 py-1 font-mono text-[10px] text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      + {g}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Input
            className="bg-surface border-border font-mono text-xs"
            placeholder="Custom genre..."
            value={customGenre}
            onChange={(e) => setCustomGenre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addGenre(customGenre))}
          />
          <Button type="button" variant="outline" size="sm" onClick={() => addGenre(customGenre)} disabled={!customGenre}>
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Social Links</Label>
        {[
          { label: "SoundCloud", value: soundcloud, set: setSoundcloud, placeholder: "https://soundcloud.com/..." },
          { label: "Instagram", value: instagram, set: setInstagram, placeholder: "https://instagram.com/..." },
          { label: "Twitter / X", value: twitter, set: setTwitter, placeholder: "https://x.com/..." },
          { label: "Website", value: website, set: setWebsite, placeholder: "https://..." },
        ].map((link) => (
          <div key={link.label}>
            <span className="font-mono text-[10px] text-muted-foreground">{link.label}</span>
            <Input
              className="mt-1 bg-surface border-border font-mono text-xs"
              placeholder={link.placeholder}
              value={link.value}
              onChange={(e) => link.set(e.target.value)}
            />
          </div>
        ))}
      </div>

      <Button
        variant="default"
        className="w-full font-mono text-xs"
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
      >
        {saveMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Profile"}
      </Button>
    </div>
  );
};

export default ProfileEditor;
