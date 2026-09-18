import React, { useState } from 'react';
import { BookOpen, Plus, Users, Layers, Edit2, Trash2, Search } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Subject } from '../../types';

export const SubjectsView: React.FC = () => {
  const { subjects, users, classes, addSubject, updateSubject, deleteSubject } = useSchoolData();
  const { isAdmin } = useAuth();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subject | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const teachers = users.filter((u) => u.role === 'TEACHER');

  const handleOpenAdd = () => {
    setEditingSubject(null);
    setName('');
    setCode('');
    setDescription('');
    setSelectedTeachers([]);
    setSelectedClasses([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setDescription(sub.description);
    setSelectedTeachers(sub.assignedTeachers || []);
    setSelectedClasses(sub.assignedClasses || []);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSubject) {
      updateSubject(editingSubject.id, {
        name,
        code,
        description,
        assignedTeachers: selectedTeachers,
        assignedClasses: selectedClasses,
      });
    } else {
      addSubject({
        name,
        code: code || name.slice(0, 4).toUpperCase(),
        description,
        assignedTeachers: selectedTeachers,
        assignedClasses: selectedClasses,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (sub: Subject) => {
    setDeleteTarget(sub);
  };

  const toggleTeacher = (tName: string) => {
    setSelectedTeachers(
      selectedTeachers.includes(tName)
        ? selectedTeachers.filter((t) => t !== tName)
        : [...selectedTeachers, tName]
    );
  };

  const toggleClass = (cName: string) => {
    setSelectedClasses(
      selectedClasses.includes(cName)
        ? selectedClasses.filter((c) => c !== cName)
        : [...selectedClasses, cName]
    );
  };

  return (
    <div id="subjects-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-amber-500" />
            {t('navSubjects')} ({subjects.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maktab o'quv dasturiga kiritilgan fanlar va ularga biriktirilgan pedagoglar
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addSubject')}
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subjects.map((sub) => (
          <div
            key={sub.id}
            className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300">
                    {sub.code}
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mt-1.5">
                    {sub.name}
                  </h3>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(sub)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(sub)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                {sub.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                  <Users className="w-3.5 h-3.5 text-purple-500" />
                  O'qituvchilar:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sub.assignedTeachers?.map((tName, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded text-[11px]"
                    >
                      {tName}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mb-1">
                  <Layers className="w-3.5 h-3.5 text-blue-500" />
                  Sinflar:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sub.assignedClasses?.map((cName, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded font-semibold text-[10px]"
                    >
                      {cName}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSubject ? t('edit') : t('addSubject')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Fan nomi *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Fizika"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Fan kodi *
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Masalan: FIZ"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Tavsifi
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              O'qituvchilarni biriktirish
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              {teachers.map((tch) => {
                const isChecked = selectedTeachers.includes(tch.fullName);
                return (
                  <button
                    key={tch.id}
                    type="button"
                    onClick={() => toggleTeacher(tch.fullName)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isChecked
                        ? 'bg-purple-600 text-white font-semibold'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tch.fullName} {tch.surname}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Sinflarni biriktirish
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              {classes.map((cls) => {
                const isChecked = selectedClasses.includes(cls.name);
                return (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => toggleClass(cls.name)}
                    className={`px-2 py-1 rounded text-xs transition-colors ${
                      isChecked
                        ? 'bg-blue-600 text-white font-semibold'
                        : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {cls.name}
                  </button>
                );
              })}
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
            deleteSubject(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Fanni o'chirish"
        message={`"${deleteTarget?.name}" (${deleteTarget?.code}) fanini o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
