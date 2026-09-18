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
} from '../types';

export const initialUsers: User[] = [
  {
    id: 'user-admin-main',
    login: 'admin',
    password: 'admin123',
    role: 'ADMIN',
    fullName: 'Maktab',
    surname: 'Administratori',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    phone: '+998 71 200 38 38',
    email: 'admin@38maktab.uz',
    address: 'Maktab ma\'muriyati kabineti',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    status: 'active',
    position: 'Bosh Administrator',
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const initialClasses: SchoolClass[] = [];

export const initialSubjects: Subject[] = [];

export const initialGrades: Grade[] = [];

export const initialAttendance: AttendanceRecord[] = [];

export const initialHomework: Homework[] = [];

export const initialExams: Exam[] = [];

export const initialSchedule: ScheduleItem[] = [];

export const initialAnnouncements: Announcement[] = [];

export const initialConversations: Conversation[] = [];

export const initialMessages: ChatMessage[] = [];

export const initialNotifications: NotificationItem[] = [];

export const initialChatPermissions: ChatPermissions = {
  isChatEnabled: true,
  allowStudentToStudent: true,
  allowStudentToTeacher: true,
  allowTeacherToStudent: true,
  allowTeacherToTeacher: true,
};
