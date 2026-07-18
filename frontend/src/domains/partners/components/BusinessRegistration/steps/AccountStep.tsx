import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { WizardStepProps } from "../../../types/wizard";
import type { BusinessRegistrationValues } from "../BusinessRegistrationWizard";

function passwordStrength(password: string): { label: string; score: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  const labels = ["Very weak", "Weak", "Fair", "Good", "Strong"];
  return { label: labels[Math.min(score, labels.length - 1)], score: Math.min(score, 5) };
}

export function AccountStep({ values, onChange }: WizardStepProps<BusinessRegistrationValues>) {
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-4">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <div>
          <p className="text-sm font-medium text-foreground">You&apos;re signed in as {user.email}</p>
          <p className="text-sm text-muted-foreground">
            Continue below to register your business under this account.
          </p>
        </div>
      </div>
    );
  }

  const strength = passwordStrength(values.password ?? "");
  const passwordsMatch = !values.confirmPassword || values.password === values.confirmPassword;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Create an account to start your business registration. You&apos;ll use these credentials to sign in and
        manage your listing afterwards.
      </p>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name</Label>
        <Input
          id="fullName"
          value={values.fullName ?? ""}
          onChange={(e) => onChange({ fullName: e.target.value })}
          placeholder="Your full name"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email address</Label>
        <Input
          id="email"
          type="email"
          value={values.email ?? ""}
          onChange={(e) => onChange({ email: e.target.value })}
          placeholder="you@business.com"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">Phone number</Label>
        <Input
          id="phone"
          type="tel"
          value={values.phone ?? ""}
          onChange={(e) => onChange({ phone: e.target.value })}
          placeholder="07XX XXX XXX"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={values.password ?? ""}
            onChange={(e) => onChange({ password: e.target.value })}
            placeholder="At least 8 characters"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {values.password && (
          <div className="space-y-1">
            <div className="flex h-1.5 gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-full flex-1 rounded-full ${i < strength.score ? "bg-primary" : "bg-muted"}`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{strength.label}</p>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input
          id="confirmPassword"
          type={showPassword ? "text" : "password"}
          value={values.confirmPassword ?? ""}
          onChange={(e) => onChange({ confirmPassword: e.target.value })}
          placeholder="Re-enter your password"
        />
        {!passwordsMatch && <p className="text-xs font-medium text-destructive">Passwords do not match.</p>}
      </div>
    </div>
  );
}
