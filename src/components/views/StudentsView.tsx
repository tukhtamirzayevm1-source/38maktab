import React, { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User, Role } from '../../types';
import { ConfirmModal } from '../common/ConfirmModal';

interface StudentsViewProps {
  onOpenCreateUser: (defaultRole?: Role) => void;
  onViewStudent: (student: User) => void;
  onOpenEditUser: (user: User) => void;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  onOpenCreateUser,
  onViewStudent,
  onOpenEditUser,
}) => {
  const { users, classes, deleteUser, toggleUserStatus } = useSchoolData();
  const { currentUser, isAdmin, isTeacher } = useAuth();
  const { t } = useLanguage();

  const [selectedClassId, setSelectedClassId] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // If teacher, only their classes' students or all students
  const allStudents = users.filter((u) => {
    if (u.role !== 'STUDENT') return false;
    if (isTeacher) {
      // Teacher can see students in their assigned classes or class they lead
      const teacherClassIds = classes
        .filter((c) => c.classTeacherId === currentUser?.id || currentUser?.assignedClasses?.includes(c.id))
        .map((c) => c.id);
      if (teacherClassIds.length > 0 && !teacherClassIds.includes(u.classId || '')) {
        return false;
      }
    }
    return true;
  });

  const filteredStudents = allStudents.filter((st) => {
    if (selectedClassId !== 'ALL' && st.classId !== selectedClassId) return false;
    if (selectedGender !== 'ALL' && st.gender !== selectedGender) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = st.fullName.toLowerCase().includes(q) || st.surname.toLowerCase().includes(q);
      const matchId = st.studentId?.toLowerCase().includes(q);
      const matchPhone = st.phone?.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPhone) return false;
    }
    return true;
  });

  const handleDelete = (student: User) => {
    setDeleteTarget(student);
  };

  return (
    <div id="students-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <GraduationCap className="w-6 h-6 text-blue-600" />
            {isAdmin ? t('navActiveStudents') : t('navMyStudents')} ({filteredStudents.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ro'yxatga olingan barcha faol o'quvchilar ma'lumotlar bazasi
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => onOpenCreateUser('STUDENT')}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('createAccount')}
          </button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Search */}
        <div className="sm:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter by class */}
        <div>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">{t('filterByClass')}: {t('all')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.roomNumber}-xona)
              </option>
            ))}
          </select>
        </div>

        {/* Filter by gender */}
        <div>
          <select
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden"
          >
            <option value="ALL">{t('filterByGender')}: {t('all')}</option>
            <option value="male">{t('male')}</option>
            <option value="female">{t('female')}</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="p-3.5">O'quvchi</th>
                <th className="p-3.5">ID raqami</th>
                <th className="p-3.5">{t('className')}</th>
                <th className="p-3.5">{t('gender')}</th>
                <th className="p-3.5">{t('phone')}</th>
                <th className="p-3.5">{t('parentPhone')}</th>
                <th className="p-3.5">{t('status')}</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    O'quvchilar topilmadi
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr
                    key={st.id}
                    onClick={() => onViewStudent(st)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={st.photoUrl}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white">
                            {st.fullName} {st.surname}
                          </div>
                          <div className="text-[11px] text-slate-400">{st.login}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono text-slate-500 font-medium">{st.studentId}</td>

                    <td className="p-3.5">
                      <span className="font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 px-2.5 py-1 rounded-lg">
                        {st.classId} sinf
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">
                      {st.gender === 'male' ? t('male') : t('female')}
                    </td>

                    <td className="p-3.5 text-slate-500">{st.phone || '—'}</td>

                    <td className="p-3.5 text-slate-700 dark:text-slate-300">
                      <div>{st.parentPhone || '—'}</div>
                      <div className="text-[10px] text-slate-400">{st.parentName}</div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          st.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {st.status === 'active' ? (
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
                          onClick={() => onViewStudent(st)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {isAdmin && (
                          <>
                            <button
                              title={st.status === 'active' ? t('disableAccount') : t('activateAccount')}
                              onClick={() => toggleUserStatus(st.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              {st.status === 'active' ? (
                                <XCircle className="w-4 h-4" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>

                            <button
                              title={t('edit')}
                              onClick={() => onOpenEditUser(st)}
                              className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            <button
                              title={t('delete')}
                              onClick={() => handleDelete(st)}
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
        title="O'quvchini o'chirish"
        message={`"${deleteTarget?.fullName} ${deleteTarget?.surname}" o'quvchi hisobini butunlay o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
