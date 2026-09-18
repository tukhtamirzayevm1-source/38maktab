import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  SchoolClass,
  Subject,
  Grade,
  AttendanceRecord,
  Homework,
  Exam,
  ScheduleItem,
  ChatMessage,
  Conversation,
  Announcement,
  NotificationItem,
  ChatPermissions,
  Role,
  SchoolProfile,
} from '../types';

export const initialSchoolProfile: SchoolProfile = {
  name: '38-MAKTAB',
  address: "Toshkent shahri, Yunusobod tumani, Bog'ishamol ko'chasi, 38-uy",
  phone: '+998 (71) 234-56-78',
  email: 'info@maktab38.uz',
  academicYear: '2025-2026',
  principalName: 'Maktab Direktori',
  logoUrl: '',
};
import {
  initialUsers,
  initialClasses,
  initialSubjects,
  initialGrades,
  initialAttendance,
  initialHomework,
  initialExams,
  initialSchedule,
  initialAnnouncements,
  initialConversations,
  initialMessages,
  initialNotifications,
  initialChatPermissions,
} from '../data/initialData';

interface SchoolDataContextType {
  users: User[];
  classes: SchoolClass[];
  subjects: Subject[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  homework: Homework[];
  exams: Exam[];
  schedule: ScheduleItem[];
  announcements: Announcement[];
  conversations: Conversation[];
  messages: ChatMessage[];
  notifications: NotificationItem[];
  chatPermissions: ChatPermissions;
  schoolProfile: SchoolProfile;

  // CRUD & Operations
  createUser: (userData: Omit<User, 'id' | 'createdAt'>) => { user: User; rawPass: string };
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  changeUserPassword: (id: string, newPass: string) => void;

  createClass: (classData: Omit<SchoolClass, 'id'>) => SchoolClass;
  addClass: (classData: Omit<SchoolClass, 'id'>) => SchoolClass;
  updateClass: (id: string, updates: Partial<SchoolClass>) => void;
  deleteClass: (id: string) => void;
  assignStudentToClass: (studentId: string, classId: string) => void;
  removeStudentFromClass: (studentId: string) => void;
  generateParallelClasses: () => void;

  createSubject: (subjectData: Omit<Subject, 'id'>) => Subject;
  addSubject: (subjectData: Omit<Subject, 'id'>) => Subject;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  seedStandardSubjects: () => void;

  addGrade: (gradeData: Omit<Grade, 'id'>) => Grade;
  updateGrade: (id: string, updates: Partial<Grade>) => void;
  deleteGrade: (id: string) => void;

  recordAttendance: (records: Omit<AttendanceRecord, 'id'>[]) => void;
  markAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;

  createHomework: (hwData: Omit<Homework, 'id' | 'createdAt'>) => Homework;
  addHomework: (hwData: Omit<Homework, 'id' | 'createdAt'>) => Homework;
  toggleHomeworkCompleted: (hwId: string, studentId: string) => void;
  deleteHomework: (id: string) => void;

  createExam: (examData: Omit<Exam, 'id'>) => Exam;
  addExam: (examData: Omit<Exam, 'id'>) => Exam;
  deleteExam: (id: string) => void;

  createScheduleItem: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => ScheduleItem;
  updateScheduleItem: (id: string, updates: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  createAnnouncement: (annData: Omit<Announcement, 'id'>) => Announcement;
  addAnnouncement: (annData: Omit<Announcement, 'id'>) => Announcement;
  deleteAnnouncement: (id: string) => void;

  sendMessage: (
    param1: string | { senderId: string; receiverId?: string; text: string; senderName?: string; senderRole?: Role },
    param2?: string,
    param3?: User
  ) => ChatMessage;
  getOrCreateConversation: (user1Id: string, user2Id: string) => Conversation;

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: (userId?: string, role?: Role) => void;

  updateChatPermissions: (permissions: Partial<ChatPermissions>) => void;
  updateSchoolProfile: (updates: Partial<SchoolProfile>) => void;
  resetToDemoData: () => void;
}

const SchoolDataContext = createContext<SchoolDataContextType | undefined>(undefined);

const STORAGE_KEY = 'maktab38_clean_data_store_v3';

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState(() => {
    // Clear old data with mock profiles if detected
    try {
      localStorage.removeItem('maktab38_data_store_v1');
      localStorage.removeItem('maktab38_clean_store_v2');
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure Dilshod Karimov or old demo teachers are not retained
        if (parsed.users && parsed.users.some((u: User) => u.fullName?.toLowerCase().includes('dilshod') || u.surname?.toLowerCase().includes('karimov'))) {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('maktab38_current_user_id');
        } else {
          return parsed;
        }
      }
    } catch {
      console.error('Failed to parse saved school data');
    }
    return {
      users: initialUsers,
      classes: initialClasses,
      subjects: initialSubjects,
      grades: initialGrades,
      attendance: initialAttendance,
      homework: initialHomework,
      exams: initialExams,
      schedule: initialSchedule,
      announcements: initialAnnouncements,
      conversations: initialConversations,
      messages: initialMessages,
      notifications: initialNotifications,
      chatPermissions: initialChatPermissions,
      schoolProfile: initialSchoolProfile,
    };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Create User
  const createUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const uniqueId = `user-${userData.role.toLowerCase()}-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: uniqueId,
      createdAt: new Date().toISOString().split('T')[0],
      status: userData.status || 'active',
    };

    setData((prev: any) => {
      const updatedUsers = [newUser, ...prev.users];
      // If student with class, update class count
      let updatedClasses = prev.classes;
      if (newUser.role === 'STUDENT' && newUser.classId) {
        updatedClasses = prev.classes.map((c: SchoolClass) => {
          if (c.id === newUser.classId) {
            return { ...c, studentCount: (c.studentCount || 0) + 1 };
          }
          return c;
        });
      }
      return {
        ...prev,
        users: updatedUsers,
        classes: updatedClasses,
      };
    });

    return { user: newUser, rawPass: userData.password || '' };
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => (u.id === id ? { ...u, ...updates } : u)),
    }));
  };

  const deleteUser = (id: string) => {
    setData((prev: any) => {
      const targetUser = prev.users.find((u: User) => u.id === id);
      const updatedUsers = prev.users.filter((u: User) => u.id !== id);
      const targetClassId = targetUser?.classId;
      return {
        ...prev,
        users: updatedUsers,
        classes: targetClassId
          ? prev.classes.map((c: SchoolClass) =>
              c.id === targetClassId
                ? {
                    ...c,
                    studentCount: Math.max(
                      0,
                      updatedUsers.filter((u: User) => u.role === 'STUDENT' && u.classId === targetClassId).length
                    ),
                  }
                : c
            )
          : prev.classes,
      };
    });
  };

  const toggleUserStatus = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) =>
        u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u
      ),
    }));
  };

  const changeUserPassword = (id: string, newPass: string) => {
    setData((prev: any) => ({
      ...prev,
      users: prev.users.map((u: User) => (u.id === id ? { ...u, password: newPass } : u)),
    }));
  };

  // Classes
  const createClass = (classData: Omit<SchoolClass, 'id'>) => {
    const newClass: SchoolClass = {
      ...classData,
      id: classData.name.replace(/\s+/g, '-'),
      studentCount: 0,
      averageGrade: 5.0,
      attendanceRate: 100,
    };
    setData((prev: any) => ({
      ...prev,
      classes: [...prev.classes, newClass],
    }));
    return newClass;
  };

  const updateClass = (id: string, updates: Partial<SchoolClass>) => {
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.map((c: SchoolClass) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const deleteClass = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      classes: prev.classes.filter((c: SchoolClass) => c.id !== id),
      users: prev.users.map((u: User) => (u.classId === id ? { ...u, classId: undefined } : u)),
      schedule: prev.schedule.filter((s: any) => s.classId !== id),
      homework: prev.homework.filter((h: any) => h.classId !== id),
    }));
  };

  const assignStudentToClass = (studentId: string, classId: string) => {
    setData((prev: any) => {
      const updatedUsers = prev.users.map((u: User) =>
        u.id === studentId ? { ...u, classId } : u
      );
      const studentCount = updatedUsers.filter((u: User) => u.role === 'STUDENT' && u.classId === classId).length;
      return {
        ...prev,
        users: updatedUsers,
        classes: prev.classes.map((c: SchoolClass) =>
          c.id === classId ? { ...c, studentCount } : c
        ),
      };
    });
  };

  const removeStudentFromClass = (studentId: string) => {
    setData((prev: any) => {
      const user = prev.users.find((u: User) => u.id === studentId);
      const oldClassId = user?.classId;
      const updatedUsers = prev.users.map((u: User) =>
        u.id === studentId ? { ...u, classId: undefined } : u
      );
      return {
        ...prev,
        users: updatedUsers,
        classes: prev.classes.map((c: SchoolClass) =>
          c.id === oldClassId
            ? {
                ...c,
                studentCount: Math.max(0, updatedUsers.filter((u: User) => u.role === 'STUDENT' && u.classId === oldClassId).length),
              }
            : c
        ),
      };
    });
  };

  const generateParallelClasses = () => {
    const parallels = ['A', 'B', 'D'];
    const newClasses: SchoolClass[] = [];
    for (let grade = 1; grade <= 11; grade++) {
      for (const section of parallels) {
        const id = `${grade}-${section}`;
        newClasses.push({
          id,
          name: `${grade}-${section} sinf`,
          gradeLevel: grade,
          section,
          direction: grade >= 10 ? (section === 'A' ? 'Aniq fanlar' : section === 'B' ? 'Tabiiy fanlar' : 'Ijtimoiy-gumanitar') : 'Umumiy ta\'lim',
          classTeacherId: '',
          classTeacherName: 'Tayinlanmagan',
          roomNumber: `${grade * 10 + (section === 'A' ? 1 : section === 'B' ? 2 : 3)}`,
          academicYear: '2025-2026',
          studentCount: 0,
          averageGrade: 5.0,
          attendanceRate: 100,
        });
      }
    }
    setData((prev: any) => ({
      ...prev,
      classes: newClasses,
    }));
  };

  // Subjects
  const createSubject = (subjectData: Omit<Subject, 'id'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `subj-${Date.now()}`,
    };
    setData((prev: any) => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
    return newSubject;
  };

  const seedStandardSubjects = () => {
    const standardList: Subject[] = [
      { id: 'subj-1', name: 'Matematika', code: 'MATH-01', description: 'Arifmetika, algebra va geometriya asoslari', weeklyHours: 5, assignedClasses: [] },
      { id: 'subj-2', name: 'Ona tili va Adabiyot', code: 'UZB-01', description: 'O\'zbek tili grammatikasi va mumtoz hamda zamonaviy adabiyot', weeklyHours: 4, assignedClasses: [] },
      { id: 'subj-3', name: 'Ingliz tili', code: 'ENG-01', description: 'Xorijiy tillar, CEFR va muloqot ko\'nikmalari', weeklyHours: 3, assignedClasses: [] },
      { id: 'subj-4', name: 'Fizika', code: 'PHYS-01', description: 'Tabiat qonuniyatlari, mexanika va optika', weeklyHours: 3, assignedClasses: [] },
      { id: 'subj-5', name: 'Kimyo', code: 'CHEM-01', description: 'Anorganik va organik moddalar kimyosi', weeklyHours: 2, assignedClasses: [] },
      { id: 'subj-6', name: 'Biologiya', code: 'BIO-01', description: 'Odam anatomiyasi, botanika va zoologiya', weeklyHours: 2, assignedClasses: [] },
      { id: 'subj-7', name: 'Informatika va IT', code: 'CS-01', description: 'Algoritmlash, dasturlash va axborot texnologiyalari', weeklyHours: 2, assignedClasses: [] },
      { id: 'subj-8', name: 'O\'zbekiston va Jahon Tarixi', code: 'HIST-01', description: 'Vatan tarixi va jahon sivilizatsiyasi', weeklyHours: 3, assignedClasses: [] },
      { id: 'subj-9', name: 'Geografiya', code: 'GEO-01', description: 'Iqtisodiy va tabiiy geografiya', weeklyHours: 2, assignedClasses: [] },
      { id: 'subj-10', name: 'Jismoniy tarbiya', code: 'PE-01', description: 'Sport o\'yinlari, gimnastika va sog\'lom turmush tarzi', weeklyHours: 2, assignedClasses: [] },
    ];
    setData((prev: any) => ({
      ...prev,
      subjects: standardList,
    }));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setData((prev: any) => ({
      ...prev,
      subjects: prev.subjects.map((s: Subject) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      subjects: prev.subjects.filter((s: Subject) => s.id !== id),
    }));
  };

  // Grades
  const addGrade = (gradeData: Omit<Grade, 'id'>) => {
    const newGrade: Grade = {
      ...gradeData,
      id: `grd-${Date.now()}`,
    };
    // Also push a notification to the student
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: gradeData.studentId,
      type: 'grade',
      title: 'Yangi baho qo\'yildi',
      message: `${gradeData.teacherName} sizga ${gradeData.subjectName} fanidan ${gradeData.gradeValue} baho qo'ydi.`,
      timestamp: 'Hozirgina',
      isRead: false,
      linkTab: 'grades',
    };
    setData((prev: any) => ({
      ...prev,
      grades: [newGrade, ...prev.grades],
      notifications: [notif, ...prev.notifications],
    }));
    return newGrade;
  };

