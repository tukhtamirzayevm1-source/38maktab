import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Users,
  DoorOpen,
  UserCheck,
  Search,
  Edit2,
  Trash2,
  GraduationCap,
  Clock,
  BookOpen,
  CheckSquare,
  CalendarCheck,
  ArrowLeft,
  UserPlus,
  Compass,
  Sparkles,
  Phone,
  Filter,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { ConfirmModal } from '../common/ConfirmModal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { SchoolClass, User, AttendanceStatus, DayOfWeek } from '../../types';

interface ClassesViewProps {
  onViewStudent: (student: User) => void;
}

export const ClassesView: React.FC<ClassesViewProps> = ({ onViewStudent }) => {
  const {
    classes,
    users,
    subjects,
    schedule,
    homework,
    attendance,
    addClass,
    updateClass,
    deleteClass,
    createUser,
    assignStudentToClass,
    removeStudentFromClass,
    deleteUser,
    generateParallelClasses,
    addScheduleItem,
    deleteScheduleItem,
    addHomework,
    deleteHomework,
    markAttendance,
  } = useSchoolData();

  const { currentUser, isAdmin, isTeacher } = useAuth();
  const { t } = useLanguage();

  // Active view states
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [gradeFilter, setGradeFilter] = useState<string>('ALL'); // 'ALL', '1', '2' ... '11', 'PRIMARY', 'MIDDLE', 'HIGH'
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmAction, setConfirmAction] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    danger?: boolean;
    onConfirm: () => void;
  } | null>(null);

  // Modals
  const [isAddClassModalOpen, setIsAddClassModalOpen] = useState(false);
  const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);
  const [isAddHomeworkModalOpen, setIsAddHomeworkModalOpen] = useState(false);

  // Selected Class Sub-tab
  const [classDetailTab, setClassDetailTab] = useState<'students' | 'schedule' | 'homework' | 'attendance'>('students');

  // Attendance date in class view
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceSubject, setAttendanceSubject] = useState('');

  // Class Form states (1-11 and A, B, D parallels)
  const [formGradeLevel, setFormGradeLevel] = useState<number>(9);
  const [formSection, setFormSection] = useState<string>('A');
  const [formDirection, setFormDirection] = useState<string>("Umumiy ta'lim");
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formCustomTeacherName, setFormCustomTeacherName] = useState<string>('');
  const [formRoomNumber, setFormRoomNumber] = useState<string>('101');
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);

  // Student Form states
  const [studentMode, setStudentMode] = useState<'create' | 'existing'>('create');
  const [newStudentFullName, setNewStudentFullName] = useState('');
  const [newStudentSurname, setNewStudentSurname] = useState('');
  const [newStudentGender, setNewStudentGender] = useState<'male' | 'female'>('male');
  const [newStudentBirthDate, setNewStudentBirthDate] = useState('2010-05-15');
  const [newStudentPhone, setNewStudentPhone] = useState('+998 90 ');
  const [newStudentParentName, setNewStudentParentName] = useState('');
  const [newStudentParentPhone, setNewStudentParentPhone] = useState('+998 90 ');
  const [newStudentLogin, setNewStudentLogin] = useState('');
  const [newStudentPassword, setNewStudentPassword] = useState('talaba123');
  const [selectedExistingStudentId, setSelectedExistingStudentId] = useState('');

  // Schedule Form states
  const [schedDay, setSchedDay] = useState<DayOfWeek>('Dushanba');
  const [schedPeriod, setSchedPeriod] = useState<number>(1);
  const [schedSubject, setSchedSubject] = useState<string>('');
  const [schedTeacherId, setSchedTeacherId] = useState<string>('');
  const [schedRoom, setSchedRoom] = useState<string>('101');
  const [schedStartTime, setSchedStartTime] = useState<string>('08:00');
  const [schedEndTime, setSchedEndTime] = useState<string>('08:45');

  // Homework Form states
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('');
  const [hwDescription, setHwDescription] = useState('');
  const [hwDueDate, setHwDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  const teachers = users.filter((u) => u.role === 'TEACHER');
  const allStudents = users.filter((u) => u.role === 'STUDENT');

  // Determine classes visible to current user
  const visibleClasses = isAdmin
    ? classes
    : isTeacher
    ? classes.filter(
        (c) =>
          c.classTeacherId === currentUser?.id ||
          currentUser?.assignedClasses?.includes(c.id)
      )
    : classes.filter((c) => c.id === currentUser?.classId);

  // Filtered by Grade tab & search
  const filteredClasses = visibleClasses.filter((c) => {
    if (gradeFilter === 'PRIMARY' && (c.gradeLevel < 1 || c.gradeLevel > 4)) return false;
    if (gradeFilter === 'MIDDLE' && (c.gradeLevel < 5 || c.gradeLevel > 9)) return false;
    if (gradeFilter === 'HIGH' && (c.gradeLevel < 10 || c.gradeLevel > 11)) return false;
    if (gradeFilter !== 'ALL' && gradeFilter !== 'PRIMARY' && gradeFilter !== 'MIDDLE' && gradeFilter !== 'HIGH') {
      if (c.gradeLevel.toString() !== gradeFilter) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.classTeacherName.toLowerCase().includes(q) ||
        (c.direction && c.direction.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Sort classes 1 to 11, then A, B, D
  filteredClasses.sort((a, b) => {
    if (a.gradeLevel !== b.gradeLevel) return a.gradeLevel - b.gradeLevel;
    return (a.section || '').localeCompare(b.section || '');
  });

  // Current selected class
  const activeClass = classes.find((c) => c.id === selectedClassId) || null;

  // Students in activeClass
  const activeClassStudents = activeClass
    ? users.filter((u) => u.role === 'STUDENT' && u.classId === activeClass.id)
    : [];

  // Unassigned students or students in other classes
  const unassignedStudents = users.filter(
    (u) => u.role === 'STUDENT' && (!u.classId || u.classId !== activeClass?.id)
  );

  // Active class schedule
  const activeClassSchedule = activeClass
    ? schedule.filter((s) => s.classId === activeClass.id)
    : [];

  // Active class homework
  const activeClassHomework = activeClass
    ? homework.filter((h) => h.classId === activeClass.id)
    : [];

  // Active class attendance
  const activeClassAttendance = activeClass
    ? attendance.filter((a) => a.classId === activeClass.id && a.date === attendanceDate)
    : [];

  // Direction presets
  const directionPresets = [
    "Umumiy ta'lim",
    "Aniq fanlar (Matematika, Fizika)",
    "Tabiiy fanlar (Biologiya, Kimyo)",
    "Xorijiy tillar (Ingliz tili)",
    "IT va Dasturlash",
    "Ijtimoiy-gumanitar",
  ];

  // Helper to open Add Class modal
  const handleOpenAddClass = () => {
    setFormGradeLevel(1);
    setFormSection('A');
    setFormDirection("Umumiy ta'lim");
    setFormTeacherId(teachers[0]?.id || '');
    setFormCustomTeacherName('');
    setFormRoomNumber('101');
    setIsAddClassModalOpen(true);
  };

  // Create single Class (1-11 A, B, D)
  const handleSaveAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    const className = `${formGradeLevel}-${formSection} sinf`;
    const classId = `${formGradeLevel}-${formSection}`;

    const teacher = teachers.find((t) => t.id === formTeacherId);
    const teacherName = teacher
      ? `${teacher.fullName} ${teacher.surname}`
      : formCustomTeacherName.trim() || 'Tayinlanmagan';

    const created = addClass({
      name: className,
      gradeLevel: formGradeLevel,
      section: formSection,
      direction: formDirection,
      classTeacherId: formTeacherId || '',
      classTeacherName: teacherName,
      roomNumber: formRoomNumber,
      academicYear: '2025-2026',
      studentCount: 0,
      averageGrade: 5.0,
      attendanceRate: 100,
    });

    setIsAddClassModalOpen(false);
    setSelectedClassId(created.id || classId);
  };

  // Open Edit Class Modal
  const handleOpenEditClass = (cls: SchoolClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingClass(cls);
    setFormGradeLevel(cls.gradeLevel);
    setFormSection(cls.section || 'A');
    setFormDirection(cls.direction || "Umumiy ta'lim");
    setFormTeacherId(cls.classTeacherId || '');
    setFormCustomTeacherName(cls.classTeacherName || '');
    setFormRoomNumber(cls.roomNumber || '101');
    setIsEditClassModalOpen(true);
  };

  // Save Edit Class
  const handleSaveEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass) return;

    const teacher = teachers.find((t) => t.id === formTeacherId);
    const teacherName = teacher
      ? `${teacher.fullName} ${teacher.surname}`
      : formCustomTeacherName.trim() || editingClass.classTeacherName;

    updateClass(editingClass.id, {
      name: `${formGradeLevel}-${formSection} sinf`,
      gradeLevel: formGradeLevel,
      section: formSection,
      direction: formDirection,
      classTeacherId: formTeacherId || '',
      classTeacherName: teacherName,
      roomNumber: formRoomNumber,
    });

    setIsEditClassModalOpen(false);
    setEditingClass(null);
  };

  // Delete Class
  const handleDeleteClass = (cls: SchoolClass, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmAction({
      isOpen: true,
      title: "Sinfni o'chirish",
      message: `"${cls.name}" sinfini o'chirmoqchimisiz? Bu sinfdagi barcha o'quvchilar sinfdan ajratiladi.`,
      confirmText: "O'chirish",
      danger: true,
      onConfirm: () => {
        deleteClass(cls.id);
        if (selectedClassId === cls.id) {
          setSelectedClassId(null);
        }
      },
    });
  };

  // Add Student to Class
  const handleOpenAddStudent = () => {
    setStudentMode('create');
    setNewStudentFullName('');
    setNewStudentSurname('');
    setNewStudentGender('male');
    setNewStudentBirthDate('2010-05-15');
    setNewStudentPhone('+998 90 ');
    setNewStudentParentName('');
    setNewStudentParentPhone('+998 90 ');
    const autoLogin = `st_${Math.floor(1000 + Math.random() * 9000)}`;
    setNewStudentLogin(autoLogin);
    setNewStudentPassword('talaba123');
    setSelectedExistingStudentId(unassignedStudents[0]?.id || '');
    setIsAddStudentModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;

    if (studentMode === 'existing') {
      if (!selectedExistingStudentId) return;
      assignStudentToClass(selectedExistingStudentId, activeClass.id);
      setIsAddStudentModalOpen(false);
      return;
    }

    // Create fresh student
    if (!newStudentFullName.trim() || !newStudentSurname.trim()) return;

    const randomPhoto =
      newStudentGender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80';

    createUser({
      login: newStudentLogin.trim() || `st_${Date.now().toString().slice(-4)}`,
      password: newStudentPassword.trim() || 'talaba123',
      role: 'STUDENT',
      fullName: newStudentFullName.trim(),
      surname: newStudentSurname.trim(),
      email: `${newStudentLogin.trim() || 'student'}@38-maktab.uz`,
      dateOfBirth: newStudentBirthDate,
      gender: newStudentGender,
      phone: newStudentPhone.trim(),
      address: "Toshkent shahri",
      photoUrl: randomPhoto,
      status: 'active',
      classId: activeClass.id,
      parentName: newStudentParentName.trim(),
      parentPhone: newStudentParentPhone.trim(),
      studentId: `ST-38-${Math.floor(1000 + Math.random() * 9000)}`,
    });

    setIsAddStudentModalOpen(false);
  };

  // Add Schedule Item
  const handleOpenAddSchedule = () => {
    setSchedDay('Dushanba');
    setSchedPeriod(1);
    setSchedSubject(subjects[0]?.name || 'Matematika');
    setSchedTeacherId(teachers[0]?.id || '');
    setSchedRoom(activeClass?.roomNumber || '101');
    setSchedStartTime('08:00');
    setSchedEndTime('08:45');
    setIsAddScheduleModalOpen(true);
  };

  const handleSaveSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;

    const teacher = teachers.find((t) => t.id === schedTeacherId);
    const teacherName = teacher ? `${teacher.fullName} ${teacher.surname}` : activeClass.classTeacherName;

    addScheduleItem({
      classId: activeClass.id,
      dayOfWeek: schedDay,
      period: Number(schedPeriod),
      startTime: schedStartTime,
      endTime: schedEndTime,
      subjectName: schedSubject || 'Matematika',
      teacherId: schedTeacherId || '',
      teacherName: teacherName,
      roomNumber: schedRoom,
    });

    setIsAddScheduleModalOpen(false);
  };

  // Add Homework
  const handleOpenAddHomework = () => {
    setHwTitle('');
    setHwSubject(subjects[0]?.name || 'Matematika');
    setHwDescription('');
    setHwDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setIsAddHomeworkModalOpen(true);
  };

  const handleSaveHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClass) return;

    const teacherName = currentUser ? `${currentUser.fullName} ${currentUser.surname}` : activeClass.classTeacherName;

    addHomework({
      classId: activeClass.id,
      subjectName: hwSubject || 'Matematika',
      teacherId: currentUser?.id || activeClass.classTeacherId || 'admin',
      teacherName: teacherName,
      title: hwTitle.trim() || 'Vazifa',
      description: hwDescription.trim() || 'Darslikdagi mashqlarni bajarish',
      deadline: hwDueDate,
      dueDate: hwDueDate,
      completedBy: [],
      completedStudentIds: [],
    });

    setIsAddHomeworkModalOpen(false);
  };

  // Quick Attendance Roll-Call in Class View
  const handleClassAttendanceMark = (student: User, status: AttendanceStatus) => {
    if (!activeClass) return;
    markAttendance({
      studentId: student.id,
      studentName: `${student.fullName} ${student.surname}`,
      classId: activeClass.id,
      subjectName: attendanceSubject || 'Umumiy kunlik',
      date: attendanceDate,
      status,
    });
  };

  const handleMarkAllClassPresent = () => {
    if (!activeClass) return;
    activeClassStudents.forEach((st) => {
      markAttendance({
        studentId: st.id,
        studentName: `${st.fullName} ${st.surname}`,
        classId: activeClass.id,
        subjectName: attendanceSubject || 'Umumiy kunlik',
        date: attendanceDate,
        status: 'present',
      });
    });
  };

  // ==========================================
  // VIEW 1: SINGLE CLASS DETAIL VIEW
  // (When user clicks on a class card)
  // ==========================================
  if (activeClass) {
    return (
      <div id="class-detail-view" className="space-y-6">
        {/* Back navigation & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedClassId(null)}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
              title="Barcha sinflarga qaytish"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {activeClass.name}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-extrabold">
                  {activeClass.direction || "Umumiy ta'lim"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 text-xs font-bold">
                  {activeClass.academicYear || '2025-2026'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Xona: {activeClass.roomNumber} • O'quvchilar: {activeClassStudents.length} nafar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <>
                <button
                  id="edit-class-header-btn"
                  onClick={() => handleOpenEditClass(activeClass)}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Sinfni tahrirlash</span>
                </button>
                <button
                  id="delete-class-header-btn"
                  onClick={() => handleDeleteClass(activeClass)}
                  className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>O'chirish</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Hero Card: Sinf Rahbari & Direction Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Class Teacher Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sinf Rahbari
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeClass.classTeacherName || 'Tayinlanmagan'}
                </h4>
                <p className="text-[11px] text-slate-500">Bosh mas'ul o'qituvchi</p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => handleOpenEditClass(activeClass)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
              >
                O'zgartirish
              </button>
            )}
          </div>

          {/* Direction Card */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Sinf Yo'nalishi
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeClass.direction || "Umumiy ta'lim"}
                </h4>
                <p className="text-[11px] text-slate-500">Ixtisoslashuv profili</p>
              </div>
            </div>

            {isAdmin && (
              <button
                onClick={() => handleOpenEditClass(activeClass)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200"
              >
                O'zgartirish
              </button>
            )}
          </div>

          {/* Room & Capacity */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <DoorOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Xona va Sig'im
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {activeClass.roomNumber}-xona
                </h4>
                <p className="text-[11px] text-slate-500">
                  Hozirda {activeClassStudents.length} nafar o'quvchi
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-black">
              {activeClass.section || 'A'}-parallel
            </span>
          </div>
        </div>

        {/* Class Sub-Tabs Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
          <button
            id="tab-students"
            onClick={() => setClassDetailTab('students')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              classDetailTab === 'students'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>O'quvchilar ro'yxati</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
              {activeClassStudents.length}
            </span>
          </button>

          <button
            id="tab-schedule"
            onClick={() => setClassDetailTab('schedule')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              classDetailTab === 'schedule'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Dars jadvali</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
              {activeClassSchedule.length}
            </span>
          </button>

          <button
            id="tab-homework"
            onClick={() => setClassDetailTab('homework')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              classDetailTab === 'homework'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Uyga vazifalar</span>
            <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px]">
              {activeClassHomework.length}
            </span>
          </button>

          <button
            id="tab-attendance"
            onClick={() => setClassDetailTab('attendance')}
            className={`pb-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              classDetailTab === 'attendance'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Davomat jurnali</span>
          </button>
        </div>

        {/* SUB-TAB 1: STUDENTS LIST */}
        {classDetailTab === 'students' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeClass.name} o'quvchilari
                </h3>
                <p className="text-xs text-slate-500">
                  Bu sinfga biriktirilgan barcha o'quvchilar ro'yxati va ularning ota-onalari ma'lumotlari
                </p>
              </div>

              {isAdmin && (
                <button
                  id="add-student-to-class-btn"
                  onClick={handleOpenAddStudent}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>O'quvchi qo'shish</span>
                </button>
              )}
            </div>

            {activeClassStudents.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Ushbu sinfda hozircha o'quvchilar ro'yxatga olinmagan
                </h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Admin sifatida yuqoridagi "O'quvchi qo'shish" tugmasi orqali yangi o'quvchi yaratishingiz yoki maktabdagi boshqa o'quvchini ushbu sinfga biriktirishingiz mumkin.
                </p>
                {isAdmin && (
                  <button
                    onClick={handleOpenAddStudent}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Birinchi o'quvchini qo'shish
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="p-3">№</th>
                      <th className="p-3">O'quvchi</th>
                      <th className="p-3">Login / ID</th>
                      <th className="p-3">Telefon</th>
                      <th className="p-3">Ota-onasi</th>
                      <th className="p-3">Ota-ona telefoni</th>
                      <th className="p-3 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeClassStudents.map((st, idx) => (
                      <tr
                        key={st.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="p-3 font-semibold text-slate-400">{idx + 1}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={st.photoUrl}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                            <div>
                              <div className="font-extrabold">{st.fullName} {st.surname}</div>
                              <div className="text-[10px] text-slate-400">{st.gender === 'female' ? 'Qiz bola' : 'O\'g\'il bola'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="font-mono text-blue-600 dark:text-blue-400 font-bold">{st.login}</div>
                          <div className="font-mono text-[10px] text-slate-400">{st.studentId || 'ID yo\'q'}</div>
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                          {st.phone || '—'}
                        </td>
                        <td className="p-3 text-slate-700 dark:text-slate-200 font-semibold">
                          {st.parentName || '—'}
                        </td>
                        <td className="p-3 text-slate-600 dark:text-slate-300 font-medium">
                          {st.parentPhone || '—'}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onViewStudent(st)}
                              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-[11px]"
                            >
                              Profil
                            </button>
                            {isAdmin && (
                              <>
                                <button
                                  onClick={() => {
                                    setConfirmAction({
                                      isOpen: true,
                                      title: "Sinfdan chiqarish",
                                      message: `"${st.fullName} ${st.surname}" o'quvchisini ushbu sinfdan chiqarmoqchimisiz?`,
                                      confirmText: "Sinfdan chiqarish",
                                      danger: false,
                                      onConfirm: () => removeStudentFromClass(st.id),
                                    });
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-bold text-[11px]"
                                  title="Sinfdan chiqarish"
                                >
                                  Sinfdan chiqarish
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmAction({
                                      isOpen: true,
                                      title: "O'quvchini butunlay o'chirish",
                                      message: `"${st.fullName} ${st.surname}" hisobini tizimdan butunlay o'chirmoqchimisiz?`,
                                      confirmText: "O'chirish",
                                      danger: true,
                                      onConfirm: () => deleteUser(st.id),
                                    });
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                  title="O'quvchini o'chirish"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 2: SCHEDULE */}
        {classDetailTab === 'schedule' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeClass.name} dars jadvali
                </h3>
                <p className="text-xs text-slate-500">
                  Haftalik dars soatlari, fanlar va biriktirilgan o'qituvchilar
                </p>
              </div>

              {isAdmin && (
                <button
                  id="add-class-schedule-btn"
                  onClick={handleOpenAddSchedule}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Dars qo'shish</span>
                </button>
              )}
            </div>

            {activeClassSchedule.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">Ushbu sinf uchun hozircha dars jadvali tuzilmagan</p>
                {isAdmin && (
                  <button
                    onClick={handleOpenAddSchedule}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold"
                  >
                    Birinchi darsni kiritish
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'] as DayOfWeek[]).map((day) => {
                  const dayItems = activeClassSchedule
                    .filter((s) => s.dayOfWeek === day)
                    .sort((a, b) => a.period - b.period);

                  return (
                    <div
                      key={day}
                      className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 space-y-2"
                    >
                      <div className="font-black text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800 pb-1.5">
                        <span>{day}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{dayItems.length} ta dars</span>
                      </div>

                      {dayItems.length === 0 ? (
                        <div className="text-[11px] text-slate-400 italic py-2">Darslar yo'q</div>
                      ) : (
                        <div className="space-y-1.5">
                          {dayItems.map((item) => (
                            <div
                              key={item.id}
                              className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs"
                            >
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {item.period}-soat: {item.subjectName}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  {item.teacherName} • {item.roomNumber}-xona
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-slate-500">
                                  {item.startTime}
                                </span>
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      setConfirmAction({
                                        isOpen: true,
                                        title: "Darsni o'chirish",
                                        message: `"${item.subjectName}" (${item.period}-soat) darsini dars jadvalidan o'chirmoqchimisiz?`,
                                        confirmText: "O'chirish",
                                        danger: true,
                                        onConfirm: () => deleteScheduleItem(item.id),
                                      });
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                                    title="Darsni o'chirish"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 3: HOMEWORK */}
        {classDetailTab === 'homework' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeClass.name} uyga vazifalari
                </h3>
                <p className="text-xs text-slate-500">
                  Ushbu sinfga o'qituvchilar tomonidan berilgan topshiriqlar va topshirish muddatlari
                </p>
              </div>

              {(isAdmin || isTeacher) && (
                <button
                  id="add-class-homework-btn"
                  onClick={handleOpenAddHomework}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Uyga vazifa berish</span>
                </button>
              )}
            </div>

            {activeClassHomework.length === 0 ? (
              <div className="py-10 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <CheckSquare className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs text-slate-500">Ushbu sinf uchun faol uyga vazifalar berilmagan</p>
                {(isAdmin || isTeacher) && (
                  <button
                    onClick={handleOpenAddHomework}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
                  >
                    Yangi vazifa berish
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeClassHomework.map((hw) => (
                  <div
                    key={hw.id}
                    className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 text-xs font-black">
                        {hw.subjectName}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-rose-600">
                          Muddat: {hw.dueDate || hw.deadline}
                        </span>
                        {(isAdmin || isTeacher) && (
                          <button
                            onClick={() => {
                              setConfirmAction({
                                isOpen: true,
                                title: "Uy vazifasini o'chirish",
                                message: `"${hw.title}" topshirig'ini o'chirmoqchimisiz?`,
                                confirmText: "O'chirish",
                                danger: true,
                                onConfirm: () => deleteHomework(hw.id),
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      {hw.title}
                    </h4>

                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                      {hw.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                      <span>O'qituvchi: {hw.teacherName}</span>
                      <span>Topshirganlar: {hw.completedBy?.length ?? hw.completedStudentIds?.length ?? 0} nafar</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SUB-TAB 4: ATTENDANCE ROLL CALL */}
        {classDetailTab === 'attendance' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {activeClass.name} davomat jurnali
                </h3>
                <p className="text-xs text-slate-500">
                  O'quvchilarning darslarga qatnashuvini belgilash
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
                />
                <button
                  onClick={handleMarkAllClassPresent}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                >
                  Barchasini kelgan qilish
                </button>
              </div>
            </div>

            {activeClassStudents.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                Davomat olish uchun avval ushbu sinfga o'quvchilarni qo'shing.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold">
                    <tr>
                      <th className="p-3">№</th>
                      <th className="p-3">O'quvchi</th>
                      <th className="p-3 text-center">Holati</th>
                      <th className="p-3 text-right">Tezkor belgilash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {activeClassStudents.map((st, idx) => {
                      const rec = activeClassAttendance.find((a) => a.studentId === st.id);
                      const status = rec?.status || 'present';

                      return (
                        <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3 text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {st.fullName} {st.surname}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-md text-[11px] font-black ${
                                status === 'present'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                  : status === 'excused'
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                  : status === 'late'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                              }`}
                            >
                              {status === 'present'
                                ? 'Kelgan'
                                : status === 'excused'
                                ? 'Sababli'
                                : status === 'late'
                                ? 'Kechikkan'
                                : 'Sababsiz'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => handleClassAttendanceMark(st, 'present')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  status === 'present'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                Kelgan
                              </button>
                              <button
                                onClick={() => handleClassAttendanceMark(st, 'excused')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  status === 'excused'
                                    ? 'bg-amber-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                Sababli
                              </button>
                              <button
                                onClick={() => handleClassAttendanceMark(st, 'absent')}
                                className={`px-2 py-1 rounded text-[10px] font-bold ${
                                  status === 'absent'
                                    ? 'bg-rose-600 text-white'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
                                }`}
                              >
                                Sababsiz
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* MODAL 1: ADD STUDENT TO THIS CLASS */}
        <Modal
          isOpen={isAddStudentModalOpen}
          onClose={() => setIsAddStudentModalOpen(false)}
          title={`${activeClass.name} sinfiga o'quvchi qo'shish`}
          maxWidth="lg"
        >
          <form onSubmit={handleSaveStudent} className="space-y-4">
            {unassignedStudents.length > 0 && (
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStudentMode('create')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    studentMode === 'create'
                      ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                      : 'text-slate-500'
                  }`}
                >
                  Yangi o'quvchi yaratish
                </button>
                <button
                  type="button"
                  onClick={() => setStudentMode('existing')}
                  className={`flex-1 py-1.5 rounded-lg transition-all ${
                    studentMode === 'existing'
                      ? 'bg-white dark:bg-slate-900 shadow-xs text-slate-900 dark:text-white'
                      : 'text-slate-500'
                  }`}
                >
                  Mavjud o'quvchini biriktirish ({unassignedStudents.length})
                </button>
              </div>
            )}

            {studentMode === 'existing' ? (
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Maktabdagi o'quvchini tanlang:
                </label>
                <select
                  value={selectedExistingStudentId}
                  onChange={(e) => setSelectedExistingStudentId(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                >
                  {unassignedStudents.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.fullName} {st.surname} (Hozirgi: {st.classId || 'Sinfi yo\'q'})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-500">
                  Tanlangan o'quvchi to'g'ridan-to'g'ri {activeClass.name} sinfi ro'yxatiga o'tkaziladi.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ismi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Jasur"
                      value={newStudentFullName}
                      onChange={(e) => setNewStudentFullName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Familiyasi *</label>
                    <input
                      type="text"
                      required
                      placeholder="Sobirov"
                      value={newStudentSurname}
                      onChange={(e) => setNewStudentSurname(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Jinsi</label>
                    <select
                      value={newStudentGender}
                      onChange={(e) => setNewStudentGender(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                    >
                      <option value="male">O'g'il bola</option>
                      <option value="female">Qiz bola</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Tug'ilgan sanasi</label>
                    <input
                      type="date"
                      value={newStudentBirthDate}
                      onChange={(e) => setNewStudentBirthDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ota-onasi ismi</label>
                    <input
                      type="text"
                      placeholder="Sobirov Dilshod"
                      value={newStudentParentName}
                      onChange={(e) => setNewStudentParentName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Ota-onasi telefoni</label>
                    <input
                      type="text"
                      placeholder="+998 90 123 45 67"
                      value={newStudentParentPhone}
                      onChange={(e) => setNewStudentParentPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60 space-y-2">
                  <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider">
                    O'quvchining tizimga kirish ma'lumotlari (Admin tomonidan yaratiladi)
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500">Login:</span>
                      <input
                        type="text"
                        required
                        value={newStudentLogin}
                        onChange={(e) => setNewStudentLogin(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-blue-200 bg-white dark:bg-slate-900 text-xs font-mono font-bold mt-0.5"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500">Parol:</span>
                      <input
                        type="text"
                        required
                        value={newStudentPassword}
                        onChange={(e) => setNewStudentPassword(e.target.value)}
                        className="w-full p-1.5 rounded-lg border border-blue-200 bg-white dark:bg-slate-900 text-xs font-mono font-bold mt-0.5"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddStudentModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                O'quvchini saqlash
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL 2: ADD SCHEDULE LESSON */}
        <Modal
          isOpen={isAddScheduleModalOpen}
          onClose={() => setIsAddScheduleModalOpen(false)}
          title={`${activeClass.name} uchun dars qo'shish`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveSchedule} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Hafta kuni</label>
                <select
                  value={schedDay}
                  onChange={(e) => setSchedDay(e.target.value as DayOfWeek)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                >
                  <option value="Dushanba">Dushanba</option>
                  <option value="Seshanba">Seshanba</option>
                  <option value="Chorshanba">Chorshanba</option>
                  <option value="Payshanba">Payshanba</option>
                  <option value="Juma">Juma</option>
                  <option value="Shanba">Shanba</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dars soati (Para)</label>
                <select
                  value={schedPeriod}
                  onChange={(e) => setSchedPeriod(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                >
                  <option value={1}>1-soat (08:00 - 08:45)</option>
                  <option value={2}>2-soat (08:50 - 09:35)</option>
                  <option value={3}>3-soat (09:40 - 10:25)</option>
                  <option value={4}>4-soat (10:40 - 11:25)</option>
                  <option value={5}>5-soat (11:30 - 12:15)</option>
                  <option value={6}>6-soat (12:20 - 13:05)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fan nomi</label>
              <input
                type="text"
                required
                placeholder="Matematika"
                value={schedSubject}
                onChange={(e) => setSchedSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Dars beruvchi o'qituvchi</label>
              <select
                value={schedTeacherId}
                onChange={(e) => setSchedTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              >
                <option value="">{activeClass.classTeacherName || 'Sinf rahbari'}</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} {t.surname} ({t.subjects?.join(', ') || t.assignedSubjects?.join(', ') || 'O\'qituvchi'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Xona raqami</label>
                <input
                  type="text"
                  value={schedRoom}
                  onChange={(e) => setSchedRoom(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Boshlanish vaqti</label>
                <input
                  type="time"
                  value={schedStartTime}
                  onChange={(e) => setSchedStartTime(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Darsni kiritish
              </button>
            </div>
          </form>
        </Modal>

        {/* MODAL 3: ADD HOMEWORK */}
        <Modal
          isOpen={isAddHomeworkModalOpen}
          onClose={() => setIsAddHomeworkModalOpen(false)}
          title={`${activeClass.name} uchun uyga vazifa berish`}
          maxWidth="md"
        >
          <form onSubmit={handleSaveHomework} className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Fan nomi</label>
              <input
                type="text"
                required
                placeholder="Masalan: Matematika"
                value={hwSubject}
                onChange={(e) => setHwSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Mavzu / Vazifa sarlavhasi</label>
              <input
                type="text"
                required
                placeholder="Kvadrat tenglamalar yechish. 142-148 mashqlar"
                value={hwTitle}
                onChange={(e) => setHwTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vazifa tavsifi / topshiriq</label>
              <textarea
                rows={3}
                required
                placeholder="Darslikning 84-betidagi qoidalarni yod olish va 12-mashqni daftarga bajarish."
                value={hwDescription}
                onChange={(e) => setHwDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Topshirish oxirgi muddati</label>
              <input
                type="date"
                required
                value={hwDueDate}
                onChange={(e) => setHwDueDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddHomeworkModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Vazifani e'lon qilish
              </button>
            </div>
          </form>
        </Modal>

        {/* Confirmation Modal */}
        <ConfirmModal
          isOpen={!!confirmAction?.isOpen}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            if (confirmAction) {
              confirmAction.onConfirm();
              setConfirmAction(null);
            }
          }}
          title={confirmAction?.title || "Tasdiqlash"}
          message={confirmAction?.message || ""}
          confirmText={confirmAction?.confirmText || "Tasdiqlash"}
          danger={confirmAction?.danger ?? true}
        />
      </div>
    );
  }

  // ==========================================
  // VIEW 2: MAIN CLASSES OVERVIEW
  // (Cards grid with 1-11 grade filters, parallel letters A, B, D)
  // ==========================================
  return (
    <div id="classes-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-emerald-600" />
            <span>Sinflar Bo'limi (1-sinfdan 11-sinfgacha parallel sinflar)</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Admin tomonidan 1 dan 11-sinfgacha A, B, D parallel sinflar yaratiladi. Har bir sinfni bosib uning o'quvchilari, sinf rahbari va dars jadvalini ko'rish mumkin.
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {classes.length === 0 && (
              <button
                id="generate-parallel-classes-btn"
                onClick={() => {
                  setConfirmAction({
                    isOpen: true,
                    title: "Parallel sinflarni yaratish",
                    message: "1-sinfdan 11-sinfgacha barcha A, B, D parallel sinflarni (jami 33 ta sinf) avtomatik shakllantirishni tasdiqlaysizmi?",
                    confirmText: "Yaratish",
                    danger: false,
                    onConfirm: () => generateParallelClasses(),
                  });
                }}
                className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>1-11 A, B, D larni avtomatik yaratish</span>
              </button>
            )}

            <button
              id="add-class-btn"
              onClick={handleOpenAddClass}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Sinf qo'shish</span>
            </button>
          </div>
        )}
      </div>

      {/* Grade Level Filter Tabs: 1-11, A, B, D */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Horizontal scrollable grade buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setGradeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              gradeFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            Barchasi ({classes.length})
          </button>

          <button
            onClick={() => setGradeFilter('PRIMARY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              gradeFilter === 'PRIMARY'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            1-4 Boshlang'ich
          </button>

          <button
            onClick={() => setGradeFilter('MIDDLE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              gradeFilter === 'MIDDLE'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            5-9 O'rta
          </button>

          <button
            onClick={() => setGradeFilter('HIGH')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              gradeFilter === 'HIGH'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            10-11 Yuqori
          </button>

          {/* Direct 1 to 11 buttons */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1 shrink-0" />
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setGradeFilter(lvl.toString())}
              className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 transition-all ${
                gradeFilter === lvl.toString()
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Sinf, sinf rahbari yoki yo'nalish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-medium"
          />
        </div>
      </div>

      {/* Empty State */}
      {filteredClasses.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Hozircha hech qanday sinf mavjud emas
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Admin o'zi 1-sinfdan 11-sinfgacha A, B, D parallel sinflarni qo'shadi yoki 1-bosishda barcha parallel sinflarni yaratishi mumkin.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => generateParallelClasses()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>1-11 A, B, D parallel sinflarni tezkor yaratish</span>
              </button>

              <button
                onClick={handleOpenAddClass}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Bittalab qo'shish</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Classes Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredClasses.map((cls) => {
            const count = users.filter((u) => u.role === 'STUDENT' && u.classId === cls.id).length;

            return (
              <div
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer text-left relative group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                        {cls.name}
                      </span>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold">
                          {cls.direction || "Umumiy ta'lim"}
                        </span>
                      </div>
                    </div>

                    <span className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1">
                      <DoorOpen className="w-3.5 h-3.5" />
                      {cls.roomNumber}
                    </span>
                  </div>

                  {/* Sinf rahbari info */}
                  <div className="mt-3.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/60">
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 block">
                      Sinf rahbari:
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{cls.classTeacherName || 'Tayinlanmagan'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer stats & actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-semibold">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>{count} ta o'quvchi</span>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {isAdmin && (
                      <>
                        <button
                          onClick={(e) => handleOpenEditClass(cls, e)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Tahrirlash"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => handleDeleteClass(cls, e)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          title="O'chirish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                    <span className="text-[11px] font-bold text-emerald-600 group-hover:underline pl-1">
                      Ochish →
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD CLASS */}
      <Modal
        isOpen={isAddClassModalOpen}
        onClose={() => setIsAddClassModalOpen(false)}
        title="Yangi Sinf Qo'shish (1-sinfdan 11-sinfgacha parallel)"
        maxWidth="md"
      >
        <form onSubmit={handleSaveAddClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sinf darajasi (1-11) *
              </label>
              <select
                value={formGradeLevel}
                onChange={(e) => setFormGradeLevel(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold mt-1"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}-sinf
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Parallel harf (A, B, D...) *
              </label>
              <select
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold mt-1"
              >
                <option value="A">A - parallel</option>
                <option value="B">B - parallel</option>
                <option value="D">D - parallel</option>
                <option value="V">V - parallel</option>
                <option value="G">G - parallel</option>
                <option value="E">E - parallel</option>
              </select>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500 font-medium">Yaratiladigan to'liq nomi:</span>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
              {formGradeLevel}-{formSection} sinf
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sinf yo'nalishi (Ixtisoslashuvi)
            </label>
            <div className="space-y-1.5 mt-1">
              <select
                value={formDirection}
                onChange={(e) => setFormDirection(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold"
              >
                {directionPresets.map((dir) => (
                  <option key={dir} value={dir}>
                    {dir}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Yoki o'zingiz yo'nalish nomini yozing..."
                value={formDirection}
                onChange={(e) => setFormDirection(e.target.value)}
                className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sinf rahbari (O'qituvchi)
            </label>
            {teachers.length > 0 ? (
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              >
                <option value="">O'qituvchilardan tanlang...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} {t.surname} ({t.phone || 'O\'qituvchi'})
                  </option>
                ))}
              </select>
            ) : (
              <div className="mt-1 space-y-1.5">
                <input
                  type="text"
                  placeholder="Sinf rahbari ismi (masalan: Nodira Rahimova)"
                  value={formCustomTeacherName}
                  onChange={(e) => setFormCustomTeacherName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold"
                />
                <p className="text-[10px] text-slate-400">
                  Hozircha o'qituvchilar qo'shilmagan bo'lsa, ismini yozishingiz mumkin. Keyinchalik o'qituvchi qo'shilgach biriktirasiz.
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Xona raqami (Sinf xonasi)
            </label>
            <input
              type="text"
              required
              placeholder="Masalan: 204"
              value={formRoomNumber}
              onChange={(e) => setFormRoomNumber(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddClassModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              Sinfni saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL: EDIT CLASS */}
      <Modal
        isOpen={isEditClassModalOpen}
        onClose={() => setIsEditClassModalOpen(false)}
        title={`Sinf ma'lumotlarini tahrirlash`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveEditClass} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Sinf darajasi
              </label>
              <select
                value={formGradeLevel}
                onChange={(e) => setFormGradeLevel(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold mt-1"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((lvl) => (
                  <option key={lvl} value={lvl}>
                    {lvl}-sinf
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Parallel harfi
              </label>
              <select
                value={formSection}
                onChange={(e) => setFormSection(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold mt-1"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="D">D</option>
                <option value="V">V</option>
                <option value="G">G</option>
                <option value="E">E</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sinf yo'nalishi
            </label>
            <input
              type="text"
              value={formDirection}
              onChange={(e) => setFormDirection(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sinf rahbari
            </label>
            {teachers.length > 0 ? (
              <select
                value={formTeacherId}
                onChange={(e) => setFormTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              >
                <option value="">O'qituvchi tanlang...</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName} {t.surname}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formCustomTeacherName}
                onChange={(e) => setFormCustomTeacherName(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
              />
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Xona raqami
            </label>
            <input
              type="text"
              value={formRoomNumber}
              onChange={(e) => setFormRoomNumber(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditClassModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              O'zgarishlarni saqlash
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmAction?.isOpen}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }
        }}
        title={confirmAction?.title || "Tasdiqlash"}
        message={confirmAction?.message || ""}
        confirmText={confirmAction?.confirmText || "Tasdiqlash"}
        danger={confirmAction?.danger ?? true}
      />
    </div>
  );
};
