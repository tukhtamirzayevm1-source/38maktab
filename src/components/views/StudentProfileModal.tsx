import React, { useState } from 'react';
import {
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Award,
  CalendarCheck,
  CheckSquare,
  BookOpen,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User } from '../../types';

interface StudentProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: User | null;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const { classes, grades, attendance, homework, exams, updateUser } = useSchoolData();
  const { isAdmin, isStudent } = useAuth();
  const { t } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [editedPhone, setEditedPhone] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedAddress, setEditedAddress] = useState('');
  const [editedParentName, setEditedParentName] = useState('');
  const [editedParentPhone, setEditedParentPhone] = useState('');
  const [editedEmergency, setEditedEmergency] = useState('');

  if (!student) return null;

  const studentClass = classes.find((c) => c.id === student.classId);
  const studentGrades = grades.filter((g) => g.studentId === student.id);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id);
  const studentHomework = homework.filter((h) => h.classId === student.classId);
  const studentExams = exams.filter((e) => e.classId === student.classId);

  // Calculate stats
  const totalGrades = studentGrades.length;
  const avgGrade =
    totalGrades > 0
      ? (studentGrades.reduce((sum, g) => sum + g.gradeValue, 0) / totalGrades).toFixed(1)
      : '5.0';

  const totalAtt = studentAttendance.length;
  const presentAtt = studentAttendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const attRate = totalAtt > 0 ? Math.round((presentAtt / totalAtt) * 100) : 98;

  const completedHwCount = studentHomework.filter((h) =>
    h.completedStudentIds?.includes(student.id)
  ).length;

  const handleStartEdit = () => {
    setEditedPhone(student.phone || '');
    setEditedEmail(student.email || '');
    setEditedAddress(student.address || '');
    setEditedParentName(student.parentName || '');
    setEditedParentPhone(student.parentPhone || '');
    setEditedEmergency(student.emergencyContact || '');
    setIsEditing(true);
  };

  const handleSave = () => {
    updateUser(student.id, {
      phone: editedPhone,
      email: editedEmail,
      address: editedAddress,
      parentName: editedParentName,
      parentPhone: editedParentPhone,
      emergencyContact: editedEmergency,
    });
    setIsEditing(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.fullName} ${student.surname} — ${t('studentRole')} Profili`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Profile Header Card */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl text-white shadow-md flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={student.photoUrl}
            alt=""
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-lg shrink-0"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight">
                  {student.fullName} {student.surname}
                </h3>
                <p className="text-blue-100 text-sm font-medium">
                  {student.studentId || 'STD-001'} • {student.classId} sinf o'quvchisi
                </p>
              </div>

              {(isAdmin || (isStudent && student.id === student.id)) && !isEditing && (
                <button
                  onClick={handleStartEdit}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold backdrop-blur-xs transition-colors self-center sm:self-start"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {t('edit')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/10 text-center">
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-xl font-black">{avgGrade}</div>
                <div className="text-[11px] text-blue-200 uppercase font-semibold">{t('averageScore')}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-xl font-black">{attRate}%</div>
                <div className="text-[11px] text-blue-200 uppercase font-semibold">{t('attendanceRate')}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-xl font-black">{completedHwCount} / {studentHomework.length}</div>
                <div className="text-[11px] text-blue-200 uppercase font-semibold">{t('completed')} D/Z</div>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                <div className="text-xl font-black">{studentExams.length}</div>
                <div className="text-[11px] text-blue-200 uppercase font-semibold">{t('navExams')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Editing mode or viewing mode */}
        {isEditing ? (
          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-blue-600" />
              Ruxsat berilgan ma'lumotlarni tahrirlash
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('phone')}</label>
                <input
                  type="text"
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('address')}</label>
                <input
                  type="text"
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('parentName')}</label>
                <input
                  type="text"
                  value={editedParentName}
                  onChange={(e) => setEditedParentName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('parentPhone')}</label>
                <input
                  type="text"
                  value={editedParentPhone}
                  onChange={(e) => setEditedParentPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">{t('emergencyContact')}</label>
                <input
                  type="text"
                  value={editedEmergency}
                  onChange={(e) => setEditedEmergency(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs font-semibold bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 rounded-xl"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                {t('save')}
              </button>
            </div>
          </div>
        ) : (
          /* General Information Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                Shaxsiy va Maktab Ma'lumotlari
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('className')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.classId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('classTeacher')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{studentClass?.classTeacherName || 'Nodira Rahimova'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('dateOfBirth')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.dateOfBirth}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('gender')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.gender === 'male' ? t('male') : t('female')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('phone')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.phone}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">{t('address')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">{student.address}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                Ota-ona va Bog'lanish Ma'lumotlari
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('parentName')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.parentName || 'Mavjud emas'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('parentPhone')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.parentPhone || 'Mavjud emas'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('emergencyContact')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.emergencyContact || 'Mavjud emas'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                  <span className="text-slate-500">{t('email')}:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{student.email}</span>
                </div>
                <div className="pt-1">
                  <span className="text-slate-500 block mb-0.5">{t('additionalInfo')}:</span>
                  <p className="text-slate-700 dark:text-slate-300 italic">{student.additionalInfo || 'Izohlar kiritilmagan'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Academic Details: Recent Grades & Upcoming Exams */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-500" />
            Oxirgi o'zlashtirish va baholari
          </h4>
          {studentGrades.length === 0 ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-center text-xs text-slate-400">
              Bu o'quvchiga hozircha baho qo'yilmagan
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2.5">{t('subject')}</th>
                    <th className="p-2.5">{t('gradeType')}</th>
                    <th className="p-2.5">{t('gradeValue')}</th>
                    <th className="p-2.5">{t('date')}</th>
                    <th className="p-2.5">{t('teacher')}</th>
                    <th className="p-2.5">Izoh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {studentGrades.map((g) => (
                    <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 font-bold text-slate-900 dark:text-white">{g.subjectName}</td>
                      <td className="p-2.5 text-slate-500">{g.gradeType}</td>
                      <td className="p-2.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold text-xs">
                          {g.gradeValue}
                        </span>
                      </td>
                      <td className="p-2.5 text-slate-500">{g.date}</td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">{g.teacherName}</td>
                      <td className="p-2.5 text-slate-500 italic max-w-xs truncate">{g.comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
