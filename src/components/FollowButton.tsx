import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface FollowButtonProps {
  producerId: string;
}

const FollowButton = ({ producerId }: FollowButtonProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: followInfo, isLoading } = useQuery({
    queryKey: ["follow-info", producerId, user?.id],
    queryFn: async () => {
      const [{ count: followers }, mine] = await Promise.all([
        supabase
          .from("producer_follows")
          .select("id", { count: "exact", head: true })
          .eq("producer_id", producerId),
        user
          ? supabase
              .from("producer_follows")
              .select("id")
              .eq("producer_id", producerId)
              .eq("follower_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      return {
        followerCount: followers ?? 0,
        isFollowing: !!(mine as any)?.data,
      };
    },
  });

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not-auth");
      if (followInfo?.isFollowing) {
        const { error } = await supabase
          .from("producer_follows")
          .delete()
          .eq("producer_id", producerId)
          .eq("follower_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("producer_follows")
          .insert({ producer_id: producerId, follower_id: user.id });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["follow-info", producerId] });
      qc.invalidateQueries({ queryKey: ["following-feed"] });
    },
    onError: (e: any) => {
      if (e.message === "not-auth") {
        navigate("/auth");
      } else {
        toast({ title: "Error", description: e.message, variant: "destructive" });
      }
    },
  });

  // Don't show on own profile
  if (user?.id === producerId) return null;

  const isFollowing = followInfo?.isFollowing;

  return (
    <div className="flex items-center gap-3">
      <Button
        variant={isFollowing ? "outline" : "gold"}
        size="sm"
        onClick={() => toggle.mutate()}
        disabled={toggle.isPending || isLoading}
        className="gap-2 font-mono text-xs"
      >
        {toggle.isPending ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Heart className={`h-3 w-3 ${isFollowing ? "fill-primary text-primary" : ""}`} />
        )}
        {isFollowing ? "Following" : "Follow"}
      </Button>
      <span className="font-mono text-xs text-muted-foreground">
        {followInfo?.followerCount ?? 0} {followInfo?.followerCount === 1 ? "follower" : "followers"}
      </span>
    </div>
  );
};

export default FollowButton;