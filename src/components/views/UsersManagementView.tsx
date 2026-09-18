import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Key,
  Trash2,
  Edit2,
  CheckCircle,
  XCircle,
  Eye,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Filter,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Role, User } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface UsersManagementViewProps {
  onOpenCreateUser: (defaultRole?: Role) => void;
  onOpenEditUser: (user: User) => void;
  onViewStudent: (student: User) => void;
  onViewTeacher: (teacher: User) => void;
}

export const UsersManagementView: React.FC<UsersManagementViewProps> = ({
  onOpenCreateUser,
  onOpenEditUser,
  onViewStudent,
  onViewTeacher,
}) => {
  const { users, deleteUser, toggleUserStatus } = useSchoolData();
  const { t } = useLanguage();

  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.fullName.toLowerCase().includes(q) || u.surname.toLowerCase().includes(q);
      const matchLogin = u.login.toLowerCase().includes(q);
      const matchClass = u.classId?.toLowerCase().includes(q);
      if (!matchName && !matchLogin && !matchClass) return false;
    }
    return true;
  });

  const handleDelete = (user: User) => {
    if (user.role === 'ADMIN') return;
    setDeleteTarget(user);
  };

  const handleRowClick = (user: User) => {
    if (user.role === 'STUDENT') {
      onViewStudent(user);
    } else if (user.role === 'TEACHER') {
      onViewTeacher(user);
    }
  };

  return (
    <div id="users-management-view" className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-blue-600" />
            {t('navUsers')} ({users.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            O'qituvchilar, o'quvchilar va ma'muriyat hisoblarini yaratish, tahrirlash va boshqarish
          </p>
        </div>

        <button
          id="users-create-account-btn"
          onClick={() => onOpenCreateUser('STUDENT')}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          {t('createAccount')}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['ALL', 'STUDENT', 'TEACHER', 'ADMIN'] as ('ALL' | Role)[]).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                roleFilter === r
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {r === 'ALL'
                ? t('all')
                : r === 'STUDENT'
                ? t('studentRole')
                : r === 'TEACHER'
                ? t('teacherRole')
                : t('roleAdmin')}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            id="users-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Foydalanuvchi</th>
                <th className="p-3.5">{t('role')}</th>
                <th className="p-3.5">{t('className')} / Fan</th>
                <th className="p-3.5">{t('loginField')}</th>
                <th className="p-3.5">{t('phone')}</th>
                <th className="p-3.5">{t('status')}</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const roleBadgeClass =
                    u.role === 'ADMIN'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : u.role === 'TEACHER'
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                      onClick={() => handleRowClick(u)}
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.photoUrl}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {u.fullName} {u.surname}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {u.studentId || u.teacherId || u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[10px] ${roleBadgeClass}`}>
                          {u.role === 'ADMIN' ? 'ADMIN' : u.role === 'TEACHER' ? "O'QITUVCHI" : "O'QUVCHI"}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {u.role === 'STUDENT' && (
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {u.classId} sinf
                          </span>
                        )}
                        {u.role === 'TEACHER' && (
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {u.subjects?.slice(0, 2).join(', ') || u.position}
                          </span>
                        )}
                        {u.role === 'ADMIN' && <span className="text-slate-400">Boshqaruv</span>}
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {u.login}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500">{u.phone || '—'}</td>

                      <td className="p-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            u.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              {t('active')}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" />
                              {t('disabled')}
                            </>
                          )}
                        </span>
                      </td>

                      <td className="p-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Status */}
                          <button
                            title={u.status === 'active' ? t('disableAccount') : t('activateAccount')}
                            onClick={() => toggleUserStatus(u.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {u.status === 'active' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit info & Change Password */}
                          <button
                            title={t('edit')}
                            onClick={() => onOpenEditUser(u)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete (Cannot delete Admin) */}
                          {u.role !== 'ADMIN' && (
                            <button
                              title={t('delete')}
                              onClick={() => handleDelete(u)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteUser(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Foydalanuvchi hisobini o'chirish"
        message={`"${deleteTarget?.fullName} ${deleteTarget?.surname}" (${deleteTarget?.role}) hisobini butunlay o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
