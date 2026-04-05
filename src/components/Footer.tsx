import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-[8px]">DV</span>
            </div>
            <span className="font-display text-sm font-bold text-foreground">DUBVAULT</span>
          </div>
          <div className="flex gap-8">
            <Link to="/marketplace" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Marketplace
            </Link>
            <Link to="/dashboard" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
              Producers
            </Link>
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 DubVault
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
