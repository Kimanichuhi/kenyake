import { ComponentType } from "react";
import { z } from "zod";

export interface WizardSaveContext {
  businessId: string | null;
  setBusinessId: (id: string) => void;
}

export interface WizardStepProps<TValues> {
  values: TValues;
  onChange: (values: Partial<TValues>) => void;
  businessId: string | null;
}

export interface WizardStepConfig<TValues extends Record<string, unknown> = Record<string, unknown>> {
  id: string;
  title: string;
  description?: string;
  // Typed as ZodTypeAny deliberately (not z.ZodType<TValues>) — the same
  // reason the admin CMS's ResourceConfig.formSchema is: embedding TValues
  // inside Zod's own generic here causes excessively-deep type instantiation
  // once a step config array mixes several differently-shaped step schemas.
  schema: z.ZodTypeAny;
  Component: ComponentType<WizardStepProps<TValues>>;
  isOptional?: boolean;
  onSave?: (values: TValues, ctx: WizardSaveContext) => Promise<void>;
}

export interface WizardConfig<TAllValues extends Record<string, unknown>> {
  steps: WizardStepConfig<any>[];
  initialValues: TAllValues;
  initialBusinessId?: string | null;
  onComplete: (values: TAllValues, ctx: WizardSaveContext) => Promise<void> | void;
  exitPath: string;
}
