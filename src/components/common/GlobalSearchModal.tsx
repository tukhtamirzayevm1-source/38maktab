import React, { useState, useEffect } from 'react';
import { Search, X, Users, GraduationCap, BookOpen, Layers, Bell, CheckSquare } from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, extraData?: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const { users, classes, subjects, homework, announcements } = useSchoolData();
  const { isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isOpen) setQuery('');
  }, [isOpen]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search sets based on role
  const students = (isAdmin || isTeacher)
    ? users.filter((u) => u.role === 'STUDENT' && (
        u.fullName.toLowerCase().includes(cleanQuery) ||
        u.surname.toLowerCase().includes(cleanQuery) ||
        (u.studentId && u.studentId.toLowerCase().includes(cleanQuery)) ||
        (u.classId && u.classId.toLowerCase().includes(cleanQuery))
      ))
    : [];

  const teachers = isAdmin
    ? users.filter((u) => u.role === 'TEACHER' && (
        u.fullName.toLowerCase().includes(cleanQuery) ||
        u.surname.toLowerCase().includes(cleanQuery) ||
        (u.position && u.position.toLowerCase().includes(cleanQuery)) ||
        (u.subjects && u.subjects.some((s) => s.toLowerCase().includes(cleanQuery)))
      ))
    : [];

  const foundClasses = (isAdmin || isTeacher)
    ? classes.filter((c) =>
        c.name.toLowerCase().includes(cleanQuery) ||
        c.classTeacherName.toLowerCase().includes(cleanQuery)
      )
    : [];

  const foundSubjects = subjects.filter((s) =>
    s.name.toLowerCase().includes(cleanQuery) ||
    s.description.toLowerCase().includes(cleanQuery)
  );

  const foundHomework = isStudent
    ? homework.filter((h) =>
        h.title.toLowerCase().includes(cleanQuery) ||
        h.subjectName.toLowerCase().includes(cleanQuery)
      )
    : [];

  const foundAnnouncements = announcements.filter((a) =>
    a.title.toLowerCase().includes(cleanQuery) ||
    a.description.toLowerCase().includes(cleanQuery)
  );

  const handleSelect = (tab: string, extra?: any) => {
    onNavigate(tab, extra);
    onClose();
  };

  return (
    <div
      id="global-search-backdrop"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="global-search-container"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Input bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            id="global-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full bg-transparent border-0 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden text-base"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!cleanQuery && (
            <div className="text-center py-8 text-sm text-slate-400">
              Ism, sinf, fan yoki e'lonlar bo'yicha qidirish uchun matn kiriting...
            </div>
          )}

          {cleanQuery && (
            <>
              {/* Students */}
              {students.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    {t('navStudents')} ({students.length})
                  </div>
                  <div className="space-y-1">
                    {students.slice(0, 5).map((s) => (
                      <button
                        key={s.id}
                        onClick={() => handleSelect(isAdmin ? 'active-students' : 'my-students', s)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={s.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {s.fullName} {s.surname}
                            </div>
                            <div className="text-xs text-slate-400">
                              {s.studentId} • {s.classId} sinf
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300">
                          {s.classId}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers */}
              {teachers.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-500" />
                    {t('navTeachers')} ({teachers.length})
                  </div>
                  <div className="space-y-1">
                    {teachers.slice(0, 5).map((tch) => (
                      <button
                        key={tch.id}
                        onClick={() => handleSelect('active-teachers', tch)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={tch.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                              {tch.fullName} {tch.surname}
                            </div>
                            <div className="text-xs text-slate-400">
                              {tch.subjects?.join(', ')} • {tch.position}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300">
                          {tch.teacherId}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Classes */}
              {foundClasses.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-500" />
                    {t('navClasses')} ({foundClasses.length})
                  </div>
                  <div className="space-y-1">
                    {foundClasses.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => handleSelect(isAdmin ? 'active-classes' : 'my-classes', c)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {c.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            Sinf rahbari: {c.classTeacherName} • {c.studentCount || 0} o'quvchi
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300">
                          {c.roomNumber}-xona
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Subjects */}
              {foundSubjects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    {t('navSubjects')} ({foundSubjects.length})
                  </div>
                  <div className="space-y-1">
                    {foundSubjects.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSelect('subjects', sub)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {sub.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            {sub.description}
                          </div>
                        </div>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300">
                          {sub.code}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Homework (Student) */}
              {foundHomework.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-cyan-500" />
                    {t('navHomework')} ({foundHomework.length})
                  </div>
                  <div className="space-y-1">
                    {foundHomework.map((hw) => (
                      <button
                        key={hw.id}
                        onClick={() => handleSelect('homework', hw)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {hw.title}
                          </div>
                          <div className="text-xs text-slate-400">
                            {hw.subjectName} • Muddat: {hw.deadline}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Announcements */}
              {foundAnnouncements.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-rose-500" />
                    {t('navAnnouncements')} ({foundAnnouncements.length})
                  </div>
                  <div className="space-y-1">
                    {foundAnnouncements.map((a) => (
                      <button
                        key={a.id}
                        onClick={() => handleSelect('announcements', a)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 text-left transition-colors"
                      >
                        <div>
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">
                            {a.title}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">
                            {a.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {students.length === 0 &&
                teachers.length === 0 &&
                foundClasses.length === 0 &&
                foundSubjects.length === 0 &&
                foundHomework.length === 0 &&
                foundAnnouncements.length === 0 && (
                  <div className="text-center py-8 text-sm text-slate-400">
                    "{query}" so'rovi bo'yicha hech narsa topilmadi
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
