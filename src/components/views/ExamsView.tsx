import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Calendar,
  Clock,
  DoorOpen,
  Award,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Exam } from '../../types';

export const ExamsView: React.FC = () => {
  const { exams, classes, subjects, addExam, deleteExam } = useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Exam | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || 'Matematika');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('09:00 - 10:30');
  const [room, setRoom] = useState('204');
  const [maxScore, setMaxScore] = useState<number>(100);

  React.useEffect(() => {
    if (!classId && classes.length > 0) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  const visibleExams = exams.filter((e) => {
    if (isStudent) {
      return e.classId === currentUser?.classId;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addExam({
      title: title.trim(),
      subjectName,
      classId,
      date,
      time,
      room,
      maxScore: Number(maxScore),
      teacherName: `${currentUser?.fullName} ${currentUser?.surname}`,
    });
    setTitle('');
    setIsModalOpen(false);
  };

  const handleDelete = (e: Exam) => {
    setDeleteTarget(e);
  };

  return (
    <div id="exams-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-purple-600" />
            {t('navExams')} ({visibleExams.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choraklik imtihonlar jadvali, oraliq nazoratlar va attestatsiya sanalari
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addExam')}
          </button>
        )}
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleExams.length === 0 ? (
          <div className="col-span-3 p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
            Imtihonlar rejalashtirilmagan
          </div>
        ) : (
          visibleExams.map((ex) => (
            <div
              key={ex.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                    {ex.subjectName}
                  </span>
                  {(isAdmin || isTeacher) && (
                    <button
                      onClick={() => handleDelete(ex)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                  {ex.title}
                </h3>
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {ex.classId} sinf
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    {t('date')}:
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">{ex.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {t('time')}:
                  </span>
                  <span className="font-semibold">{ex.time}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                    {t('roomNumber')}:
                  </span>
                  <span className="font-semibold">{ex.room}-xona</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-500" />
                    {t('maxScore')}:
                  </span>
                  <span className="font-black text-purple-600 dark:text-purple-400">{ex.maxScore} ball</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Exam Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addExam')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Imtihon nomi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: 1-Chorak Yakuniy Attestatsiya"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('subject')} *
              </label>
              <select
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
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
                {t('className')} *
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('date')} *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('time')} *
              </label>
              <input
                type="text"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="09:00 - 10:30"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('roomNumber')}
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="204"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('maxScore')}
              </label>
              <input
                type="number"
                value={maxScore}
                onChange={(e) => setMaxScore(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
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
            deleteExam(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Imtihonni o'chirish"
        message={`"${deleteTarget?.title}" (${deleteTarget?.subjectName}) imtihonini o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
