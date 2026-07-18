import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Camera, Loader2, MapPin, Plus, XCircle } from "lucide-react";
import {
  BusinessInspectionRow,
  InspectionPhoto,
  useBusinessInspections,
} from "../../hooks/usePartnerApplicationDetail";
import {
  useCancelInspection,
  useScheduleInspection,
  useUpdateInspection,
  useUploadInspectionPhoto,
} from "../../hooks/usePartnerVerificationMutations";
import { useProfileNames } from "../../hooks/useProfileNames";

const DOCUMENTS_BUCKET = "business-documents";

const OUTCOME_BADGE: Record<string, string> = {
  pass: "border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  fail: "border-transparent bg-destructive/15 text-destructive",
  conditional: "border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
};

function InspectionPhotoThumb({ photo }: { photo: InspectionPhoto }) {
  const { data: signedUrl } = useQuery({
    queryKey: ["admin-inspection-photo-url", photo.storage_path],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .createSignedUrl(photo.storage_path, 300);
      if (error) throw error;
      return data.signedUrl;
    },
    staleTime: 4 * 60 * 1000,
  });

  if (!signedUrl) {
    return <div className="h-16 w-16 animate-pulse rounded-md bg-muted" />;
  }

  return (
    <a href={signedUrl} target="_blank" rel="noreferrer">
      <img src={signedUrl} alt={photo.caption ?? "Inspection photo"} className="h-16 w-16 rounded-md border border-border object-cover" />
    </a>
  );
}

