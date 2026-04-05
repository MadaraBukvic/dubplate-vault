import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<"dj" | "producer">("dj");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redirect if already logged in
  if (user) {
    navigate("/marketplace");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Signed in successfully!");
        navigate("/marketplace");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName, role },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast.success("Check your email to confirm your account!");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isLogin ? "Welcome Back" : "Join Dubplate"}
            </h1>
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              {isLogin ? "Sign in to your account" : "Create your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex gap-2">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isLogin ? "bg-gold text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 rounded py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  !isLogin ? "bg-gold text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign Up
              </button>
            </div>

            <div className="space-y-4">
              {!isLogin && (
                <>
                  <div>
                    <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
                    <Input
                      className="mt-1.5 bg-surface border-border font-mono text-sm"
                      placeholder="Your name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">I am a</Label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole("dj")}
                        className={`rounded border py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                          role === "dj"
                            ? "border-gold text-gold bg-surface-hover"
                            : "border-border bg-surface text-muted-foreground hover:border-gold hover:text-gold"
                        }`}
                      >
                        DJ / Buyer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("producer")}
                        className={`rounded border py-3 font-mono text-xs uppercase tracking-wider transition-colors ${
                          role === "producer"
                            ? "border-gold text-gold bg-surface-hover"
                            : "border-border bg-surface text-muted-foreground hover:border-gold hover:text-gold"
                        }`}
                      >
                        Producer
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input
                  type="email"
                  className="mt-1.5 bg-surface border-border font-mono text-sm"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                <Input
                  type="password"
                  className="mt-1.5 bg-surface border-border font-mono text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button variant="gold" className="w-full text-sm mt-2" disabled={isLoading}>
                {isLoading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
