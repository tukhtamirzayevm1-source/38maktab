import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose' | 'indigo';
  badge?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'blue',
  badge,
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400',
      border: 'hover:border-blue-300 dark:hover:border-blue-700',
      badge: 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400',
      border: 'hover:border-emerald-300 dark:hover:border-emerald-700',
      badge: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400',
      border: 'hover:border-amber-300 dark:hover:border-amber-700',
      badge: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400',
      border: 'hover:border-purple-300 dark:hover:border-purple-700',
      badge: 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400',
      border: 'hover:border-rose-300 dark:hover:border-rose-700',
      badge: 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400',
      border: 'hover:border-indigo-300 dark:hover:border-indigo-700',
      badge: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300',
    },
  }[color];

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-md ' + colorMap.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${colorMap.bg}`}>
          <Icon className="w-6 h-6" />
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorMap.badge}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  );
};