function ScheduleInspectionDialog({ businessId, open, onOpenChange }: { businessId: string; open: boolean; onOpenChange: (o: boolean) => void }) {
  const { user } = useAuth();
  const [scheduledAt, setScheduledAt] = useState("");
  const [inspectorId, setInspectorId] = useState("");
  const scheduleInspection = useScheduleInspection();

  const handleSubmit = () => {
    if (!scheduledAt) return;
    scheduleInspection.mutate(
      {
        businessId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        inspectorId: inspectorId.trim() || user?.id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setScheduledAt("");
          setInspectorId("");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Date &amp; time</Label>
            <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Inspector user ID (optional — defaults to you)</Label>
            <Input
              value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value)}
              placeholder={user?.id ?? "Inspector user id"}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!scheduledAt || scheduleInspection.isPending}>
            {scheduleInspection.isPending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CompleteInspectionDialog({
  businessId,
  inspection,
  onOpenChange,
}: {
  businessId: string;
  inspection: BusinessInspectionRow;
  onOpenChange: (o: boolean) => void;
}) {
  const [outcome, setOutcome] = useState<"pass" | "fail" | "conditional">("pass");
  const [recommendation, setRecommendation] = useState("");
  const [notes, setNotes] = useState("");
  const [gpsLat, setGpsLat] = useState(inspection.gps_lat != null ? String(inspection.gps_lat) : "");
  const [gpsLng, setGpsLng] = useState(inspection.gps_lng != null ? String(inspection.gps_lng) : "");
  const [checklistJson, setChecklistJson] = useState(JSON.stringify(inspection.checklist ?? {}, null, 2));
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [locating, setLocating] = useState(false);

  const updateInspection = useUpdateInspection();
  const uploadPhoto = useUploadInspectionPhoto();

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLat(String(pos.coords.latitude));
        setGpsLng(String(pos.coords.longitude));
        setLocating(false);
      },
      () => setLocating(false),
    );
  };

  const handleSubmit = async () => {
    let checklist: Record<string, unknown> = inspection.checklist ?? {};
    try {
      checklist = checklistJson.trim() ? JSON.parse(checklistJson) : {};
    } catch {
      // keep original checklist if the JSON is invalid rather than blocking submission
    }

    let photos = inspection.photos ?? [];
    if (photoFile) {
      const uploaded = await uploadPhoto.mutateAsync({ businessId, inspectionId: inspection.id, file: photoFile });
      photos = [...photos, uploaded];
    }

    updateInspection.mutate(
      {
        inspectionId: inspection.id,
        businessId,
        patch: {
          status: "completed",
          completed_at: new Date().toISOString(),
          outcome,
          recommendation: recommendation || null,
          notes: notes || null,
          gps_lat: gpsLat ? Number(gpsLat) : null,
          gps_lng: gpsLng ? Number(gpsLng) : null,
          gps_captured_at: gpsLat && gpsLng ? new Date().toISOString() : null,
          checklist,
          photos,
        },
      },
      { onSuccess: () => onOpenChange(false) },
    );
  };

  const pending = updateInspection.isPending || uploadPhoto.isPending;

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Complete inspection</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Outcome</Label>
            <Select value={outcome} onValueChange={(v) => setOutcome(v as typeof outcome)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pass">Pass</SelectItem>
                <SelectItem value="conditional">Conditional</SelectItem>
                <SelectItem value="fail">Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Recommendation</Label>
            <Textarea value={recommendation} onChange={(e) => setRecommendation(e.target.value)} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>GPS latitude</Label>
              <Input type="number" step="any" value={gpsLat} onChange={(e) => setGpsLat(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>GPS longitude</Label>
              <Input type="number" step="any" value={gpsLng} onChange={(e) => setGpsLng(e.target.value)} />
            </div>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={useMyLocation} disabled={locating}>
            <MapPin className="mr-1.5 h-3.5 w-3.5" />
            {locating ? "Locating…" : "Use my current location"}
          </Button>
          <div className="space-y-1.5">
            <Label>Checklist (JSON, optional)</Label>
            <Textarea
              value={checklistJson}
              onChange={(e) => setChecklistJson(e.target.value)}
              rows={4}
              className="font-mono text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Add photo</Label>
            <Input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={pending}>
            {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
            Complete inspection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface InspectionPanelProps {
  businessId: string;
}

export function InspectionPanel({ businessId }: InspectionPanelProps) {
  const { data: inspections, isLoading } = useBusinessInspections(businessId);
  const { data: names } = useProfileNames((inspections ?? []).map((i) => i.inspector_id));
  const cancelInspection = useCancelInspection();

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [completingInspection, setCompletingInspection] = useState<BusinessInspectionRow | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setScheduleOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" /> Schedule inspection
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : !inspections || inspections.length === 0 ? (
        <p className="text-sm text-muted-foreground">No inspections scheduled yet.</p>
      ) : (
        <div className="space-y-3">
          {inspections.map((inspection) => (
            <div key={inspection.id} className="space-y-2 rounded-md border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {inspection.scheduled_at
                    ? format(new Date(inspection.scheduled_at), "PPp")
                    : "No date set"}
                </div>
                <div className="flex items-center gap-2">
                  {inspection.outcome && (
                    <Badge variant="outline" className={OUTCOME_BADGE[inspection.outcome]}>
                      {inspection.outcome}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="capitalize">
                    {inspection.status}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Inspector: {inspection.inspector_id ? names?.[inspection.inspector_id] ?? "…" : "Unassigned"}
                {inspection.completed_at &&
                  ` · Completed ${formatDistanceToNow(new Date(inspection.completed_at), { addSuffix: true })}`}
              </p>

              {(inspection.gps_lat != null || inspection.gps_lng != null) && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {inspection.gps_lat}, {inspection.gps_lng}
                </p>
              )}

              {inspection.recommendation && (
                <p className="text-sm text-foreground">{inspection.recommendation}</p>
              )}
              {inspection.notes && <p className="text-xs text-muted-foreground">{inspection.notes}</p>}

              {inspection.photos && inspection.photos.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  {inspection.photos.map((photo, i) => (
                    <InspectionPhotoThumb key={photo.storage_path + i} photo={photo} />
                  ))}
                </div>
              )}

              {inspection.status === "scheduled" && (
                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={() => setCompletingInspection(inspection)}>
                    Complete inspection
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground"
                    disabled={cancelInspection.isPending}
                    onClick={() => cancelInspection.mutate({ inspectionId: inspection.id, businessId })}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Cancel
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ScheduleInspectionDialog businessId={businessId} open={scheduleOpen} onOpenChange={setScheduleOpen} />

      {completingInspection && (
        <CompleteInspectionDialog
          businessId={businessId}
          inspection={completingInspection}
          onOpenChange={(open) => !open && setCompletingInspection(null)}
        />
      )}
    </div>
  );
}
