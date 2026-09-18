import React, { useState } from 'react';
import { Bell, Plus, Calendar, AlertTriangle, Info, Trash2, Paperclip } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Announcement, TargetAudience, Importance } from '../../types';

export const AnnouncementsView: React.FC = () => {
  const { announcements, classes, addAnnouncement, deleteAnnouncement } = useSchoolData();
  const { currentUser, isAdmin } = useAuth();
  const { t } = useLanguage();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState<TargetAudience>('ALL');
  const [importance, setImportance] = useState<Importance>('normal');
  const [attachmentName, setAttachmentName] = useState('');

  const visibleAnnouncements = announcements.filter((a) => {
    if (isAdmin) return true;
    if (a.targetAudience === 'ALL') return true;
    if (currentUser?.role === 'STUDENT') {
      return a.targetAudience === 'STUDENTS' || a.targetAudience === currentUser.classId;
    }
    if (currentUser?.role === 'TEACHER') {
      return a.targetAudience === 'TEACHERS';
    }
    return true;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addAnnouncement({
      title: title.trim(),
      description: description.trim(),
      date: new Date().toISOString().split('T')[0],
      author: `${currentUser?.fullName} ${currentUser?.surname} (${isAdmin ? 'Direktor' : 'O\'qituvchi'})`,
      targetAudience,
      importance,
      attachmentUrl: attachmentName.trim() || undefined,
    });
    setTitle('');
    setDescription('');
    setAttachmentName('');
    setIsModalOpen(false);
  };

  const handleDelete = (a: Announcement) => {
    setDeleteTarget(a);
  };

  return (
    <div id="announcements-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-rose-500" />
            {t('navAnnouncements')} ({visibleAnnouncements.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Maktab ma'muriyati va pedagogik kengashining rasmiy bildirishnomalari
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            {t('addAnnouncement')}
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {visibleAnnouncements.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-slate-400 text-sm">
            E'lonlar mavjud emas
          </div>
        ) : (
          visibleAnnouncements.map((a) => {
            const importanceStyle =
              a.importance === 'urgent'
                ? 'border-l-4 border-l-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                : a.importance === 'important'
                ? 'border-l-4 border-l-amber-500 bg-amber-50/30 dark:bg-amber-950/20'
                : 'border-l-4 border-l-blue-500 bg-white dark:bg-slate-900';

            return (
              <div
                key={a.id}
                className={`p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all ${importanceStyle}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        a.importance === 'urgent'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300'
                          : a.importance === 'important'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'
                      }`}
                    >
                      {a.importance}
                    </span>

                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      Auditoriya: {a.targetAudience}
                    </span>

                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {a.date}
                    </span>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => handleDelete(a)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3">
                  {a.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-line">
                  {a.description}
                </p>

                {a.attachmentUrl && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs text-blue-600 dark:text-blue-400 font-semibold border border-slate-200/60 dark:border-slate-700">
                    <Paperclip className="w-3.5 h-3.5" />
                    <span>{a.attachmentUrl}</span>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
                  Muallif: <strong className="text-slate-700 dark:text-slate-300">{a.author}</strong>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Announcement Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('addAnnouncement')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              E'lon sarlavhasi *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masalan: Kuzgi ta'til kunlari va bayram tadbiri"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('targetAudience')} *
              </label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value as TargetAudience)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="ALL">Barchaga</option>
                <option value="TEACHERS">Faqat O'qituvchilarga</option>
                <option value="STUDENTS">Faqat O'quvchilarga</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} sinfiga
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('importance')} *
              </label>
              <select
                value={importance}
                onChange={(e) => setImportance(e.target.value as Importance)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                <option value="normal">{t('normal')}</option>
                <option value="important">{t('important')}</option>
                <option value="urgent">{t('urgent')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              E'lon matni *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Batafsil ma'lumot..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Ilova qilingan fayl (ixtiyoriy)
            </label>
            <input
              type="text"
              value={attachmentName}
              onChange={(e) => setAttachmentName(e.target.value)}
              placeholder="buyruq_38_sonli.pdf"
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
              className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl"
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
            deleteAnnouncement(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="E'lonni o'chirish"
        message={`"${deleteTarget?.title}" sarlavhali e'lonni o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
