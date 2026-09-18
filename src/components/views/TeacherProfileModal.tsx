import React from 'react';
import {
  Briefcase,
  BookOpen,
  Layers,
  Phone,
  Mail,
  Award,
  Clock,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User } from '../../types';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: User | null;
}

export const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  teacher,
}) => {
  const { schedule } = useSchoolData();
  const { t } = useLanguage();

  if (!teacher) return null;

  const teacherSchedule = schedule.filter((s) => s.teacherId === teacher.id);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${teacher.fullName} ${teacher.surname} — ${t('teacherRole')} Profili`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="p-6 bg-gradient-to-r from-purple-700 to-indigo-800 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={teacher.photoUrl}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-2xl font-extrabold tracking-tight">
              {teacher.fullName} {teacher.surname}
            </h3>
            <p className="text-purple-200 text-sm font-medium mt-0.5">
              {teacher.position || 'O\'qituvchi'} • ID: {teacher.teacherId || 'TCH-100'}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {teacher.subjects?.map((sub, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 bg-white/15 backdrop-blur-xs rounded-lg text-xs font-semibold"
                >
                  {sub}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Teacher Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-purple-600" />
              Kasbiy va Akademik faoliyat
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500">{t('position')}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teacher.position}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500">{t('experienceYears')}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teacher.experienceYears || 5} yil</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500">Biriktirilgan sinflar:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teacher.assignedClasses?.join(', ') || '9-A, 10-B'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">O'quv haftalik yuklamasi:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teacherSchedule.length * 2} akademik soat</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              Bog'lanish va Tarjimai hol
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500">{t('phone')}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teacher.phone}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500">{t('email')}:</span>
                <span className="font-bold text-slate-900 dark:text-white">{teacher.email}</span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block mb-0.5">{t('biography')}:</span>
                <p className="text-slate-700 dark:text-slate-300 italic">{teacher.biography || 'Ma\'lumot kiritilmagan'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weekly Schedule list */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            O'qituvchi dars jadvali
          </h4>
          {teacherSchedule.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-400">
              Bu o'qituvchi uchun dars jadvali hali shakllantirilmagan
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {teacherSchedule.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{item.subjectName}</span>
                    <span className="text-blue-600 dark:text-blue-400">{item.classId}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1 flex justify-between">
                    <span>{item.dayOfWeek}, {item.period}-dars</span>
                    <span>{item.startTime} - {item.endTime}</span>
                  </div>
                  <div className="text-slate-400 text-[10px] mt-0.5">{item.room}-xona</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
