import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Heading2 } from "lucide-react";
import { RichTextBlock } from "../../../types/block";
import { cn } from "@/lib/utils";

export const RichTextBlockEditor = ({
  value,
  onChange,
}: {
  value: RichTextBlock;
  onChange: (v: RichTextBlock) => void;
}) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value.html,
    onUpdate: ({ editor }) => onChange({ ...value, html: editor.getHTML() }),
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none min-h-[120px] focus:outline-none dark:prose-invert",
      },
    },
  });

  if (!editor) return null;

  const toolbarButton = (active: boolean, onClick: () => void, icon: React.ReactNode) => (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("h-7 w-7", active && "bg-muted")}
      onClick={onClick}
    >
      {icon}
    </Button>
  );

  return (
    <div className="rounded-md border border-input">
      <div className="flex items-center gap-1 border-b border-input p-1">
        {toolbarButton(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="h-3.5 w-3.5" />)}
        {toolbarButton(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="h-3.5 w-3.5" />)}
        {toolbarButton(
          editor.isActive("heading", { level: 2 }),
          () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
          <Heading2 className="h-3.5 w-3.5" />,
        )}
        {toolbarButton(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List className="h-3.5 w-3.5" />)}
        {toolbarButton(
          editor.isActive("orderedList"),
          () => editor.chain().focus().toggleOrderedList().run(),
          <ListOrdered className="h-3.5 w-3.5" />,
        )}
      </div>
      <div className="p-3">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