  const deleteGrade = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      grades: prev.grades.filter((g: Grade) => g.id !== id),
    }));
  };

  // Attendance
  const recordAttendance = (records: Omit<AttendanceRecord, 'id'>[]) => {
    const newRecords: AttendanceRecord[] = records.map((r, idx) => ({
      ...r,
      id: `att-${Date.now()}-${idx}`,
    }));
    setData((prev: any) => ({
      ...prev,
      attendance: [...newRecords, ...prev.attendance],
    }));
  };

  // Homework
  const createHomework = (hwData: Omit<Homework, 'id' | 'createdAt'>) => {
    const newHw: Homework = {
      ...hwData,
      id: `hw-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      completedStudentIds: [],
    };
    // Push notification to target class students
    const notif: NotificationItem = {
      id: `notif-hw-${Date.now()}`,
      targetRole: 'STUDENT',
      type: 'homework',
      title: 'Yangi uy vazifasi berildi',
      message: `${hwData.subjectName} (${hwData.classId}): "${hwData.title}". Muddat: ${hwData.deadline}`,
      timestamp: 'Hozirgina',
      isRead: false,
      linkTab: 'homework',
    };
    setData((prev: any) => ({
      ...prev,
      homework: [newHw, ...prev.homework],
      notifications: [notif, ...prev.notifications],
    }));
    return newHw;
  };

  const toggleHomeworkCompleted = (hwId: string, studentId: string) => {
    setData((prev: any) => ({
      ...prev,
      homework: prev.homework.map((hw: Homework) => {
        if (hw.id !== hwId) return hw;
        const currentList = hw.completedStudentIds || [];
        const isDone = currentList.includes(studentId);
        return {
          ...hw,
          completedStudentIds: isDone
            ? currentList.filter((id) => id !== studentId)
            : [...currentList, studentId],
        };
      }),
    }));
  };

  const deleteHomework = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      homework: prev.homework.filter((h: Homework) => h.id !== id),
    }));
  };

  // Exams
  const createExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    const notif: NotificationItem = {
      id: `notif-ex-${Date.now()}`,
      targetRole: 'STUDENT',
      type: 'exam',
      title: 'Yangi imtihon belgilandi',
      message: `${examData.subjectName} (${examData.classId}) imtihoni ${examData.date} sanasiga belgilandi.`,
      timestamp: 'Hozirgina',
      isRead: false,
      linkTab: 'exams',
    };
    setData((prev: any) => ({
      ...prev,
      exams: [...prev.exams, newExam],
      notifications: [notif, ...prev.notifications],
    }));
    return newExam;
  };

  const deleteExam = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      exams: prev.exams.filter((e: Exam) => e.id !== id),
    }));
  };

  // Schedule
  const createScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setData((prev: any) => ({
      ...prev,
      schedule: [...prev.schedule, newItem],
    }));
    return newItem;
  };

  const updateScheduleItem = (id: string, updates: Partial<ScheduleItem>) => {
    setData((prev: any) => ({
      ...prev,
      schedule: prev.schedule.map((s: ScheduleItem) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteScheduleItem = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      schedule: prev.schedule.filter((s: ScheduleItem) => s.id !== id),
    }));
  };

  // Announcements
  const createAnnouncement = (annData: Omit<Announcement, 'id'>) => {
    const newAnn: Announcement = {
      ...annData,
      id: `ann-${Date.now()}`,
    };
    const notif: NotificationItem = {
      id: `notif-ann-${Date.now()}`,
      targetRole: annData.targetAudience === 'Teachers' ? 'TEACHER' : annData.targetAudience === 'Students' ? 'STUDENT' : 'ALL',
      type: 'announcement',
      title: 'Yangi maktab e\'loni',
      message: annData.title,
      timestamp: 'Hozirgina',
      isRead: false,
      linkTab: 'announcements',
    };
    setData((prev: any) => ({
      ...prev,
      announcements: [newAnn, ...prev.announcements],
      notifications: [notif, ...prev.notifications],
    }));
    return newAnn;
  };

  const deleteAnnouncement = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      announcements: prev.announcements.filter((a: Announcement) => a.id !== id),
    }));
  };

  // Chat
  const getOrCreateConversation = (user1Id: string, user2Id: string): Conversation => {
    const existing = data.conversations.find(
      (c: Conversation) =>
        c.participantIds.includes(user1Id) && c.participantIds.includes(user2Id)
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv-${Date.now()}`,
      participantIds: [user1Id, user2Id],
      updatedAt: new Date().toISOString(),
    };

    setData((prev: any) => ({
      ...prev,
      conversations: [newConv, ...prev.conversations],
    }));

    return newConv;
  };

  const updateSchoolProfile = (updates: Partial<SchoolProfile>) => {
    setData((prev: any) => ({
      ...prev,
      schoolProfile: { ...prev.schoolProfile, ...updates },
    }));
  };

  const addClass = createClass;
  const addSubject = createSubject;
  const addHomework = createHomework;
  const addExam = createExam;
  const addScheduleItem = createScheduleItem;
  const addAnnouncement = createAnnouncement;

  const updateGrade = (id: string, updates: Partial<Grade>) => {
    setData((prev: any) => ({
      ...prev,
      grades: prev.grades.map((g: Grade) => (g.id === id ? { ...g, ...updates } : g)),
    }));
  };

  const markAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setData((prev: any) => {
      const existingIndex = prev.attendance.findIndex(
        (a: AttendanceRecord) =>
          a.studentId === record.studentId &&
          a.date === record.date &&
          (!record.subjectName || a.subjectName === record.subjectName)
      );
      if (existingIndex >= 0) {
        const updated = [...prev.attendance];
        updated[existingIndex] = { ...updated[existingIndex], ...record };
        return { ...prev, attendance: updated };
      } else {
        const newRec: AttendanceRecord = {
          ...record,
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        };
        return { ...prev, attendance: [newRec, ...prev.attendance] };
      }
    });
  };

  const sendMessage = (
    param1: string | { senderId: string; receiverId?: string; text: string; senderName?: string; senderRole?: Role },
    param2?: string,
    param3?: User
  ): ChatMessage => {
    let convId: string;
    let senderId: string;
    let senderName: string;
    let senderRole: Role;
    let senderPhoto: string;
    let text: string;
    let receiverId: string | undefined;

    if (typeof param1 === 'object') {
      senderId = param1.senderId;
      receiverId = param1.receiverId;
      senderName = param1.senderName || 'Foydalanuvchi';
      senderRole = param1.senderRole || 'STUDENT';
      senderPhoto = '';
      text = param1.text;
      const conv = getOrCreateConversation(senderId, receiverId || 'admin-1');
      convId = conv.id;
    } else {
      convId = param1;
      text = param2 || '';
      senderId = param3?.id || 'unknown';
      senderName = param3 ? `${param3.fullName} ${param3.surname}` : 'Foydalanuvchi';
      senderRole = param3?.role || 'STUDENT';
      senderPhoto = param3?.photoUrl || '';
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      conversationId: convId,
      senderId,
      receiverId,
      senderName,
      senderRole,
      senderPhoto,
      text,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setData((prev: any) => ({
      ...prev,
      messages: [...prev.messages, newMsg],
      conversations: prev.conversations.map((c: Conversation) =>
        c.id === convId
          ? {
              ...c,
              lastMessage: text,
              lastMessageTime: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    }));

    return newMsg;
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
    }));
  };

  const markAllNotificationsRead = (userId?: string, role?: Role) => {
    setData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: NotificationItem) => {
        const matchesUser = !n.userId || (userId && n.userId === userId);
        const matchesRole = !n.targetRole || n.targetRole === 'ALL' || (role && n.targetRole === role);
        if (matchesUser && matchesRole) {
          return { ...n, isRead: true };
        }
        return n;
      }),
    }));
  };

  const updateChatPermissions = (perms: Partial<ChatPermissions>) => {
    setData((prev: any) => ({
      ...prev,
      chatPermissions: { ...prev.chatPermissions, ...perms },
    }));
  };

  const resetToDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setData({
      users: initialUsers,
      classes: initialClasses,
      subjects: initialSubjects,
      grades: initialGrades,
      attendance: initialAttendance,
      homework: initialHomework,
      exams: initialExams,
      schedule: initialSchedule,
      announcements: initialAnnouncements,
      conversations: initialConversations,
      messages: initialMessages,
      notifications: initialNotifications,
      chatPermissions: initialChatPermissions,
    });
  };

  return (
    <SchoolDataContext.Provider
      value={{
        ...data,
        schoolProfile: data.schoolProfile || initialSchoolProfile,
        createUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        changeUserPassword,
        createClass,
        addClass,
        updateClass,
        deleteClass,
        assignStudentToClass,
        removeStudentFromClass,
        generateParallelClasses,
        createSubject,
        addSubject,
        updateSubject,
        deleteSubject,
        seedStandardSubjects,
        addGrade,
        updateGrade,
        deleteGrade,
        recordAttendance,
        markAttendance,
        createHomework,
        addHomework,
        toggleHomeworkCompleted,
        deleteHomework,
        createExam,
        addExam,
        deleteExam,
        createScheduleItem,
        addScheduleItem,
        updateScheduleItem,
        deleteScheduleItem,
        createAnnouncement,
        addAnnouncement,
        deleteAnnouncement,
        sendMessage,
        getOrCreateConversation,
        markNotificationRead,
        markAllNotificationsRead,
        updateChatPermissions,
        updateSchoolProfile,
        resetToDemoData,
      }}
    >
      {children}
    </SchoolDataContext.Provider>
  );
};

export const useSchoolData = (): SchoolDataContextType => {
  const context = useContext(SchoolDataContext);
  if (!context) {
    throw new Error('useSchoolData must be used within SchoolDataProvider');
  }
  return context;
};
