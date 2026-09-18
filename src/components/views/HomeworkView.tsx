import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  Paperclip,
  CheckCircle,
  FileText,
  Trash2,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Homework } from '../../types';

export const HomeworkView: React.FC = () => {
  const { homework, classes, subjects, users, addHomework, toggleHomeworkCompleted, deleteHomework } =
    useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Homework | null>(null);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(
    currentUser?.classId || 'ALL'
  );

  // Form states
  const [title, setTitle] = useState('');
  const [subjectName, setSubjectName] = useState(subjects[0]?.name || 'Matematika');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('darslik_mashq_38.pdf');

  React.useEffect(() => {
    if (!classId && classes.length > 0) {
      setClassId(classes[0].id);
    }
  }, [classes, classId]);

  // Filter homework based on role
  const visibleHomework = homework.filter((h) => {
    if (isStudent) {
      return h.classId === currentUser?.classId;
    }
    if (selectedClassFilter !== 'ALL' && h.classId !== selectedClassFilter) {
      return false;
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addHomework({
      title: title.trim(),
      subjectName,
      classId,
      deadline,
      description: description.trim(),
      attachmentUrl: attachmentName,
      teacherId: currentUser?.id,
      teacherName: `${currentUser?.fullName} ${currentUser?.surname}`,
      completedStudentIds: [],
    });
    setTitle('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleDelete = (hw: Homework) => {
    setDeleteTarget(hw);
  };

  return (
    <div id="homework-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-blue-600" />
            {t('navHomework')} ({visibleHomework.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Berilgan vazifalar, darslik topshiriqlari va muddatlari
          </p>
        </div>

        {(isAdmin || isTeacher) && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addHomework')}
          </button>
        )}
      </div>

      {/* Class filter for teacher/admin */}
      {!isStudent && (
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t('filterByClass')}:
          </span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            <option value="ALL">{t('all')}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Homework Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {visibleHomework.length === 0 ? (
          <div className="col-span-2 p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
            Topshiriqlar mavjud emas
          </div>
        ) : (
          visibleHomework.map((hw) => {
            const isCompletedByMe = isStudent && hw.completedStudentIds?.includes(currentUser?.id || '');
            const completedTotal = hw.completedStudentIds?.length || 0;

            return (
              <div
                key={hw.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                          {hw.subjectName}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {hw.classId} sinf
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-2">
                        {hw.title}
                      </h3>
                    </div>

                    {(isAdmin || (isTeacher && hw.teacherId === currentUser?.id)) && (
                      <button
                        onClick={() => handleDelete(hw)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {hw.description}
                  </p>

                  {hw.attachmentUrl && (
                    <div className="mt-3 flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <Paperclip className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{hw.attachmentUrl}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="text-slate-400 text-[11px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>{t('deadline')}: <strong className="text-slate-700 dark:text-slate-300">{hw.deadline}</strong></span>
                    </div>
                    <div className="text-slate-400 text-[10px]">
                      O'qituvchi: {hw.teacherName}
                    </div>
                  </div>

                  {isStudent ? (
                    <button
                      onClick={() => toggleHomeworkCompleted(hw.id, currentUser?.id || '')}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                        isCompletedByMe
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isCompletedByMe ? t('completed') : t('markAsCompleted')}
                    </button>
                  ) : (
                    <div className="text-[11px] font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      Topshirganlar: <strong className="text-emerald-600">{completedTotal}</strong> o'quvchi
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Homework Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addHomework')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Topshiriq mavzusi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: 32-paragraf 1-10 misollar"
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

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t('deadline')} *
            </label>
            <input
              type="date"
              required
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Topshiriq tafsilotlari
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Darslik sahifasi, bajarish talablari..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Biriktirilgan fayl / Qo'llanma
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="Masalan: test_savollari.pdf"
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
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
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
            deleteHomework(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Uy vazifasini o'chirish"
        message={`"${deleteTarget?.title}" (${deleteTarget?.subjectName}) topshirig'ini o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
