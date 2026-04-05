import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Shield, Disc3, Download } from "lucide-react";
import heroImage from "@/assets/hero-vinyl.jpg";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TrackCard from "@/components/TrackCard";
import { mockTracks } from "@/data/mockTracks";

const Index = () => {
  const featuredTracks = mockTracks.filter(t => t.copiesSold < t.maxCopies).slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Vinyl turntable"
            className="h-full w-full object-cover opacity-40"
            width={1920}
            height={1080}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
        </div>

        <div className="container relative mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <p className="animate-fade-up font-mono text-xs uppercase tracking-[0.3em] text-gold">
              Exclusive Unreleased Music
            </p>
            <h1 className="animate-fade-up mt-6 font-display text-5xl font-bold leading-tight text-foreground md:text-7xl">
              Your Sound.{" "}
              <span className="text-gold-gradient">Your Dubplate.</span>
            </h1>
            <p className="animate-fade-up-delay mt-6 font-mono text-sm leading-relaxed text-muted-foreground md:text-base">
              The marketplace for exclusive, unreleased tracks.
              Producers sell. DJs buy. Every purchase is unique,
              traceable, and yours alone.
            </p>
            <div className="animate-fade-up-delay-2 mt-10 flex flex-wrap gap-4">
              <Link to="/marketplace">
                <Button variant="gold" size="lg" className="text-sm">
                  Browse Tracks
                </Button>
              </Link>
              <Link to="/auth">
                <Button variant="gold-outline" size="lg" className="text-sm">
                  Start Selling
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-t border-border py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-3">
            {[
              {
                icon: Shield,
                title: "Exclusive Rights",
                desc: "Each track is sold once — or in limited copies. Your dubplate, nobody else's.",
              },
              {
                icon: Disc3,
                title: "Traceable Licenses",
                desc: "Every purchase generates a unique license token embedded into the file.",
              },
              {
                icon: Download,
                title: "Secure Delivery",
                desc: "Signed download URLs, limited downloads, watermarked files. No leaks.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface">
                  <item.icon className="h-5 w-5 text-gold" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Tracks */}
      <section className="border-t border-border py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Fresh Cuts</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-foreground md:text-4xl">
                Featured Tracks
              </h2>
            </div>
            <Link to="/marketplace">
              <Button variant="gold-outline" size="sm">View All</Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
            Ready to sell your{" "}
            <span className="text-gold-gradient">unreleased heat</span>?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-mono text-sm text-muted-foreground">
            Join as a producer. Upload tracks, set your price and exclusivity. Get paid directly.
          </p>
          <Link to="/auth" className="mt-8 inline-block">
            <Button variant="gold" size="lg" className="text-sm">
              Create Producer Account
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
