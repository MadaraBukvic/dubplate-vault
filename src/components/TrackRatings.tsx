import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

const StarRating = ({ value, onChange, readonly = false }: { value: number; onChange?: (v: number) => void; readonly?: boolean }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          className={`${readonly ? "cursor-default" : "cursor-pointer"} transition-colors`}
          onMouseEnter={() => !readonly && setHover(star)}
          onMouseLeave={() => !readonly && setHover(0)}
          onClick={() => onChange?.(star)}
        >
          <Star
            className={`h-4 w-4 ${
              star <= (hover || value) ? "fill-primary text-primary" : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );
};

const TrackRatings = ({ trackId }: { trackId: string }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [showForm, setShowForm] = useState(false);

  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ["track-ratings", trackId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("track_ratings")
        .select("*, profiles:user_id (display_name)")
        .eq("track_id", trackId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: hasPurchased } = useQuery({
    queryKey: ["has-purchased", trackId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { count } = await supabase
        .from("purchases")
        .select("id", { count: "exact", head: true })
        .eq("track_id", trackId)
        .eq("buyer_id", user.id);
      return (count ?? 0) > 0;
    },
    enabled: !!user,
  });

  const myRating = ratings.find((r) => r.user_id === user?.id);
  const avgRating = ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;

  const submitMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (myRating) {
        const { error } = await supabase
          .from("track_ratings")
          .update({ rating, comment: comment || null })
          .eq("id", myRating.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("track_ratings")
          .insert({ track_id: trackId, user_id: user.id, rating, comment: comment || null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(myRating ? "Rating updated!" : "Rating submitted!");
      queryClient.invalidateQueries({ queryKey: ["track-ratings", trackId] });
      setShowForm(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!myRating) return;
      const { error } = await supabase.from("track_ratings").delete().eq("id", myRating.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Rating removed");
      queryClient.invalidateQueries({ queryKey: ["track-ratings", trackId] });
      setRating(0);
      setComment("");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openForm = () => {
    if (myRating) {
      setRating(myRating.rating);
      setComment(myRating.comment || "");
    }
    setShowForm(true);
  };

  return (
    <div className="mt-8 rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-semibold text-foreground">Ratings</h3>
          {ratings.length > 0 && (
            <div className="flex items-center gap-1.5">
              <StarRating value={Math.round(avgRating)} readonly />
              <span className="font-mono text-xs text-muted-foreground">
                {avgRating.toFixed(1)} ({ratings.length})
              </span>
            </div>
          )}
        </div>
        {hasPurchased && !showForm && (
          <Button variant="outline" size="sm" className="font-mono text-xs" onClick={openForm}>
            {myRating ? "Edit Rating" : "Rate Track"}
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-6 rounded border border-border bg-card p-4 space-y-3">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Your Rating</span>
            <div className="mt-1">
              <StarRating value={rating} onChange={setRating} />
            </div>
          </div>
          <Textarea
            className="bg-surface border-border font-mono text-xs"
            rows={2}
            placeholder="Optional comment..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              className="font-mono text-xs"
              disabled={rating === 0 || submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
              {myRating ? "Update" : "Submit"}
            </Button>
            <Button variant="ghost" size="sm" className="font-mono text-xs" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            {myRating && (
              <Button
                variant="ghost"
                size="sm"
                className="font-mono text-xs text-destructive ml-auto"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                Delete
              </Button>
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      ) : ratings.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground text-center py-4">No ratings yet.</p>
      ) : (
        <div className="space-y-3">
          {ratings.map((r) => (
            <div key={r.id} className="rounded border border-border bg-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StarRating value={r.rating} readonly />
                  <span className="font-mono text-xs text-foreground">{(r as any).profiles?.display_name || "Anonymous"}</span>
                </div>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {new Date(r.created_at).toLocaleDateString()}
                </span>
              </div>
              {r.comment && (
                <p className="mt-2 font-mono text-xs text-muted-foreground">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TrackRatings;
