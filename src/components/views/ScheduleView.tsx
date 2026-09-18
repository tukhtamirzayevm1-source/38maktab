import React, { useState } from 'react';
import { Clock, Plus, Layers, UserCheck, DoorOpen, Trash2 } from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { ScheduleItem } from '../../types';

export const ScheduleView: React.FC = () => {
  const { schedule, classes, subjects, users, addScheduleItem, deleteScheduleItem } = useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  const daysOfWeek = ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
  const [selectedDay, setSelectedDay] = useState<string>('Dushanba');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>(
    currentUser?.classId || classes[0]?.id || ''
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ScheduleItem | null>(null);

  // Form states
  const [formDay, setFormDay] = useState('Dushanba');
  const [formPeriod, setFormPeriod] = useState(1);
  const [formSubjectName, setFormSubjectName] = useState(subjects[0]?.name || 'Matematika');
  const [formClassId, setFormClassId] = useState(classes[0]?.id || '');
  const [formTeacherId, setFormTeacherId] = useState(
    users.find((u) => u.role === 'TEACHER')?.id || ''
  );
  const [formRoom, setFormRoom] = useState('204');

  const normalizeDay = (d: string) => {
    const map: Record<string, string> = {
      monday: 'dushanba',
      tuesday: 'seshanba',
      wednesday: 'chorshanba',
      thursday: 'payshanba',
      friday: 'juma',
      saturday: 'shanba',
      dushanba: 'dushanba',
      seshanba: 'seshanba',
      chorshanba: 'chorshanba',
      payshanba: 'payshanba',
      juma: 'juma',
      shanba: 'shanba',
    };
    return map[d.toLowerCase()] || d.toLowerCase();
  };

  const periodTimes: Record<number, { start: string; end: string }> = {
    1: { start: '08:30', end: '09:15' },
    2: { start: '09:25', end: '10:10' },
    3: { start: '10:20', end: '11:05' },
    4: { start: '11:25', end: '12:10' },
    5: { start: '12:20', end: '13:05' },
    6: { start: '13:15', end: '14:00' },
  };

  const teachers = users.filter((u) => u.role === 'TEACHER');

  // Filter schedule items
  const visibleSchedule = schedule.filter((s) => {
    if (normalizeDay(s.dayOfWeek) !== normalizeDay(selectedDay)) return false;
    if (isStudent) {
      return s.classId === currentUser?.classId;
    }
    if (isTeacher) {
      return s.teacherId === currentUser?.id || s.classId === selectedClassFilter;
    }
    return s.classId === selectedClassFilter;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const tch = teachers.find((t) => t.id === formTeacherId);
    const times = periodTimes[formPeriod] || { start: '08:30', end: '09:15' };

    addScheduleItem({
      dayOfWeek: formDay,
      period: Number(formPeriod),
      startTime: times.start,
      endTime: times.end,
      subjectName: formSubjectName,
      classId: formClassId,
      teacherId: formTeacherId,
      teacherName: tch ? `${tch.fullName} ${tch.surname}` : 'O\'qituvchi',
      room: formRoom,
    });
    setIsModalOpen(false);
  };

  const handleDelete = (s: ScheduleItem) => {
    setDeleteTarget(s);
  };

  return (
    <div id="schedule-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-blue-600" />
            {t('navSchedule')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Dushanbadan Shanbagacha haftalik darslar jadvali va xonalar taqsimoti
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            Dars qo'shish
          </button>
        )}
      </div>

      {/* Day Selector & Class Filter */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Days Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto w-full md:w-auto">
          {daysOfWeek.map((day) => {
            const dayKey = `day${day}` as any;
            const label = t(dayKey) || day;
            const isSelected = selectedDay === day;
            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Class selector */}
        {!isStudent && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs font-bold text-slate-500 shrink-0">
              {t('className')}:
            </span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.roomNumber}-xona)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Schedule Timetable List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {t(`day${selectedDay}` as any)} — {isStudent ? currentUser?.classId : selectedClassFilter} sinfi jadvali
          </span>
          <span className="text-xs text-slate-400">
            Jami {visibleSchedule.length} ta dars
          </span>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[1, 2, 3, 4, 5, 6].map((periodNum) => {
            const item = visibleSchedule.find((s) => s.period === periodNum);
            const time = periodTimes[periodNum];

            return (
              <div
                key={periodNum}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center border border-blue-200/60 dark:border-blue-900/40 shrink-0">
                    {periodNum}
                  </div>
                  <div>
                    <div className="text-xs font-mono font-bold text-slate-400">
                      {time.start} - {time.end}
                    </div>
                    {item ? (
                      <div className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                        {item.subjectName}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic mt-0.5">
                        Dars belgilanmagan (Darcha)
                      </div>
                    )}
                  </div>
                </div>

                {item && (
                  <div className="flex items-center justify-between sm:justify-end gap-6 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                      <span>{item.teacherName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                      <DoorOpen className="w-3.5 h-3.5 text-emerald-500" />
                      <span>{item.room}-xona</span>
                    </div>

                    <div className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold rounded-md text-[11px]">
                      {item.classId}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(item)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Schedule Item Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Dars jadvaliga kiritish">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Hafta kuni *
              </label>
              <select
                value={formDay}
                onChange={(e) => setFormDay(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                {daysOfWeek.map((d) => (
                  <option key={d} value={d}>
                    {t(`day${d}` as any) || d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Dars tartib raqami (1-6) *
              </label>
              <select
                value={formPeriod}
                onChange={(e) => setFormPeriod(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <option key={p} value={p}>
                    {p}-dars ({periodTimes[p].start} - {periodTimes[p].end})
                  </option>
                ))}
              </select>
            </div>
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
                {t('className')} *
              </label>
              <select
                value={formClassId}
                onChange={(e) => setFormClassId(e.target.value)}
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
                O'qituvchi *
              </label>
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              >
                {teachers.map((tch) => (
                  <option key={tch.id} value={tch.id}>
                    {tch.fullName} {tch.surname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('roomNumber')}
              </label>
              <input
                type="text"
                value={formRoom}
                onChange={(e) => setFormRoom(e.target.value)}
                placeholder="204"
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
            deleteScheduleItem(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Dars jadvalini o'chirish"
        message={`"${deleteTarget?.subjectName}" darsini (${deleteTarget?.period}-soat, ${deleteTarget?.room ? deleteTarget.room + '-xona' : ''}) o'chirmoqchimisiz?`}
        confirmText="O'chirish"
      />
    </div>
  );
};
