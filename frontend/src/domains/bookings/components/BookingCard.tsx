import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Users, MapPin } from "lucide-react";
import { BookingStatus, PaymentStatus } from "../types/booking";
import { BookingStatusBadge, PaymentStatusBadge } from "./BookingStatusBadge";

interface BookingCardProps {
  title: string;
  subtitle?: string;
  dateLabel: string;
  guestLabel?: string;
  locationLabel?: string;
  price?: string;
  status: BookingStatus | string;
  paymentStatus?: PaymentStatus | string;
  notes?: string;
  actions?: ReactNode;
}

export function BookingCard({
  title,
  subtitle,
  dateLabel,
  guestLabel,
  locationLabel,
  price,
  status,
  paymentStatus,
  notes,
  actions,
}: BookingCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate font-display font-semibold text-foreground">{title}</h4>
            {subtitle && <p className="truncate text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <BookingStatusBadge status={status} />
            {paymentStatus && <PaymentStatusBadge status={paymentStatus} />}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" /> {dateLabel}
          </span>
          {guestLabel && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {guestLabel}
            </span>
          )}
          {locationLabel && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {locationLabel}
            </span>
          )}
          {price && <span className="font-semibold text-foreground">{price}</span>}
        </div>

        {notes && <p className="text-xs text-muted-foreground">{notes}</p>}

        {actions && <div className="flex flex-wrap items-center gap-2 pt-1">{actions}</div>}
      </CardContent>
    </Card>
  );
}
