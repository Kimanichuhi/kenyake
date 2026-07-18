import { useState } from "react";
import { useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { RiskScoreBadge } from "../../components/partners/RiskScoreBadge";
import { ChecklistPanel } from "../../components/partners/ChecklistPanel";
import { DocumentViewer } from "../../components/partners/DocumentViewer";
import { StatusTimeline } from "../../components/partners/StatusTimeline";
import { InspectionPanel } from "../../components/partners/InspectionPanel";
import { usePartnerApplicationDetail } from "../../hooks/usePartnerApplicationDetail";
import { BUSINESS_STATUS_LABELS, BusinessStatus } from "../../hooks/usePartnerApplications";
import { useProfileNames } from "../../hooks/useProfileNames";
import { useTransitionBusinessStatus, useUpdateInternalNotes } from "../../hooks/usePartnerVerificationMutations";

interface StatusAction {
  status: BusinessStatus;
  label: string;
  requiresReason: boolean;
  variant: "default" | "outline" | "destructive";
}

const STATUS_ACTIONS: StatusAction[] = [
  { status: "approved", label: "Approve", requiresReason: false, variant: "default" },
  { status: "rejected", label: "Reject", requiresReason: true, variant: "destructive" },
  { status: "suspended", label: "Suspend", requiresReason: true, variant: "destructive" },
  { status: "archived", label: "Archive", requiresReason: false, variant: "outline" },
  { status: "documents_requested", label: "Request Documents", requiresReason: false, variant: "outline" },
];

function DetailField({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value === null || value === undefined || value === "" ? "—" : value}</p>
    </div>
  );
}

const PartnerApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data: business, isLoading } = usePartnerApplicationDetail(id);
  const { data: reviewerNames } = useProfileNames([
    business?.business_verification?.assigned_reviewer_id,
    business?.business_verification?.last_reviewed_by,
  ]);

  const transitionStatus = useTransitionBusinessStatus();
  const updateInternalNotes = useUpdateInternalNotes();

  const [pendingAction, setPendingAction] = useState<StatusAction | null>(null);
  const [reason, setReason] = useState("");
  const [internalNotes, setInternalNotes] = useState<string | null>(null);

  if (isLoading || !business) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const verification = business.business_verification;
  const notesValue = internalNotes ?? verification?.internal_notes ?? "";

  const handleConfirmAction = () => {
    if (!pendingAction || !id) return;
    transitionStatus.mutate(
      { businessId: id, newStatus: pendingAction.status, reason: reason || undefined },
      {
        onSuccess: () => {
          setPendingAction(null);
          setReason("");
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-2xl font-semibold text-foreground">{business.name}</h1>
            {business.business_categories && <Badge variant="outline">{business.business_categories.label}</Badge>}
            {verification && (
              <Badge>{BUSINESS_STATUS_LABELS[verification.status] ?? verification.status}</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {verification && (
              <RiskScoreBadge
                riskLevel={verification.risk_level}
                riskScore={verification.risk_score}
                confidencePercentage={verification.confidence_percentage}
              />
            )}
            {verification?.last_reviewed_at && (
              <span className="text-xs text-muted-foreground">
                Last reviewed by {reviewerNames?.[verification.last_reviewed_by ?? ""] ?? "…"} ·{" "}
                {formatDistanceToNow(new Date(verification.last_reviewed_at), { addSuffix: true })}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {STATUS_ACTIONS.map((action) => (
            <Button
              key={action.status}
              size="sm"
              variant={action.variant}
              disabled={verification?.status === action.status}
              onClick={() => {
                setPendingAction(action);
                setReason("");
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="flex-wrap">
          <TabsTrigger value="details">Business Details</TabsTrigger>
          <TabsTrigger value="documents">Documents ({business.business_documents.length})</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="inspections">Inspections</TabsTrigger>
          <TabsTrigger value="history">Status History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <DetailField label="Registration number" value={business.registration_number} />
              <DetailField label="KRA PIN" value={business.kra_pin} />
              <DetailField label="Year established" value={business.year_established} />
              <DetailField label="Website" value={business.website_url} />
              <DetailField label="WhatsApp" value={business.whatsapp_number} />
              <DetailField label="Facebook" value={business.facebook_url} />
              <DetailField label="Instagram" value={business.instagram_url} />
              <DetailField label="Twitter / X" value={business.twitter_url} />
              <DetailField label="County" value={business.county} />
              <DetailField label="Sub-county" value={business.sub_county} />
              <DetailField label="Ward" value={business.ward} />
              <DetailField label="Address" value={business.address_line} />
              <DetailField label="Postal code" value={business.postal_code} />
              <DetailField label="Nearby landmark" value={business.nearby_landmark} />
              <DetailField label="Coordinates" value={business.lat && business.lng ? `${business.lat}, ${business.lng}` : null} />
              <DetailField label="Bank" value={business.bank_name} />
              <DetailField label="Bank account name" value={business.bank_account_name} />
              <DetailField label="Bank account number" value={business.bank_account_number} />
              <DetailField label="Bank branch" value={business.bank_branch} />
              <DetailField label="M-Pesa till" value={business.mpesa_till_number} />
              <DetailField label="M-Pesa paybill" value={business.mpesa_paybill_number} />
            </CardContent>
          </Card>

          {business.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{business.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Contacts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {business.business_contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No contacts on file.</p>
              ) : (
                business.business_contacts.map((contact) => (
                  <div key={contact.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border p-2 text-sm">
                    <div>
                      <span className="font-medium text-foreground">{contact.full_name}</span>
                      {contact.designation && <span className="text-muted-foreground"> · {contact.designation}</span>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Badge variant="outline" className="capitalize">
                        {contact.role}
                      </Badge>
                      {contact.email && <span>{contact.email}</span>}
                      {contact.phone && <span>{contact.phone}</span>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-3">
          {business.business_documents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {business.business_documents.map((doc) => (
                <DocumentViewer key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="checklist">
          {id && <ChecklistPanel businessId={id} checklist={business.business_verification_checklist} />}
        </TabsContent>

        <TabsContent value="inspections">{id && <InspectionPanel businessId={id} />}</TabsContent>

        <TabsContent value="history">{id && <StatusTimeline businessId={id} />}</TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Internal notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={notesValue}
            onChange={(e) => setInternalNotes(e.target.value)}
            rows={4}
            placeholder="Notes visible to reviewers only..."
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              disabled={updateInternalNotes.isPending || !id}
              onClick={() => id && updateInternalNotes.mutate({ businessId: id, internalNotes: notesValue })}
            >
              Save notes
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => {
          if (!open) {
            setPendingAction(null);
            setReason("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.label} "{business.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              This changes the application status to "{pendingAction ? BUSINESS_STATUS_LABELS[pendingAction.status] : ""}"
              and is recorded in the status history{pendingAction?.requiresReason ? " along with your reason." : "."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingAction?.requiresReason && (
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Reason (required, shown to the business owner)..."
              rows={3}
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={(pendingAction?.requiresReason && !reason.trim()) || transitionStatus.isPending}
              className={
                pendingAction?.variant === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
              onClick={handleConfirmAction}
            >
              {pendingAction?.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnerApplicationDetail;
