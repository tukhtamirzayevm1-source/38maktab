import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Moon,
  Sun,
  Bell,
  Check,
  LogOut,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { Language } from '../../types';

interface HeaderProps {
  onToggleMobileSidebar: () => void;
  onOpenSearch: () => void;
  onNavigate: (tab: string) => void;
  activeTabTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
  onOpenSearch,
  onNavigate,
  activeTabTitle,
}) => {
  const { currentUser, logout, isAdmin, isTeacher } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useSchoolData();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter relevant notifications for current user
  const relevantNotifs = notifications.filter((n) => {
    if (n.userId && currentUser && n.userId === currentUser.id) return true;
    if (n.targetRole === 'ALL') return true;
    if (currentUser && n.targetRole === currentUser.role) return true;
    return false;
  });

  const unreadCount = relevantNotifs.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const roleColorClass = isAdmin
    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
    : isTeacher
    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
    : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';

  const roleText = isAdmin
    ? t('roleAdmin')
    : isTeacher
    ? t('roleTeacher')
    : t('roleStudent');

  return (
    <header
      id="app-header"
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      {/* Left side: Hamburger & Active Page Title */}
      <div className="flex items-center gap-3">
        <button
          id="mobile-sidebar-toggle-btn"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle navigation menu"
          className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Small Brand on Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
            38
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">
            38-MAKTAB
          </span>
        </div>

        {/* Desktop Page Title */}
        <div className="hidden md:block">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
            {activeTabTitle}
          </h1>
        </div>
      </div>

      {/* Right side: Search, Language, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Bar */}
        <button
          id="header-global-search-btn"
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 bg-slate-100/80 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-xl transition-all border border-slate-200/60 dark:border-slate-700/60"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline">{t('searchPlaceholder')}</span>
          <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700">
            Ctrl+K
          </kbd>
        </button>

        {/* Language Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-bold">
          {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={`px-2 py-1 rounded-lg transition-all ${
                language === lang
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        {/* Theme Switcher */}
        <button
          id="theme-toggle-btn"
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          title={theme === 'light' ? t('themeDark') : t('themeLight')}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-slate-600" />
          ) : (
            <Sun className="w-4 h-4 text-amber-400" />
          )}
        </button>

        {/* Notification Bell with Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            id="notifications-bell-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            aria-label="Notifications"
            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
            )}
          </button>

          {/* Notifications Popover */}
          {isNotifOpen && (
            <div
              id="notifications-popover"
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in duration-150"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{t('navNotifications')}</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-xs bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead(currentUser?.id, currentUser?.role)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Check className="w-3 h-3" />
                    {t('markAllAsRead')}
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {relevantNotifs.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    {t('noNotifications')}
                  </div>
                ) : (
                  relevantNotifs.slice(0, 8).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markNotificationRead(notif.id);
                        if (notif.linkTab) {
                          onNavigate(notif.linkTab);
                          setIsNotifOpen(false);
                        }
                      }}
                      className={`p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors ${
                        !notif.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {notif.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 text-center border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  onClick={() => {
                    onNavigate('notifications');
                    setIsNotifOpen(false);
                  }}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('all')} {t('navNotifications')}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            id="profile-dropdown-btn"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="flex items-center gap-2 p-1 pl-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={
                currentUser?.photoUrl ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
              }
              alt=""
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser?.fullName} {currentUser?.surname?.charAt(0)}.
              </div>
              <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-sm ${roleColorClass}`}>
                {roleText}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <div
              id="profile-dropdown-menu"
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 animate-in fade-in duration-150 p-1.5"
            >
              <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-1">
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {currentUser?.fullName} {currentUser?.surname}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{currentUser?.login}</div>
                <span
                  className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${roleColorClass}`}
                >
                  {roleText}
                </span>
              </div>

              {!isAdmin && (
                <button
                  onClick={() => {
                    onNavigate('profile');
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  {t('navProfile')}
                </button>
              )}

              <button
                onClick={() => {
                  onNavigate('settings');
                  setIsProfileMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
              >
                <UserIcon className="w-4 h-4 text-slate-400" />
                {t('navSettings')}
              </button>

              <div className="my-1 border-t border-slate-100 dark:border-slate-800"></div>

              <button
                id="header-logout-btn"
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                {t('logout')}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
