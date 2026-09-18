import React from 'react';
import {
  LayoutDashboard,
  Layers,
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
  CalendarCheck,
  Award,
  CheckSquare,
  FileSpreadsheet,
  Clock,
  Bell,
  MessageSquare,
  BarChart3,
  Settings,
  User as UserIcon,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useSchoolData } from '../../context/SchoolDataContext';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { currentUser, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();
  const { notifications, messages } = useSchoolData();

  // Calculate unread chat messages for current user
  const unreadMessagesCount = messages.filter(
    (m) => m.senderId !== currentUser?.id && !m.isRead
  ).length;

  const unreadNotifsCount = notifications.filter(
    (n) =>
      !n.isRead &&
      (!n.userId || n.userId === currentUser?.id) &&
      (!n.targetRole || n.targetRole === 'ALL' || n.targetRole === currentUser?.role)
  ).length;

  // Build items based on role strictly matching specifications
  let navItems: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number }[] = [];

  if (isAdmin) {
    navItems = [
      { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
      { id: 'active-classes', label: t('navActiveClasses'), icon: Layers },
      { id: 'active-students', label: t('navActiveStudents'), icon: GraduationCap },
      { id: 'active-teachers', label: t('navActiveTeachers'), icon: UserCheck },
      { id: 'users', label: t('navUsers'), icon: Users },
      { id: 'subjects', label: t('navSubjects'), icon: BookOpen },
      { id: 'attendance', label: t('navAttendance'), icon: CalendarCheck },
      { id: 'grades', label: t('navGrades'), icon: Award },
      { id: 'homework', label: t('navHomework'), icon: CheckSquare },
      { id: 'exams', label: t('navExams'), icon: FileSpreadsheet },
      { id: 'schedule', label: t('navSchedule'), icon: Clock },
      { id: 'announcements', label: t('navAnnouncements'), icon: Bell },
      { id: 'chat', label: t('navChat'), icon: MessageSquare, badge: unreadMessagesCount },
      { id: 'notifications', label: t('navNotifications'), icon: Bell, badge: unreadNotifsCount },
      { id: 'reports', label: t('navReports'), icon: BarChart3 },
      { id: 'settings', label: t('navSettings'), icon: Settings },
    ];
  } else if (isTeacher) {
    navItems = [
      { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
      { id: 'my-classes', label: t('navMyClasses'), icon: Layers },
      { id: 'my-students', label: t('navMyStudents'), icon: GraduationCap },
      { id: 'attendance', label: t('navAttendance'), icon: CalendarCheck },
      { id: 'grades', label: t('navGrades'), icon: Award },
      { id: 'homework', label: t('navHomework'), icon: CheckSquare },
      { id: 'exams', label: t('navExams'), icon: FileSpreadsheet },
      { id: 'schedule', label: t('navSchedule'), icon: Clock },
      { id: 'chat', label: t('navChat'), icon: MessageSquare, badge: unreadMessagesCount },
      { id: 'announcements', label: t('navAnnouncements'), icon: Bell },
      { id: 'notifications', label: t('navNotifications'), icon: Bell, badge: unreadNotifsCount },
      { id: 'profile', label: t('navProfile'), icon: UserIcon },
      { id: 'settings', label: t('navSettings'), icon: Settings },
    ];
  } else if (isStudent) {
    navItems = [
      { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
      { id: 'my-class', label: t('navMyClass'), icon: Layers },
      { id: 'my-grades', label: t('navMyGrades'), icon: Award },
      { id: 'my-attendance', label: t('navMyAttendance'), icon: CalendarCheck },
      { id: 'homework', label: t('navHomework'), icon: CheckSquare },
      { id: 'exams', label: t('navExams'), icon: FileSpreadsheet },
      { id: 'schedule', label: t('navSchedule'), icon: Clock },
      { id: 'chat', label: t('navChat'), icon: MessageSquare, badge: unreadMessagesCount },
      { id: 'announcements', label: t('navAnnouncements'), icon: Bell },
      { id: 'notifications', label: t('navNotifications'), icon: Bell, badge: unreadNotifsCount },
      { id: 'profile', label: t('navProfile'), icon: UserIcon },
      { id: 'settings', label: t('navSettings'), icon: Settings },
    ];
  }

  const handleSelect = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          id="sidebar-mobile-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 md:w-72 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white font-black text-xl shadow-md tracking-tight">
              38
            </div>
            <div>
              <div className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
                38-MAKTAB
              </div>
              <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5 tracking-wider uppercase">
                {isAdmin ? 'Boshqaruv' : isTeacher ? 'O\'qituvchi' : 'O\'quvchi'}
              </div>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg md:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 group text-left ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-blue-600'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img
                src={
                  currentUser?.photoUrl ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
                }
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
              <div className="truncate">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {currentUser?.fullName} {currentUser?.surname}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {currentUser?.login}
                </div>
              </div>
            </div>

            <button
              id="sidebar-logout-btn"
              onClick={logout}
              title={t('logout')}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
