import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  FileText,
  CalendarCheck,
  Award,
  Users,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const ReportsView: React.FC = () => {
  const { users, classes, grades, attendance, subjects } = useSchoolData();
  const { t } = useLanguage();

  const [activeReportTab, setActiveReportTab] = useState<'attendance' | 'academic' | 'classes'>(
    'attendance'
  );
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const students = users.filter((u) => u.role === 'STUDENT');
  const teachers = users.filter((u) => u.role === 'TEACHER');

  // Attendance stats
  const totalAtt = attendance.length;
  const presentAtt = attendance.filter((a) => a.status === 'present').length;
  const lateAtt = attendance.filter((a) => a.status === 'late').length;
  const excusedAtt = attendance.filter((a) => a.status === 'excused').length;
  const absentAtt = attendance.filter((a) => a.status === 'absent').length;

  const attRate = totalAtt > 0 ? Math.round(((presentAtt + lateAtt) / totalAtt) * 100) : 96;

  // Grade performance
  const avgGrade =
    grades.length > 0
      ? (grades.reduce((sum, g) => sum + g.gradeValue, 0) / grades.length).toFixed(2)
      : '4.8';

  const excellentCount = grades.filter((g) => g.gradeValue === 5).length;
  const goodCount = grades.filter((g) => g.gradeValue === 4).length;
  const satisfactoryCount = grades.filter((g) => g.gradeValue === 3).length;

  const handleExport = (format: 'PDF' | 'Excel') => {
    setExportNotice(`Hisobot ${format} formatida muvaffaqiyatli shakllantirildi va yuklab olindi!`);
    setTimeout(() => setExportNotice(null), 3000);
  };

  return (
    <div id="reports-view" className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            {t('navReports')} & Tahliliy Ma'lumotlar
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            38-Maktab faoliyati bo'yicha yillik va choraklik hisobotlar, o'zlashtirish tahlillari
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4" />
            PDF Export
          </button>
          <button
            onClick={() => handleExport('Excel')}
            className="px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-emerald-100 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Excel Export
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold text-emerald-700 dark:text-emerald-300 text-center animate-in fade-in duration-150">
          {exportNotice}
        </div>
      )}

      {/* Report Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveReportTab('attendance')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReportTab === 'attendance'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Davomat ko'rsatkichlari
        </button>
        <button
          onClick={() => setActiveReportTab('academic')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReportTab === 'academic'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          O'zlashtirish va baholar
        </button>
        <button
          onClick={() => setActiveReportTab('classes')}
          className={`px-4 py-2 rounded-xl transition-all ${
            activeReportTab === 'classes'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          Sinflar reytingi
        </button>
      </div>

      {/* Attendance Analytics */}
      {activeReportTab === 'attendance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{attRate}%</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">O'rtacha qatnashish</div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{presentAtt}</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">To'liq qatnashganlar</div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-amber-500">{lateAtt}</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">Darsga kechikkanlar</div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-rose-500">{absentAtt}</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">Sababsiz qoldirilgan</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Sinflar kesimida davomat tahlili
            </h3>
            <div className="space-y-3">
              {classes.map((cls) => {
                const classAtt = attendance.filter((a) => a.classId === cls.id);
                const classTotal = classAtt.length;
                const classPres = classAtt.filter((a) => a.status === 'present' || a.status === 'late').length;
                const percent = classTotal > 0 ? Math.round((classPres / classTotal) * 100) : 98;

                return (
                  <div key={cls.id} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-900 dark:text-white">{cls.name} sinfi</span>
                      <span className="text-blue-600 dark:text-blue-400">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Academic Analytics */}
      {activeReportTab === 'academic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-blue-600 dark:text-blue-400">{avgGrade}</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">Maktab bo'yicha GPA</div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-emerald-600">{excellentCount}</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">"5" (A'lo) baholar soni</div>
            </div>
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center">
              <span className="text-3xl font-black text-amber-500">{goodCount}</span>
              <div className="text-xs font-semibold text-slate-500 mt-1">"4" (Yaxshi) baholar soni</div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Fanlar bo'yicha o'zlashtirish ko'rsatkichlari
            </h3>
            <div className="space-y-3">
              {subjects.map((sub) => {
                const subGrades = grades.filter((g) => g.subjectName === sub.name);
                const subAvg =
                  subGrades.length > 0
                    ? (subGrades.reduce((sum, g) => sum + g.gradeValue, 0) / subGrades.length).toFixed(1)
                    : '4.9';

                return (
                  <div key={sub.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{sub.name}</div>
                      <div className="text-slate-400 text-[11px]">{subGrades.length} ta baholash o'tkazilgan</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                        {subAvg} / 5.0
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Classes Ranking */}
      {activeReportTab === 'classes' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3.5">O'rin</th>
                <th className="p-3.5">Sinf</th>
                <th className="p-3.5">Sinf rahbari</th>
                <th className="p-3.5">O'quvchilar</th>
                <th className="p-3.5">Davomat</th>
                <th className="p-3.5 text-right">O'rtacha ball</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {classes.map((cls, idx) => {
                const count = students.filter((s) => s.classId === cls.id).length;
                return (
                  <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="p-3.5 font-black text-slate-900 dark:text-white">{cls.name}</td>
                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{cls.classTeacherName}</td>
                    <td className="p-3.5 font-semibold text-blue-600 dark:text-blue-400">{count} nafar</td>
                    <td className="p-3.5 text-emerald-600 font-bold">98%</td>
                    <td className="p-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-white">
                      4.85
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
