import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast({ title: "Sign up failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    } else {
      const { error } = await signIn(email, password);
      if (error) {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    }
    setSubmitting(false);
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
          <p className="text-primary-foreground/60 font-body mt-2">
            {isSignUp ? "Create your account to start exploring" : "Welcome back, explorer"}
          </p>
        </div>

        <div className="glass-card-dark rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/40" />
                <Input
                  placeholder="Full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/40" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/40"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-primary-foreground/40" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
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

            <Button
              type="submit"
              disabled={submitting}
              className="w-full gradient-sunset text-primary-foreground border-0 font-medium"
            >
              {submitting ? "Please wait..." : isSignUp ? "Create Account" : "Sign In"}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-body text-primary-foreground/60 hover:text-savannah-gold transition-colors"
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center mt-6">
          <button onClick={() => navigate("/")} className="text-primary-foreground/40 text-xs font-body hover:text-savannah-gold transition-colors">
            ← Back to home
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
