import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);

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

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 flex gap-2">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 rounded py-2 font-mono text-xs uppercase tracking-wider transition-colors ${
                  isLogin ? "bg-gold text-primary-foreground" : "bg-surface text-muted-foreground hover:text-foreground"
                }`}
              >
                Sign In
              </button>
              <button
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
                    <Input className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="Your name" />
                  </div>
                  <div>
                    <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">I am a</Label>
                    <div className="mt-1.5 grid grid-cols-2 gap-2">
                      <button className="rounded border border-border bg-surface py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-gold hover:text-gold focus:border-gold focus:text-gold">
                        DJ / Buyer
                      </button>
                      <button className="rounded border border-border bg-surface py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-gold hover:text-gold focus:border-gold focus:text-gold">
                        Producer
                      </button>
                    </div>
                  </div>
                </>
              )}
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Email</Label>
                <Input type="email" className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="your@email.com" />
              </div>
              <div>
                <Label className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Password</Label>
                <Input type="password" className="mt-1.5 bg-surface border-border font-mono text-sm" placeholder="••••••••" />
              </div>
              <Button variant="gold" className="w-full text-sm mt-2">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Auth;
