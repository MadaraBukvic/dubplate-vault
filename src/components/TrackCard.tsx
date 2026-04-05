import { Badge } from "@/components/ui/badge";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link } from "react-router-dom";

export interface Track {
  id: string;
  title: string;
  producer: string;
  bpm: number;
  musicalKey: string;
  genre: string;
  price: number;
  exclusivityType: "single" | "limited";
  maxCopies: number;
  copiesSold: number;
}

const TrackCard = ({ track }: { track: Track }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const remaining = track.maxCopies - track.copiesSold;
  const isSoldOut = remaining <= 0;

  return (
    <Link to={`/track/${track.id}`} className="group block">
      <div className="rounded-lg border border-border bg-card p-4 transition-all duration-300 hover:border-gold/30 hover:bg-surface-hover">
        {/* Top row */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-lg font-semibold text-foreground truncate group-hover:text-gold transition-colors">
              {track.title}
            </h3>
            <p className="font-mono text-xs text-muted-foreground mt-0.5">{track.producer}</p>
          </div>
          <button
            onClick={(e) => { e.preventDefault(); setIsPlaying(!isPlaying); }}
            className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition-all hover:border-gold hover:text-gold"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
          </button>
        </div>

        {/* Metadata */}
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {track.bpm} BPM
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {track.musicalKey}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {track.genre}
          </span>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between">
          <span className="font-mono text-lg font-semibold text-gold">
            €{track.price}
          </span>
          <Badge
            variant={isSoldOut ? "secondary" : "default"}
            className={isSoldOut
              ? "font-mono text-[10px] uppercase tracking-wider"
              : "font-mono text-[10px] uppercase tracking-wider bg-gold/10 text-gold border-gold/20 hover:bg-gold/20"
            }
          >
            {isSoldOut
              ? "Sold Out"
              : track.exclusivityType === "single"
                ? "1 of 1"
                : `${remaining} of ${track.maxCopies}`
            }
          </Badge>
        </div>
      </div>
    </Link>
  );
};

export default TrackCard;
