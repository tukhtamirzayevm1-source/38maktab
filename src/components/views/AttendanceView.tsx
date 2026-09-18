import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  XCircle,
  Clock,
  HelpCircle,
  Filter,
  Save,
  Calendar,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { AttendanceStatus } from '../../types';

export const AttendanceView: React.FC = () => {
  const { users, classes, subjects, attendance, markAttendance } = useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    currentUser?.classId || classes[0]?.id || ''
  );
  const [selectedSubject, setSelectedSubject] = useState<string>(
    subjects[0]?.name || 'Matematika'
  );

  // Sync selectedClassId if it was empty and classes became available
  React.useEffect(() => {
    if (!selectedClassId && classes.length > 0) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // If student, view personal attendance
  if (isStudent) {
    const myRecords = attendance.filter((a) => a.studentId === currentUser?.id);
    const total = myRecords.length;
    const present = myRecords.filter((a) => a.status === 'present').length;
    const late = myRecords.filter((a) => a.status === 'late').length;
    const excused = myRecords.filter((a) => a.status === 'excused').length;
    const absent = myRecords.filter((a) => a.status === 'absent').length;

    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 100;

    return (
      <div id="student-attendance-view" className="space-y-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            {t('navMyAttendance')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sizning darslarga qatnashish ko'rsatkichlaringiz va sababli/sababsiz qoldirilgan darslar
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-center">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{rate}%</span>
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 mt-1">{t('attendanceRate')}</div>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800 text-center">
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{present}</span>
            <div className="text-xs font-semibold text-blue-800 dark:text-blue-300 mt-1">{t('present')}</div>
          </div>
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800 text-center">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{late}</span>
            <div className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-1">{t('late')}</div>
          </div>
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 rounded-2xl border border-rose-200 dark:border-rose-800 text-center">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">{absent}</span>
            <div className="text-xs font-semibold text-rose-800 dark:text-rose-300 mt-1">{t('absent')}</div>
          </div>
        </div>

        {/* Attendance Log Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">{t('date')}</th>
                <th className="p-3.5">{t('subject')}</th>
                <th className="p-3.5">{t('status')}</th>
                <th className="p-3.5">{t('reasonForAbsence')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {myRecords.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Davomat ma'lumotlari mavjud emas
                  </td>
                </tr>
              ) : (
                myRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white">{r.date}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{r.subjectName}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'present'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : r.status === 'late'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                            : r.status === 'excused'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {r.status === 'present'
                          ? t('present')
                          : r.status === 'late'
                          ? t('late')
                          : r.status === 'excused'
                          ? t('excused')
                          : t('absent')}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-400 italic">{r.reason || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Teacher & Admin Interactive Marking View
  const classStudents = users.filter(
    (u) => u.role === 'STUDENT' && u.classId === selectedClassId
  );

  // Local state for editing marks for the selected class, date, subject
  const currentAttendanceRecords = attendance.filter(
    (a) =>
      a.classId === selectedClassId &&
      a.subjectName === selectedSubject &&
      a.date === selectedDate
  );

  const getStudentStatus = (studentId: string): AttendanceStatus => {
    const match = currentAttendanceRecords.find((a) => a.studentId === studentId);
    return match ? match.status : 'present';
  };

  const getStudentReason = (studentId: string): string => {
    const match = currentAttendanceRecords.find((a) => a.studentId === studentId);
    return match?.reason || '';
  };

  const handleSetStatus = (student: typeof users[0], status: AttendanceStatus) => {
    markAttendance({
      studentId: student.id,
      studentName: `${student.fullName} ${student.surname}`,
      classId: selectedClassId,
      subjectName: selectedSubject,
      date: selectedDate,
      status,
      reason: getStudentReason(student.id),
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  const handleSetReason = (student: typeof users[0], reason: string) => {
    markAttendance({
      studentId: student.id,
      studentName: `${student.fullName} ${student.surname}`,
      classId: selectedClassId,
      subjectName: selectedSubject,
      date: selectedDate,
      status: getStudentStatus(student.id),
      reason,
    });
  };

  const handleMarkAllPresent = () => {
    classStudents.forEach((st) => {
      markAttendance({
        studentId: st.id,
        studentName: `${st.fullName} ${st.surname}`,
        classId: selectedClassId,
        subjectName: selectedSubject,
        date: selectedDate,
        status: 'present',
      });
    });
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  return (
    <div id="attendance-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-emerald-600" />
            {t('navAttendance')}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Kundalik elektron jurnal: darslarga qatnashishni belgilash va nazorat qilish
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccessNotice && (
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl animate-in fade-in duration-150">
              Davomat saqlandi!
            </span>
          )}
          <button
            id="mark-all-present-btn"
            onClick={handleMarkAllPresent}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
          >
            Barchani "Bor" deb belgilash
          </button>
        </div>
      </div>

      {/* Control Bar: Class, Subject, Date */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t('className')}
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
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
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            {t('date')}
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
          >
          </input>
        </div>
      </div>

      {/* Attendance Roster Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/40">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            {selectedClassId} sinf • {selectedSubject} • {selectedDate}
          </span>
          <span className="text-xs text-slate-400">
            Jami {classStudents.length} o'quvchi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">№</th>
                <th className="p-3.5">O'quvchi</th>
                <th className="p-3.5 text-center">Qatnashish holati</th>
                <th className="p-3.5">Qoldirish sababi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-400">
                    Ushbu sinfda o'quvchilar ro'yxatga olinmagan
                  </td>
                </tr>
              ) : (
                classStudents.map((st, idx) => {
                  const status = getStudentStatus(st.id);
                  const reason = getStudentReason(st.id);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={st.photoUrl}
                            alt=""
                            className="w-7 h-7 rounded-full object-cover"
                          />
                          <div>
                            <div>{st.fullName} {st.surname}</div>
                            <div className="text-[10px] text-slate-400 font-normal">{st.studentId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Present */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st, 'present')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              status === 'present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            {t('present')}
                          </button>

                          {/* Absent */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st, 'absent')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              status === 'absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {t('absent')}
                          </button>

                          {/* Late */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st, 'late')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              status === 'late'
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            {t('late')}
                          </button>

                          {/* Excused */}
                          <button
                            type="button"
                            onClick={() => handleSetStatus(st, 'excused')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1 ${
                              status === 'excused'
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            {t('excused')}
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <input
                          type="text"
                          value={reason}
                          onChange={(e) => handleSetReason(st, e.target.value)}
                          placeholder="Sababli holatlar uchun izoh..."
                          className="w-full max-w-xs px-2.5 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
