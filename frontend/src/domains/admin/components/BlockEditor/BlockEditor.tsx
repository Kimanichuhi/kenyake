import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUp, ArrowDown, Copy, Trash2, Plus } from "lucide-react";
import { Block, BlockType, emptyBlockOf } from "../../types/block";
import { blockRegistry } from "./blockRegistry";

interface BlockEditorProps {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}

export function BlockEditor({ value, onChange }: BlockEditorProps) {
  const addBlock = (type: BlockType) => onChange([...value, emptyBlockOf(type)]);

  const updateBlock = (index: number, block: Block) => {
    const next = [...value];
    next[index] = block;
    onChange(next);
  };

  const removeBlock = (index: number) => onChange(value.filter((_, i) => i !== index));

  const duplicateBlock = (index: number) => {
    const clone = { ...value[index], id: crypto.randomUUID() } as Block;
    const next = [...value];
    next.splice(index + 1, 0, clone);
    onChange(next);
  };

  const moveBlock = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {value.map((block, i) => {
        const entry = blockRegistry[block.type];
        const Editor = entry.Editor;
        return (
          <Card key={block.id}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <entry.icon className="h-4 w-4 text-muted-foreground" />
                {entry.label}
              </div>
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon" disabled={i === 0} onClick={() => moveBlock(i, -1)}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={i === value.length - 1}
                  onClick={() => moveBlock(i, 1)}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => duplicateBlock(i)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" onClick={() => removeBlock(i)}>
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Editor value={block} onChange={(b) => updateBlock(i, b)} />
            </CardContent>
          </Card>
        );
      })}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="outline">
            <Plus className="mr-1.5 h-4 w-4" /> Add block
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {(Object.keys(blockRegistry) as BlockType[]).map((type) => (
            <DropdownMenuItem key={type} onClick={() => addBlock(type)}>
              {blockRegistry[type].label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
