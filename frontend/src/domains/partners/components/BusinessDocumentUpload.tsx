import { useRef, useState } from "react";
import { UploadCloud, Loader2, FileText, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DOCUMENT_TYPES,
  useBusinessDocuments,
  useUploadBusinessDocument,
  useDeleteBusinessDocument,
} from "../hooks/useBusinessDocuments";

interface BusinessDocumentUploadProps {
  businessId: string;
}

export function BusinessDocumentUpload({ businessId }: BusinessDocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState(DOCUMENT_TYPES[0].value);
  const [isDragging, setIsDragging] = useState(false);

  const { data: documents, isLoading } = useBusinessDocuments(businessId);
  const uploadDocument = useUploadBusinessDocument();
  const deleteDocument = useDeleteBusinessDocument();

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      await uploadDocument.mutateAsync({ businessId, file, docType });
    }
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Select value={docType} onValueChange={setDocType}>
          <SelectTrigger className="sm:w-72">
            <SelectValue placeholder="Document type" />
          </SelectTrigger>
          <SelectContent>
            {DOCUMENT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-6 text-center transition-colors",
          isDragging && "border-primary bg-primary/5",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
      >
        {uploadDocument.isPending ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Click to upload</span> or drag and drop — PDF, JPG, or PNG
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading documents...</p>
      ) : (
        <div className="space-y-2">
          {documents?.map((doc) => (
            <div key={doc.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{doc.file_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {DOCUMENT_TYPES.find((t) => t.value === doc.doc_type)?.label ?? doc.doc_type}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {doc.is_verified ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </span>
                )}
                {!doc.is_verified && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteDocument.mutate(doc)}
                    disabled={deleteDocument.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
            </div>
          ))}
          {documents?.length === 0 && <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>}
        </div>
      )}
    </div>
  );
}
