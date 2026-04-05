import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setErrorMsg("No session ID provided.");
      return;
    }

    const verify = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("verify-payment", {
          body: { sessionId },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setStatus("success");
      } catch (err: any) {
        setStatus("error");
        setErrorMsg(err.message || "Verification failed");
      }
    };

    verify();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 pt-16">
        <div className="w-full max-w-md text-center">
          {status === "verifying" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
              <h1 className="mt-6 font-display text-3xl font-bold text-foreground">Verifying Payment...</h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">Please wait while we confirm your purchase.</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <h1 className="mt-6 font-display text-3xl font-bold text-foreground">Purchase Complete!</h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                Your exclusive track is now in your library. A unique license token has been generated.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <Link to="/library">
                  <Button variant="gold" size="lg" className="w-full text-sm">Go to My Library</Button>
                </Link>
                <Link to="/marketplace">
                  <Button variant="gold-outline" size="sm" className="w-full text-sm">Browse More Tracks</Button>
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-2 border-destructive">
                <span className="text-destructive text-xl font-bold">!</span>
              </div>
              <h1 className="mt-6 font-display text-3xl font-bold text-foreground">Something Went Wrong</h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">{errorMsg}</p>
              <Link to="/marketplace" className="mt-8 inline-block">
                <Button variant="gold-outline" size="sm">Back to Marketplace</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentSuccess;
