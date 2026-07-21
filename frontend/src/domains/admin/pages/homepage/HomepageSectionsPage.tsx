import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { MediaPickerField } from "../../components/MediaPicker";
import { ArrowUp, ArrowDown, Loader2 } from "lucide-react";

type HomepageSectionRow = Tables<"homepage_sections">;

const SECTION_LABELS: Record<string, string> = {
  hero: "Hero",
  destinations: "Destinations",
  experiences: "Experiences",
  wildlife: "Wildlife",
  community: "Community",
  cta: "Closing call-to-action",
};

function useHomepageSectionsAdmin() {
  return useQuery({
    queryKey: ["admin-homepage-sections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("homepage_sections").select("*").order("display_order", { ascending: true });
      if (error) throw error;
      return data as HomepageSectionRow[];
    },
  });
}

type EditableFields = Pick<
  HomepageSectionRow,
  "eyebrow_text" | "heading_line1" | "heading_line2" | "subheading" | "image_url" | "cta_label" | "cta_href"
>;

const HomepageSectionsPage = () => {
  const { data: sections, isLoading } = useHomepageSectionsAdmin();
  const queryClient = useQueryClient();
  const [drafts, setDrafts] = useState<Record<string, EditableFields>>({});

  useEffect(() => {
    if (!sections) return;
    setDrafts((prev) => {
      const next = { ...prev };
      for (const s of sections) {
        if (!next[s.id]) {
          next[s.id] = {
            eyebrow_text: s.eyebrow_text,
            heading_line1: s.heading_line1,
            heading_line2: s.heading_line2,
            subheading: s.subheading,
            image_url: s.image_url,
            cta_label: s.cta_label,
            cta_href: s.cta_href,
          };
        }
      }
      return next;
    });
  }, [sections]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-homepage-sections"] });
    queryClient.invalidateQueries({ queryKey: ["public-homepage-sections"] });
  };

  const toggleEnabled = useMutation({
    mutationFn: async ({ id, enabled }: { id: string; enabled: boolean }) => {
      const { error } = await supabase.from("homepage_sections").update({ enabled }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message || "Failed to update section"),
  });

  const reorder = useMutation({
    mutationFn: async ({ a, b }: { a: HomepageSectionRow; b: HomepageSectionRow }) => {
      const [{ error: e1 }, { error: e2 }] = await Promise.all([
        supabase.from("homepage_sections").update({ display_order: b.display_order }).eq("id", a.id),
        supabase.from("homepage_sections").update({ display_order: a.display_order }).eq("id", b.id),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
    },
    onSuccess: invalidate,
    onError: (error: Error) => toast.error(error.message || "Failed to reorder sections"),
  });

  const saveFields = useMutation({
    mutationFn: async ({ id, values }: { id: string; values: EditableFields }) => {
      const { error } = await supabase.from("homepage_sections").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Section saved");
      invalidate();
    },
    onError: (error: Error) => toast.error(error.message || "Failed to save section"),
  });

  if (isLoading || !sections) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    reorder.mutate({ a: sections[index], b: sections[target] });
  };

  const updateDraft = (id: string, patch: Partial<EditableFields>) => {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-foreground">Homepage Sections</h1>
        <p className="text-sm text-muted-foreground">
          Enable/disable, reorder, and edit the copy for each homepage section. The Hero always appears first and the closing call-to-action always appears last; the sections in between can be reordered.
        </p>
      </div>

      <div className="space-y-2">
        {sections.map((section, index) => (
          <div key={section.id} className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 p-3">
              <div className="flex flex-col">
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === sections.length - 1} onClick={() => move(index, 1)}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <span className="flex-1 font-medium text-foreground">{SECTION_LABELS[section.section_key] ?? section.section_key}</span>
              <div className="flex items-center gap-2">
                <Label htmlFor={`enabled-${section.id}`} className="text-xs text-muted-foreground">Enabled</Label>
                <Switch
                  id={`enabled-${section.id}`}
                  checked={section.enabled}
                  onCheckedChange={(checked) => toggleEnabled.mutate({ id: section.id, enabled: checked })}
                />
              </div>
            </div>

            <Accordion type="single" collapsible>
              <AccordionItem value={section.id} className="border-t border-border">
                <AccordionTrigger className="px-3 text-sm">Edit copy</AccordionTrigger>
                <AccordionContent className="space-y-4 px-3 pb-4">
                  <div>
                    <Label>Eyebrow text</Label>
                    <Input
                      value={drafts[section.id]?.eyebrow_text ?? ""}
                      onChange={(e) => updateDraft(section.id, { eyebrow_text: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Heading{section.section_key === "hero" ? " (line 1)" : ""}</Label>
                    <Input
                      value={drafts[section.id]?.heading_line1 ?? ""}
                      onChange={(e) => updateDraft(section.id, { heading_line1: e.target.value })}
                    />
                  </div>
                  {section.section_key === "hero" && (
                    <div>
                      <Label>Heading (line 2, highlighted)</Label>
                      <Input
                        value={drafts[section.id]?.heading_line2 ?? ""}
                        onChange={(e) => updateDraft(section.id, { heading_line2: e.target.value })}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Subheading</Label>
                    <Textarea
                      rows={3}
                      value={drafts[section.id]?.subheading ?? ""}
                      onChange={(e) => updateDraft(section.id, { subheading: e.target.value })}
                    />
                  </div>
                  {section.section_key === "hero" && (
                    <div>
                      <Label>Background image</Label>
                      <MediaPickerField
                        value={drafts[section.id]?.image_url ?? undefined}
                        onChange={(url) => updateDraft(section.id, { image_url: url ?? null })}
                      />
                    </div>
                  )}
                  {(section.section_key === "hero" || section.section_key === "cta") && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label>Button label</Label>
                        <Input
                          value={drafts[section.id]?.cta_label ?? ""}
                          onChange={(e) => updateDraft(section.id, { cta_label: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Button link</Label>
                        <Input
                          value={drafts[section.id]?.cta_href ?? ""}
                          onChange={(e) => updateDraft(section.id, { cta_href: e.target.value })}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <Button
                      size="sm"
                      disabled={saveFields.isPending}
                      onClick={() => drafts[section.id] && saveFields.mutate({ id: section.id, values: drafts[section.id] })}
                    >
                      {saveFields.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomepageSectionsPage;
