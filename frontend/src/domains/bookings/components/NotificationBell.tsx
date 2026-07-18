import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "../hooks/useNotifications";
import { NotificationRow } from "../types/booking";

export function NotificationBell() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: notifications, unreadCount, markAsRead } = useNotifications();

  if (!user) return null;

  const handleClick = (n: NotificationRow) => {
    if (!n.is_read) markAsRead.mutate(n.id);
    if (n.link_path) navigate(n.link_path);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative text-primary-foreground/80 hover:text-savannah-gold hover:bg-primary-foreground/10"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b border-border px-4 py-2.5">
          <p className="text-sm font-semibold text-foreground">Notifications</p>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {!notifications || notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications yet.</p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={`block w-full border-b border-border px-4 py-3 text-left text-sm transition-colors last:border-b-0 hover:bg-muted ${
                  n.is_read ? "" : "bg-primary/5"
                }`}
              >
                <p className="font-medium text-foreground">{n.title}</p>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground/70">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
