import { useState } from "react";
import { Link } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { Bell, Check, CheckCheck, FileText, X, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";

export function NotificationDropdown() {
  const { role } = useAuth();
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, dismissNotification } = useNotifications();
  const [open, setOpen] = useState(false);

  const getComplaintPath = (complaintId: string | null) => {
    if (!complaintId) return null;
    switch (role) {
      case "citizen":
        return `/citizen/complaints/${complaintId}`;
      case "authority":
        return `/authority/complaints/${complaintId}`;
      case "admin":
        return `/admin/complaints/${complaintId}`;
      default:
        return null;
    }
  };

  const handleNotificationClick = async (notification: typeof notifications[0]) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-xl">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--severity-critical))] text-[10px] font-medium text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <DropdownMenuLabel className="font-semibold p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs rounded-lg"
              onClick={(e) => {
                e.preventDefault();
                markAllAsRead();
              }}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[360px] max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                <Bell className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => {
                const complaintPath = getComplaintPath(notification.complaint_id);

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "relative flex gap-3 p-3 rounded-xl transition-colors cursor-pointer group",
                      notification.is_read
                        ? "bg-transparent hover:bg-muted/50"
                        : "bg-primary/5 hover:bg-primary/10"
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-primary" />
                    )}

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>

                    <div className="flex-1 min-w-0">
                      {complaintPath ? (
                        <Link
                          to={complaintPath}
                          className="text-sm font-medium hover:underline block truncate"
                          onClick={() => setOpen(false)}
                        >
                          {notification.title}
                        </Link>
                      ) : (
                        <p className="text-sm font-medium truncate">{notification.title}</p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-md"
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <DropdownMenuSeparator />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
