import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, ExternalLink, FileText, Loader2, X } from "lucide-react";
import { BusinessDocumentRow } from "../../hooks/usePartnerApplicationDetail";
import { useRejectDocument, useVerifyDocument } from "../../hooks/usePartnerVerificationMutations";

const DOCUMENTS_BUCKET = "business-documents";

const DOC_TYPE_LABELS: Record<string, string> = {
  national_id: "National ID",
  passport: "Passport",
  business_registration_certificate: "Business Registration Certificate",
  kra_pin_certificate: "KRA PIN Certificate",
  tourism_license: "Tourism License",
  insurance_certificate: "Insurance Certificate",
  tax_compliance_certificate: "Tax Compliance Certificate",
  other: "Other",
};

interface DocumentViewerProps {
  document: BusinessDocumentRow;
}

export function DocumentViewer({ document }: DocumentViewerProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const { data: signedUrl, isLoading } = useQuery({
    queryKey: ["admin-document-signed-url", document.storage_path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUrl(document.storage_path, 300);
      if (error) throw error;
      return data.signedUrl;
    },
    staleTime: 4 * 60 * 1000,
  });

  const verifyDocument = useVerifyDocument();
  const rejectDocument = useRejectDocument();

  const isImage = document.mime_type?.startsWith("image/");
  const isPdf = document.mime_type === "application/pdf";

  return (
    <div className="space-y-3 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">{document.file_name}</p>
          <p className="text-xs text-muted-foreground">{DOC_TYPE_LABELS[document.doc_type] ?? document.doc_type}</p>
        </div>
        {document.is_verified ? (
          <Badge className="border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            Verified
          </Badge>
        ) : document.rejection_reason ? (
          <Badge variant="destructive">Rejected</Badge>
        ) : (
          <Badge variant="outline">Pending review</Badge>
        )}
      </div>

      <div className="flex min-h-24 items-center justify-center rounded-md bg-muted">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        ) : !signedUrl ? (
          <FileText className="h-8 w-8 text-muted-foreground" />
        ) : isImage ? (
          <img
            src={signedUrl}
            alt={document.file_name}
            className="max-h-64 w-full rounded-md object-contain"
          />
        ) : isPdf ? (
          <iframe title={document.file_name} src={signedUrl} className="h-64 w-full rounded-md border-0" />
        ) : (
          <a
            href={signedUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 py-6 text-sm text-primary underline-offset-2 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> Open in new tab
          </a>
        )}
      </div>

      {document.rejection_reason && (
        <p className="text-xs text-destructive">Rejection reason: {document.rejection_reason}</p>
      )}

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={document.is_verified || verifyDocument.isPending}
          onClick={() => verifyDocument.mutate({ documentId: document.id, businessId: document.business_id })}
        >
          <Check className="mr-1.5 h-3.5 w-3.5" /> Verify
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-destructive hover:text-destructive"
          onClick={() => setRejectOpen(true)}
        >
          <X className="mr-1.5 h-3.5 w-3.5" /> Reject
        </Button>
      </div>

      <AlertDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) setReason("");
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject "{document.file_name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejection — this is recorded and visible to the business owner.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (required)..."
            rows={3}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!reason.trim() || rejectDocument.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                rejectDocument.mutate({ documentId: document.id, businessId: document.business_id, reason });
                setRejectOpen(false);
                setReason("");
              }}
            >
              Reject document
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
