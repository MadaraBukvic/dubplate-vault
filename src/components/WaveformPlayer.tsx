import { useRef, useState, useCallback, useEffect } from "react";
import { useWavesurfer } from "@wavesurfer/react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface WaveformPlayerProps {
  audioUrl?: string;
  title?: string;
}

const WaveformPlayer = ({ audioUrl, title }: WaveformPlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const { wavesurfer } = useWavesurfer({
    container: containerRef,
    url: audioUrl || "",
    waveColor: "hsl(0, 0%, 30%)",
    progressColor: "hsl(0, 72%, 51%)",
    cursorColor: "hsl(0, 72%, 62%)",
    cursorWidth: 2,
    barWidth: 2,
    barGap: 2,
    barRadius: 2,
    height: 80,
    normalize: true,
  });

  useEffect(() => {
    if (!wavesurfer) return;
    const subs = [
      wavesurfer.on("play", () => setIsPlaying(true)),
      wavesurfer.on("pause", () => setIsPlaying(false)),
      wavesurfer.on("timeupdate", (t: number) => setCurrentTime(t)),
      wavesurfer.on("ready", () => setDuration(wavesurfer.getDuration())),
    ];
    return () => subs.forEach((unsub) => unsub());
  }, [wavesurfer]);

  const togglePlay = useCallback(() => {
    wavesurfer?.playPause();
  }, [wavesurfer]);

  const toggleMute = useCallback(() => {
    if (wavesurfer) {
      const newMuted = !isMuted;
      wavesurfer.setVolume(newMuted ? 0 : 1);
      setIsMuted(newMuted);
    }
  }, [wavesurfer, isMuted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const hasAudio = !!audioUrl;

  return (
    <div className="flex flex-col gap-4">
      <div
        className={`relative rounded-lg border border-border bg-background p-4 ${
          !hasAudio ? "flex items-center justify-center min-h-[120px]" : ""
        }`}
      >
        {hasAudio ? (
          <div ref={containerRef} className="w-full" />
        ) : (
          <div className="text-center">
            <div className="flex items-end justify-center gap-[3px] h-[80px] mb-3">
              {Array.from({ length: 60 }).map((_, i) => {
                const height = Math.sin(i * 0.3) * 30 + Math.random() * 20 + 10;
                return (
                  <div
                    key={i}
                    className="w-[2px] rounded-full bg-primary/20"
                    style={{ height: `${height}px` }}
                  />
                );
              })}
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Preview not available yet
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          disabled={!hasAudio}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-primary/30 bg-background transition-colors hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 text-primary" />
          ) : (
            <Play className="h-5 w-5 text-primary ml-0.5" />
          )}
        </button>

        <div className="flex-1">
          {title && (
            <p className="font-mono text-xs text-muted-foreground truncate">{title}</p>
          )}
          <p className="font-mono text-[10px] text-muted-foreground/60">
            {hasAudio
              ? `${formatTime(currentTime)} / ${formatTime(duration)}`
              : "0:00 / 0:30"}
          </p>
        </div>

        <button
          onClick={toggleMute}
          disabled={!hasAudio}
          className="text-muted-foreground hover:text-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </button>

        <span className="font-mono text-[10px] uppercase tracking-wider text-primary/60 border border-primary/20 px-2 py-0.5 rounded">
          30s preview
        </span>
      </div>
    </div>
  );
};

export default WaveformPlayer;
