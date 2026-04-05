import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export interface Track {
  id: string;
  title: string;
  producer_id: string;
  producer_name?: string;
  bpm: number;
  key: string;
  genre: string;
  price_eur: number;
  exclusivity_type: "single" | "limited";
  max_copies: number;
  copies_sold: number;
  description?: string | null;
  preview_path?: string | null;
  storage_path?: string | null;
  created_at?: string;
}

const TrackCard = ({ track }: { track: Track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const remaining = track.max_copies - track.copies_sold;
  const isSoldOut = remaining <= 0;

  return (
    <Link to={`/track/${track.id}`} className="group block">
      <div className="rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-primary/30 hover:bg-surface-hover">
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {track.title}
            </h3>
            <Link to={`/producer/${track.producer_id}`} onClick={(e) => e.stopPropagation()} className="font-mono text-xs text-muted-foreground mt-0.5 hover:text-primary transition-colors block">
              {track.producer_name || "Unknown"}
            </Link>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setIsPlaying(!isPlaying); }}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-primary hover:text-primary"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {track.bpm} BPM
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {track.key}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {track.genre}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="font-mono text-lg font-semibold text-primary">
            €{track.price_eur}
          </span>
          <Badge
            variant={isSoldOut ? "secondary" : "default"}
            className={isSoldOut
              ? "font-mono text-[10px] uppercase tracking-wider"
              : "font-mono text-[10px] uppercase tracking-wider bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            }
          >
            {isSoldOut
              ? "Sold Out"
              : track.exclusivity_type === "single"
                ? "1 of 1"
                : `${remaining} of ${track.max_copies}`
            }
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default TrackCard;
