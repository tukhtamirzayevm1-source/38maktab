import React, { useState } from 'react';
import { Award, Plus, Filter, Trash2, Edit2, Download } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Grade, GradeType } from '../../types';

export const GradesView: React.FC = () => {
  const { grades, users, classes, subjects, addGrade, updateGrade, deleteGrade } = useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Grade | null>(null);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentUser?.classId || classes[0]?.id || ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');

  React.useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  // Form states
  const [formStudentId, setFormStudentId] = useState('');
  const [formSubjectName, setFormSubjectName] = useState(subjects[0]?.name || 'Matematika');
  const [formGradeType, setFormGradeType] = useState<GradeType>('Classwork');
  const [formGradeValue, setFormGradeValue] = useState<number>(5);
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formComment, setFormComment] = useState('');

  const classStudents = users.filter(
    (u) => u.role === 'STUDENT' && u.classId === selectedClassId
  );

  // Student view
  if (isStudent) {
    const myGrades = grades.filter((g) => {
      if (g.studentId !== currentUser?.id) return false;
      if (selectedSubject !== 'ALL' && g.subjectName !== selectedSubject) return false;
      return true;
    });

    const avg =
      myGrades.length > 0
        ? (myGrades.reduce((sum, g) => sum + g.gradeValue, 0) / myGrades.length).toFixed(1)
        : '5.0';

    return (
      <div id="student-grades-view" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <Award className="w-6 h-6 text-amber-500" />
              {t('navMyGrades')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sizning barcha fanlardan olgan joriy, oraliq va yakuniy baholaringiz
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{t('averageScore')}:</span>
              <span className="text-lg font-black text-blue-600 dark:text-blue-400">{avg}</span>
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
            >
              <option value="ALL">Barcha fanlar</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grades Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">{t('subject')}</th>
                <th className="p-3.5">{t('gradeType')}</th>
                <th className="p-3.5 text-center">{t('gradeValue')}</th>
                <th className="p-3.5">{t('teacher')}</th>
                <th className="p-3.5">{t('date')}</th>
                <th className="p-3.5">{t('comment')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myGrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Baholar mavjud emas
                  </td>
                </tr>
              ) : (
                myGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{g.subjectName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] text-slate-600 dark:text-slate-300">
                        {g.gradeType}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                          g.gradeValue >= 4
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : g.gradeValue === 3
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {g.gradeValue}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{g.teacherName}</td>
                    <td className="p-3.5 text-slate-400">{g.date}</td>
                    <td className="p-3.5 text-slate-500 italic max-w-xs truncate">{g.comment || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Teacher & Admin Management
  const visibleGrades = grades.filter((g) => {
    if (selectedClassId !== 'ALL' && g.classId !== selectedClassId) return false;
    if (selectedSubject !== 'ALL' && g.subjectName !== selectedSubject) return false;
    return true;
  });

  const handleOpenAdd = () => {
    setEditingGrade(null);
    setFormStudentId(classStudents[0]?.id || '');
    setFormSubjectName(subjects[0]?.name || 'Matematika');
    setFormGradeType('Classwork');
    setFormGradeValue(5);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormComment('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (g: Grade) => {
    setEditingGrade(g);
    setFormStudentId(g.studentId);
    setFormSubjectName(g.subjectName);
    setFormGradeType(g.gradeType);
    setFormGradeValue(g.gradeValue);
    setFormDate(g.date);
    setFormComment(g.comment || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = users.find((u) => u.id === formStudentId);
    if (!st) return;

    if (editingGrade) {
      updateGrade(editingGrade.id, {
        studentId: formStudentId,
        studentName: `${st.fullName} ${st.surname}`,
        subjectName: formSubjectName,
        gradeType: formGradeType,
        gradeValue: Number(formGradeValue),
        date: formDate,
        comment: formComment,
      });
    } else {
      addGrade({
        studentId: formStudentId,
        studentName: `${st.fullName} ${st.surname}`,
        classId: st.classId || selectedClassId,
        subjectName: formSubjectName,
        gradeType: formGradeType,
        gradeValue: Number(formGradeValue),
        date: formDate,
        comment: formComment,
        teacherId: currentUser?.id,
        teacherName: `${currentUser?.fullName} ${currentUser?.surname}`,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (g: Grade) => {
    setDeleteTarget(g);
  };

  return (
    <div id="grades-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-amber-500" />
            {t('navGrades')} ({visibleGrades.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            O'quvchilar bilimini baholash jurnali, choraklik va nazorat ishlari natijalari
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addGrade')}
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t('className')}
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
          >
            <option value="ALL">Barcha sinflar</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.classTeacherName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t('subject')}
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
          >
            <option value="ALL">Barcha fanlar</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grades Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">O'quvchi</th>
                <th className="p-3.5">Sinf</th>
                <th className="p-3.5">{t('subject')}</th>
                <th className="p-3.5">{t('gradeType')}</th>
                <th className="p-3.5 text-center">{t('gradeValue')}</th>
                <th className="p-3.5">{t('teacher')}</th>
                <th className="p-3.5">{t('date')}</th>
                <th className="p-3.5">{t('comment')}</th>
                <th className="p-3.5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {visibleGrades.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-400">
                    Baholar mavjud emas
                  </td>
                </tr>
              ) : (
                visibleGrades.map((g) => (
                  <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{g.studentName}</td>
                    <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">{g.classId}</td>
                    <td className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">{g.subjectName}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-semibold text-[11px] text-slate-600 dark:text-slate-300">
                        {g.gradeType}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs ${
                          g.gradeValue >= 4
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : g.gradeValue === 3
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {g.gradeValue}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-500">{g.teacherName}</td>
                    <td className="p-3.5 text-slate-400">{g.date}</td>
                    <td className="p-3.5 text-slate-500 italic max-w-xs truncate">{g.comment || '—'}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(g)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(g)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Grade Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingGrade ? t('edit') : t('addGrade')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              O'quvchi *
            </label>
            <select
              required
              value={formStudentId}
              onChange={(e) => setFormStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            >
              {classStudents.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} {st.surname} ({st.studentId})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('subject')} *
              </label>
              <select
                value={formSubjectName}
                onChange={(e) => setFormSubjectName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('gradeType')} *
              </label>
              <select
                value={formGradeType}
                onChange={(e) => setFormGradeType(e.target.value as GradeType)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="Classwork">Sinf ishi</option>
                <option value="Homework">Uy ishi</option>
                <option value="Quiz">Oraliq nazorat (Test)</option>
                <option value="Exam">Choraklik imtihon</option>
                <option value="Final">Yakuniy baho</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('gradeValue')} (1-5) *
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormGradeValue(val)}
                    className={`flex-1 py-2 rounded-xl font-black text-sm border transition-all ${
                      formGradeValue === val
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('date')} *
              </label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Izoh
            </label>
            <input
              type="text"
              value={formComment}
              onChange={(e) => setFormComment(e.target.value)}
              placeholder="Masalan: Faol qatnashdi, mustaqil yechim..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 rounded-xl"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteGrade(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Bahoni o'chirish"
        message={`"${deleteTarget?.studentName}" o'quvchisining ${deleteTarget?.subjectName} fanidan olgan ${deleteTarget?.gradeValue} bahosini o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
