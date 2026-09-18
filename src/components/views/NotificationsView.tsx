import React from 'react';
import { Bell, Check, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface NotificationsViewProps {
  onNavigate: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSchoolData();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const userNotifs = notifications.filter((n) => {
    if (n.userId && currentUser && n.userId === currentUser.id) return true;
    if (n.targetRole === 'ALL') return true;
    if (currentUser && n.targetRole === currentUser.role) return true;
    return false;
  });

  return (
    <div id="notifications-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-500" />
            {t('navNotifications')} ({userNotifs.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Tizim yangiliklari, qo'yilgan baholar, berilgan vazifalar va muhim eslatmalar
          </p>
        </div>

        {userNotifs.some((n) => !n.isRead) && (
          <button
            onClick={() => markAllNotificationsRead(currentUser?.id, currentUser?.role)}
            className="px-4 py-2 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <Check className="w-4 h-4" />
            {t('markAllAsRead')}
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {userNotifs.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
            {t('noNotifications')}
          </div>
        ) : (
          userNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.linkTab) onNavigate(n.linkTab);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                !n.isRead
                  ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60 shadow-xs'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {n.title}
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">
                    • {n.timestamp}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {n.message}
                </p>
              </div>

              {n.linkTab && (
                <div className="shrink-0 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  <span>O'tish</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
