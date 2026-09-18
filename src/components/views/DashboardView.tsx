import React from 'react';
import {
  Users,
  GraduationCap,
  Layers,
  CalendarCheck,
  Award,
  CheckSquare,
  Clock,
  Bell,
  ArrowUpRight,
  Plus,
  UserCheck,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { StatCard } from '../common/StatCard';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

interface DashboardViewProps {
  onNavigate: (tab: string, extra?: any) => void;
  onOpenCreateUser: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenCreateUser,
}) => {
  const {
    users,
    classes,
    subjects,
    grades,
    attendance,
    homework,
    exams,
    schedule,
    announcements,
  } = useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  // Metrics calculation
  const allStudents = users.filter((u) => u.role === 'STUDENT');
  const allTeachers = users.filter((u) => u.role === 'TEACHER');
  const activeStudents = allStudents.filter((u) => u.status === 'active');
  const activeTeachers = allTeachers.filter((u) => u.status === 'active');

  const totalAtt = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'present' || a.status === 'late').length;
  const overallAttRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 96;

  // Student perspective
  const myStudentGrades = grades.filter((g) => g.studentId === currentUser?.id);
  const myStudentGpa =
    myStudentGrades.length > 0
      ? (myStudentGrades.reduce((sum, g) => sum + g.gradeValue, 0) / myStudentGrades.length).toFixed(1)
      : '5.0';

  const myStudentAtt = attendance.filter((a) => a.studentId === currentUser?.id);
  const myAttRate =
    myStudentAtt.length > 0
      ? Math.round(
          (myStudentAtt.filter((a) => a.status === 'present' || a.status === 'late').length /
            myStudentAtt.length) *
            100
        )
      : 98;

  const myClassObj = classes.find((c) => c.id === currentUser?.classId);
  const myHomework = homework.filter((h) => h.classId === currentUser?.classId);
  const myPendingHw = myHomework.filter(
    (h) => !h.completedStudentIds?.includes(currentUser?.id || '')
  );
  const myExams = exams.filter((e) => e.classId === currentUser?.classId);

  // Teacher perspective
  const teacherClasses = classes.filter(
    (c) =>
      c.classTeacherId === currentUser?.id ||
      currentUser?.assignedClasses?.includes(c.id)
  );

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold tracking-wider uppercase mb-3">
            38-MAKTAB PORTALI
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            {t('welcomeBack')}, {currentUser?.fullName} {currentUser?.surname}!
          </h2>
          <p className="text-blue-100 text-sm md:text-base mt-2 font-normal">
            {isAdmin && 'Maktab boshqaruv markaziga xush kelibsiz. Barcha tizim ko\'rsatkichlari, sinflar va foydalanuvchilar to\'liq nazorat ostida.'}
            {isTeacher && 'Pedagogik boshqaruv paneliga xush kelibsiz. Sinflaringiz davomati, baholari va uy vazifalarini kuzatib boring.'}
            {isStudent && 'Shaxsiy ta\'lim kabinetingizga xush kelibsiz. O\'zlashtirish, dars jadvali va berilgan topshiriqlarni ko\'ring.'}
          </p>

          {isAdmin && (
            <div className="flex flex-wrap gap-3 mt-5">
              <button
                id="dashboard-quick-create-user-btn"
                onClick={onOpenCreateUser}
                className="px-4 py-2.5 bg-white text-blue-800 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {t('createAccount')}
              </button>
              <button
                onClick={() => onNavigate('active-classes')}
                className="px-4 py-2.5 bg-blue-800/60 hover:bg-blue-800/90 text-white border border-white/20 rounded-xl font-bold text-xs transition-all flex items-center gap-2"
              >
                <Layers className="w-4 h-4" />
                {t('navActiveClasses')}
              </button>
            </div>
          )}
        </div>

        {/* Decorative Badge */}
        <div className="absolute right-6 -bottom-10 opacity-10 text-white font-black text-[180px] select-none pointer-events-none hidden md:block">
          38
        </div>
      </div>

      {/* ADMIN STATS */}
      {isAdmin && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('totalStudents')}
              value={allStudents.length}
              subtitle={`${activeStudents.length} ${t('active')}`}
              icon={GraduationCap}
              color="blue"
              onClick={() => onNavigate('active-students')}
            />
            <StatCard
              title={t('totalTeachers')}
              value={allTeachers.length}
              subtitle={`${activeTeachers.length} ${t('active')}`}
              icon={UserCheck}
              color="purple"
              onClick={() => onNavigate('active-teachers')}
            />
            <StatCard
              title={t('totalClasses')}
              value={classes.length}
              subtitle="1-dan 11-sinfgacha"
              icon={Layers}
              color="emerald"
              onClick={() => onNavigate('active-classes')}
            />
            <StatCard
              title={t('attendanceRate')}
              value={attendance.length > 0 ? `${overallAttRate}%` : "100%"}
              subtitle={attendance.length > 0 ? "Bugungi kun hisobiga" : "Davomat kiritilmagan"}
              icon={CalendarCheck}
              color="amber"
              onClick={() => onNavigate('attendance')}
            />
          </div>

          {/* Admin Two Column: Recent Activities & Announcements */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activities & Quick Table */}
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  {t('recentGrades')} va Baholash Harakatlari
                </h3>
                <button
                  onClick={() => onNavigate('grades')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Barchasini ko'rish <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-3">O'quvchi</th>
                      <th className="p-3">Sinf</th>
                      <th className="p-3">Fan</th>
                      <th className="p-3">Baho</th>
                      <th className="p-3">O'qituvchi</th>
                      <th className="p-3">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {grades.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-6 text-center text-slate-400">
                          Hozircha baholar qo'yilmagan. Admin yoki o'qituvchi "Baholar" bo'limida baholarni kiritadi.
                        </td>
                      </tr>
                    ) : (
                      grades.slice(0, 6).map((g) => (
                        <tr key={g.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{g.studentName}</td>
                          <td className="p-3 text-slate-500 font-medium">{g.classId}</td>
                          <td className="p-3 text-slate-700 dark:text-slate-300">{g.subjectName}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-extrabold">
                              {g.gradeValue}
                            </span>
                          </td>
                          <td className="p-3 text-slate-500">{g.teacherName}</td>
                          <td className="p-3 text-slate-400">{g.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Announcements Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-rose-500" />
                  {t('navAnnouncements')}
                </h3>
                <button
                  onClick={() => onNavigate('announcements')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Barchasi
                </button>
              </div>

              <div className="space-y-3">
                {announcements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">
                    Hozircha e'lonlar mavjud emas. Admin "E'lonlar" bo'limida yangi e'lon berishi mumkin.
                  </p>
                ) : (
                  announcements.slice(0, 3).map((ann) => (
                    <div
                      key={ann.id}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                          {ann.targetAudience}
                        </span>
                        <span className="text-[10px] text-slate-400">{ann.date}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                        {ann.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                        {ann.description}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* TEACHER DASHBOARD */}
      {isTeacher && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('navMyClasses')}
              value={teacherClasses.length || 3}
              subtitle="Biriktirilgan sinflar"
              icon={Layers}
              color="purple"
              onClick={() => onNavigate('my-classes')}
            />
            <StatCard
              title={t('navAttendance')}
              value={`${overallAttRate}%`}
              subtitle="Sinflaringiz davomati"
              icon={CalendarCheck}
              color="emerald"
              onClick={() => onNavigate('attendance')}
            />
            <StatCard
              title={t('navHomework')}
              value={homework.length}
              subtitle="Berilgan vazifalar"
              icon={CheckSquare}
              color="blue"
              onClick={() => onNavigate('homework')}
            />
            <StatCard
              title={t('navExams')}
              value={exams.length}
              subtitle="Rejalashtirilgan imtihonlar"
              icon={FileSpreadsheet}
              color="amber"
              onClick={() => onNavigate('exams')}
            />
          </div>

          {/* Teacher Action Board */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Classes */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-600" />
                {t('todaySchedule')}
              </h3>

              <div className="space-y-2.5">
                {schedule.slice(0, 4).map((s) => (
                  <div
                    key={s.id}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {s.period}-dars • {s.subjectName} ({s.classId})
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.startTime} - {s.endTime} • {s.room}-xona
                      </div>
                    </div>
                    <button
                      onClick={() => onNavigate('attendance')}
                      className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                    >
                      Davomat olish
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Grading & Student Activity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  Tezkor Baholash va Jurnal
                </h3>
                <button
                  onClick={() => onNavigate('grades')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  + Baho qo'yish
                </button>
              </div>

              <div className="space-y-2">
                {grades.slice(0, 5).map((g) => (
                  <div
                    key={g.id}
                    className="p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {g.studentName} <span className="text-slate-400">({g.classId})</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {g.subjectName} • {g.gradeType}
                      </div>
                    </div>
                    <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-black flex items-center justify-center text-xs">
                      {g.gradeValue}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* STUDENT DASHBOARD */}
      {isStudent && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t('averageScore')}
              value={myStudentGpa}
              subtitle="Umumiy o'zlashtirish ko'rsatkichi"
              icon={Award}
              color="blue"
              onClick={() => onNavigate('my-grades')}
            />
            <StatCard
              title={t('navMyAttendance')}
              value={`${myAttRate}%`}
              subtitle="Davomat darajasi"
              icon={CalendarCheck}
              color="emerald"
              onClick={() => onNavigate('my-attendance')}
            />
            <StatCard
              title={t('pendingHomeworkCount')}
              value={myPendingHw.length}
              subtitle="Topshirilishi kerak bo'lgan vazifalar"
              icon={CheckSquare}
              color="amber"
              onClick={() => onNavigate('homework')}
            />
            <StatCard
              title="Yaqinlashayotgan Imtihonlar"
              value={myExams.length}
              subtitle="Choraklik nazoratlar"
              icon={FileSpreadsheet}
              color="purple"
              onClick={() => onNavigate('exams')}
            />
          </div>

          {/* Student Two Column: Today's Schedule & Pending Homework */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Today's Lessons */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  {t('todaySchedule')} ({currentUser?.classId} sinf)
                </h3>
                <button
                  onClick={() => onNavigate('schedule')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Haftalik jadval
                </button>
              </div>

              <div className="space-y-2.5">
                {schedule
                  .filter((s) => s.dayOfWeek === 'Monday' && s.classId === currentUser?.classId)
                  .map((s) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs">
                          {s.period}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900 dark:text-white">
                            {s.subjectName}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {s.teacherName} • {s.room}-xona
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {s.startTime}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Pending Homework */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-amber-500" />
                  Uyga vazifalar ro'yxati
                </h3>
                <button
                  onClick={() => onNavigate('homework')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Barchasini ko'rish
                </button>
              </div>

              <div className="space-y-2.5">
                {myHomework.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Vazifalar berilmagan
                  </div>
                ) : (
                  myHomework.slice(0, 4).map((hw) => {
                    const isDone = hw.completedStudentIds?.includes(currentUser?.id || '');
                    return (
                      <div
                        key={hw.id}
                        className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-center justify-between border border-slate-200/60 dark:border-slate-700/60"
                      >
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase">
                            {hw.subjectName}
                          </span>
                          <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                            {hw.title}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Muddat: {hw.deadline}
                          </div>
                        </div>
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {isDone ? t('completed') : t('pending')}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
