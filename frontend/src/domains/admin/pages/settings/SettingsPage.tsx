import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { MediaPickerField } from "../../components/MediaPicker";
import { Loader2 } from "lucide-react";

const urlOrEmpty = z.string().url("Must be a valid URL").optional().or(z.literal(""));

const settingsFormSchema = z.object({
  company_name: z.string().min(1, "Company name is required"),
  logo_url: z.string().optional(),
  dark_logo_url: z.string().optional(),
  favicon_url: z.string().optional(),
  brand_primary_color: z.string().optional(),
  brand_secondary_color: z.string().optional(),
  contact_email: z.string().email("Must be a valid email").optional().or(z.literal("")),
  contact_phone: z.string().optional(),
  contact_address: z.string().optional(),
  google_maps_url: urlOrEmpty,
  facebook_url: urlOrEmpty,
  instagram_url: urlOrEmpty,
  twitter_url: urlOrEmpty,
  linkedin_url: urlOrEmpty,
  youtube_url: urlOrEmpty,
  default_meta_title: z.string().optional(),
  default_meta_description: z.string().optional(),
  default_og_image: z.string().optional(),
  google_analytics_id: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

function useSettingsRow() {
  return useQuery({
    queryKey: ["admin-site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").single();
      if (error) throw error;
      return data;
    },
  });
}

const toFormValues = (row: Record<string, unknown> | undefined): SettingsFormValues => ({
  company_name: (row?.company_name as string) ?? "",
  logo_url: (row?.logo_url as string) ?? "",
  dark_logo_url: (row?.dark_logo_url as string) ?? "",
  favicon_url: (row?.favicon_url as string) ?? "",
  brand_primary_color: (row?.brand_primary_color as string) ?? "",
  brand_secondary_color: (row?.brand_secondary_color as string) ?? "",
  contact_email: (row?.contact_email as string) ?? "",
  contact_phone: (row?.contact_phone as string) ?? "",
  contact_address: (row?.contact_address as string) ?? "",
  google_maps_url: (row?.google_maps_url as string) ?? "",
  facebook_url: (row?.facebook_url as string) ?? "",
  instagram_url: (row?.instagram_url as string) ?? "",
  twitter_url: (row?.twitter_url as string) ?? "",
  linkedin_url: (row?.linkedin_url as string) ?? "",
  youtube_url: (row?.youtube_url as string) ?? "",
  default_meta_title: (row?.default_meta_title as string) ?? "",
  default_meta_description: (row?.default_meta_description as string) ?? "",
  default_og_image: (row?.default_og_image as string) ?? "",
  google_analytics_id: (row?.google_analytics_id as string) ?? "",
});

const SettingsPage = () => {
  const { data: settings, isLoading } = useSettingsRow();
  const queryClient = useQueryClient();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: toFormValues(undefined),
  });

  useEffect(() => {
    if (settings) form.reset(toFormValues(settings));
  }, [settings]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useMutation({
    mutationFn: async (values: SettingsFormValues) => {
      if (!settings?.id) throw new Error("Settings row not loaded yet");
      const { error } = await supabase.from("site_settings").update(values).eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin-site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-site-settings"] });
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save settings"),
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Website Settings</h1>
        <p className="text-sm text-muted-foreground">Sitewide branding, contact info, social links, and SEO defaults used across the whole site.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="company_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Company name</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="logo_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl><MediaPickerField value={field.value} onChange={field.onChange} label="Choose logo" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="dark_logo_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dark-mode logo</FormLabel>
                  <FormControl><MediaPickerField value={field.value} onChange={field.onChange} label="Choose dark logo" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="favicon_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
                  <FormControl><MediaPickerField value={field.value} onChange={field.onChange} label="Choose favicon" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField control={form.control} name="brand_primary_color" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary color</FormLabel>
                    <FormControl><Input placeholder="#2d6a4f" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="brand_secondary_color" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary color</FormLabel>
                    <FormControl><Input placeholder="#f5a623" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Contact</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="contact_email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact_phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact_address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="google_maps_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps URL</FormLabel>
                  <FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Social media</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="facebook_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook</FormLabel>
                  <FormControl><Input placeholder="https://facebook.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="instagram_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Instagram</FormLabel>
                  <FormControl><Input placeholder="https://instagram.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="twitter_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>X / Twitter</FormLabel>
                  <FormControl><Input placeholder="https://x.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="linkedin_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl><Input placeholder="https://linkedin.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="youtube_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>YouTube</FormLabel>
                  <FormControl><Input placeholder="https://youtube.com/..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">SEO defaults</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <FormField control={form.control} name="default_meta_title" render={({ field }) => (
                <FormItem>
                  <FormLabel>Default meta title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormDescription>Used on pages that don't set their own title.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="default_meta_description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Default meta description</FormLabel>
                  <FormControl><Textarea rows={3} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="default_og_image" render={({ field }) => (
                <FormItem>
                  <FormLabel>Default social share image</FormLabel>
                  <FormControl><MediaPickerField value={field.value} onChange={field.onChange} label="Choose image" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="google_analytics_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Analytics ID</FormLabel>
                  <FormControl><Input placeholder="G-XXXXXXXXXX" {...field} /></FormControl>
                  <FormDescription>Leave blank to disable analytics.</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={save.isPending}>
              {save.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Save settings
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsPage;
