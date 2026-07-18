import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Loader2, Save } from "lucide-react";
import { WizardConfig } from "../../types/wizard";
import { WizardProgress } from "./WizardProgress";

interface WizardProps<TAllValues extends Record<string, unknown>> {
  config: WizardConfig<TAllValues>;
}

export function Wizard<TAllValues extends Record<string, unknown>>({ config }: WizardProps<TAllValues>) {
  const navigate = useNavigate();
  const [stepIndex, setStepIndex] = useState(0);
  const [furthestIndex, setFurthestIndex] = useState(0);
  const [values, setValues] = useState<TAllValues>(config.initialValues);
  const [businessId, setBusinessId] = useState<string | null>(config.initialBusinessId ?? null);
  const [saving, setSaving] = useState(false);
  const [stepError, setStepError] = useState<string | null>(null);

  const step = config.steps[stepIndex];
  const isLastStep = stepIndex === config.steps.length - 1;
  const ctx = { businessId, setBusinessId };

  const handleChange = (partial: Partial<TAllValues>) => {
    setValues((prev) => ({ ...prev, ...partial }));
  };

  const validateStep = () => {
    const result = step.schema.safeParse(values);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      setStepError(firstIssue?.message ?? "Please check this step for errors.");
      return false;
    }
    setStepError(null);
    return true;
  };

  const handleNext = async () => {
    if (!step.isOptional && !validateStep()) return;

    try {
      setSaving(true);
      if (step.onSave) {
        await step.onSave(values, ctx);
      }
      if (isLastStep) {
        await config.onComplete(values, ctx);
      } else {
        setStepIndex((i) => i + 1);
        setFurthestIndex((f) => Math.max(f, stepIndex + 1));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong saving this step");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const handleSaveAndExit = async () => {
    try {
      setSaving(true);
      if (step.onSave) {
        await step.onSave(values, ctx);
      }
      toast.success("Progress saved — pick up where you left off anytime.");
      navigate(config.exitPath);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save progress");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <WizardProgress
        steps={config.steps}
        currentIndex={stepIndex}
        furthestIndex={furthestIndex}
        onStepClick={setStepIndex}
      />

      <Card>
        <CardHeader>
          <CardTitle>{step.title}</CardTitle>
          {step.description && <CardDescription>{step.description}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-4">
          <step.Component values={values} onChange={handleChange} businessId={businessId} />
          {stepError && <p className="text-sm font-medium text-destructive">{stepError}</p>}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" onClick={handleBack} disabled={stepIndex === 0 || saving}>
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={handleSaveAndExit} disabled={saving}>
            <Save className="mr-1.5 h-4 w-4" /> Save & exit
          </Button>
          <Button type="button" onClick={handleNext} disabled={saving}>
            {saving && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isLastStep ? "Submit application" : "Next"}
            {!isLastStep && !saving && <ArrowRight className="ml-1.5 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
