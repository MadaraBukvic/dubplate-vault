import { Link } from "react-router-dom";
import { Disc3, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <Disc3 className="h-6 w-6 text-gold" />
          <span className="font-display text-lg font-bold tracking-tight text-foreground">
            DUBPLATE
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden items-center gap-8 md:flex">
          <Link to="/marketplace" className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-gold">
            Marketplace
          </Link>
          <Link to="/dashboard" className="font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-gold">
            For Producers
          </Link>
          <Link to="/auth" className="ml-4">
            <Button variant="gold-outline" size="sm">Sign In</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="border-b border-border bg-background px-4 py-6 md:hidden">
          <div className="flex flex-col gap-4">
            <Link to="/marketplace" className="font-mono text-sm uppercase tracking-widest text-muted-foreground" onClick={() => setIsOpen(false)}>
              Marketplace
            </Link>
            <Link to="/dashboard" className="font-mono text-sm uppercase tracking-widest text-muted-foreground" onClick={() => setIsOpen(false)}>
              For Producers
            </Link>
            <Link to="/auth" onClick={() => setIsOpen(false)}>
              <Button variant="gold" size="sm" className="w-full">Sign In</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
