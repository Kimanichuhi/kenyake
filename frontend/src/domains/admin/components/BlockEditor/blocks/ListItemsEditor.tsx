import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

export interface ItemFieldSpec {
  key: string;
  placeholder: string;
  multiline?: boolean;
}

interface ListItemsEditorProps<T extends Record<string, string>> {
  items: T[];
  onChange: (items: T[]) => void;
  fields: ItemFieldSpec[];
  emptyItem: T;
  addLabel: string;
}

export function ListItemsEditor<T extends Record<string, string>>({
  items,
  onChange,
  fields,
  emptyItem,
  addLabel,
}: ListItemsEditorProps<T>) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className="space-y-2 rounded-md border border-border p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              {fields.map((field) => {
                const Field = field.multiline ? Textarea : Input;
                return (
                  <Field
                    key={field.key}
                    placeholder={field.placeholder}
                    value={item[field.key] ?? ""}
                    onChange={(e) => {
                      const next = [...items];
                      next[i] = { ...next[i], [field.key]: e.target.value };
                      onChange(next);
                    }}
                  />
                );
              })}
            </div>
            <Button type="button" variant="ghost" size="icon" onClick={() => onChange(items.filter((_, idx) => idx !== i))}>
              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
            </Button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, emptyItem])}>
        <Plus className="mr-1.5 h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
