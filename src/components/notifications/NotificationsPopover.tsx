import React from "react";
import { useNavigate } from "react-router-dom";

export interface NotificationItem {
  id: string;
  type: "critical" | "success" | "warning" | "info";
  title: string;
  message: string;
  time: string;
  path?: string;
  read: boolean;
}

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClickItem = (item: NotificationItem) => {
    if (item.path) {
      navigate(item.path);
      onClose();
    }
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "critical":
        return <span className="material-symbols-outlined text-error text-[18px]">gpp_bad</span>;
      case "success":
        return <span className="material-symbols-outlined text-[#4ade80] text-[18px]">check_circle</span>;
      case "warning":
        return <span className="material-symbols-outlined text-secondary text-[18px]">warning</span>;
      default:
        return <span className="material-symbols-outlined text-outline text-[18px]">info</span>;
    }
  };

  return (
    <>
      {/* Click outside backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Popover Card */}
      <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-surface-container border border-white/10 shadow-2xl z-50 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 bg-surface-container-high border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-primary">
              notifications
            </span>
            <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Telemetry Notifications
            </span>
          </div>
          <button
            onClick={onMarkAllRead}
            className="text-[11px] font-code-sm text-outline hover:text-on-surface transition-colors"
          >
            Mark all read
          </button>
        </div>

        {/* List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-outline text-xs">
              No recent notifications
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClickItem(n)}
                className={`p-3.5 flex items-start gap-3 hover:bg-surface-container-high transition-colors cursor-pointer ${
                  !n.read ? "bg-surface-container-low/40" : ""
                }`}
              >
                <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                      {n.title}
                    </span>
                    <span className="text-[10px] text-outline shrink-0">
                      {n.time}
                    </span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant line-clamp-2">
                    {n.message}
                  </p>
                  {n.path && (
                    <span className="text-[10px] text-primary font-code-sm pt-1">
                      View details →
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-2.5 bg-surface-container-lowest border-t border-white/5 flex items-center justify-between text-[11px] font-code-sm text-outline">
          <span>Base Node Cluster 8453</span>
          <span className="text-secondary font-medium">Auto-poll Active</span>
        </div>
      </div>
    </>
  );
};
