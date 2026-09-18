import React, { useState } from 'react';
import {
  UserCheck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  BookOpen,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User, Role } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface TeachersViewProps {
  onOpenCreateUser: (defaultRole?: Role) => void;
  onViewTeacher: (teacher: User) => void;
  onOpenEditUser: (user: User) => void;
}

export const TeachersView: React.FC<TeachersViewProps> = ({
  onOpenCreateUser,
  onViewTeacher,
  onOpenEditUser,
}) => {
  const { users, deleteUser, toggleUserStatus } = useSchoolData();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const teachers = users.filter((u) => u.role === 'TEACHER');

  const filteredTeachers = teachers.filter((tch) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = tch.fullName.toLowerCase().includes(q) || tch.surname.toLowerCase().includes(q);
      const matchSub = tch.subjects?.some((s) => s.toLowerCase().includes(q));
      const matchPhone = tch.phone?.toLowerCase().includes(q);
      if (!matchName && !matchSub && !matchPhone) return false;
    }
    return true;
  });

  const handleDelete = (tch: User) => {
    setDeleteTarget(tch);
  };

  return (
    <div id="teachers-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-purple-600" />
            {t('navActiveTeachers')} ({filteredTeachers.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maktab pedagogik jamoasi, fan mutaxassislari va sinf rahbarlari
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onOpenCreateUser('TEACHER')}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('createAccount')}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="O'qituvchi ismi yoki fani bo'yicha qidirish..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Teachers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">O'qituvchi</th>
                <th className="p-3.5">ID raqami</th>
                <th className="p-3.5">Fanlar</th>
                <th className="p-3.5">Sinflar</th>
                <th className="p-3.5">{t('phone')}</th>
                <th className="p-3.5">{t('email')}</th>
                <th className="p-3.5">{t('status')}</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    O'qituvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((tch) => (
                  <tr
                    key={tch.id}
                    onClick={() => onViewTeacher(tch)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={tch.photoUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {tch.fullName} {tch.surname}
                          </div>
                          <div className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                            {tch.position}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-500 font-medium">{tch.teacherId}</td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {tch.subjects?.map((sub, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold rounded-md text-[10px]"
                          >
                            {sub}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">
                      {tch.assignedClasses?.join(', ') || 'Barchasi'}
                    </td>

                    <td className="p-3.5 text-slate-500">{tch.phone}</td>

                    <td className="p-3.5 text-slate-500">{tch.email}</td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          tch.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {tch.status === 'active' ? (
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
                        <button
                          title="Profilni ko'rish"
                          onClick={() => onViewTeacher(tch)}
                          className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              title={tch.status === 'active' ? t('disableAccount') : t('activateAccount')}
                              onClick={() => toggleUserStatus(tch.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {tch.status === 'active' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              title={t('edit')}
                              onClick={() => onOpenEditUser(tch)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              title={t('delete')}
                              onClick={() => handleDelete(tch)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
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
        title="O'qituvchini o'chirish"
        message={`"${deleteTarget?.fullName} ${deleteTarget?.surname}" o'qituvchi hisobini butunlay o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
