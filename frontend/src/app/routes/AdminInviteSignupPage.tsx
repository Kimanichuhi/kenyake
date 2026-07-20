import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type InviteState = "checking" | "invalid" | "valid";

const AdminInviteSignupPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn } = useAuth();

  const [state, setState] = useState<InviteState>("checking");
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setState("invalid");
        return;
      }
      const { data, error } = await (supabase.rpc as any)("admin_validate_invite", { p_token: token });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row || !row.valid) {
        setState("invalid");
        return;
      }
      setEmail(row.email);
      setState("valid");
    };
    validate();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSubmitting(true);

    const { data, error } = await supabase.functions.invoke("admin-accept-invite", {
      body: { token, password },
    });

    if (error || data?.error) {
      toast({
        title: "Couldn't complete signup",
        description: data?.error || error?.message || "Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
      return;
    }

    const { error: signInError } = await signIn(data.email, password);
    setSubmitting(false);

    if (signInError) {
      toast({ title: "Account created", description: "Please sign in." });
      navigate("/auth");
      return;
    }

    navigate("/admin");
  };

  return (
    <div className="min-h-screen bg-foreground flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <span className="text-3xl font-display font-bold text-savannah-gold">
            Safari<span className="text-primary-foreground">Kenya</span>
          </span>
          <p className="text-primary-foreground/60 font-body mt-2">Admin account setup</p>
        </div>

        <div className="glass-card-dark rounded-2xl p-8">
          {state === "checking" && (
            <p className="text-center text-sm text-primary-foreground/60">Checking your invite link...</p>
          )}

          {state === "invalid" && (
            <div className="text-center space-y-4">
              <p className="text-sm text-primary-foreground/80">
                This invite link is invalid or has expired. Ask your super admin to send you a new one.
              </p>
              <Button variant="outline" onClick={() => navigate("/")} className="w-full">
                Back to home
              </Button>
            </div>
          )}

          {state === "valid" && (
            <>
              <div className="flex items-center justify-center gap-2 mb-4 text-savannah-gold">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-medium">{email}</span>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/40" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Set a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-primary-foreground/40 hover:text-primary-foreground/60"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/40" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full gradient-sunset text-primary-foreground border-0 font-medium"
                >
                  {submitting ? "Please wait..." : "Create Admin Account"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminInviteSignupPage;
