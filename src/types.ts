export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT';
export type Language = 'UZ' | 'RU' | 'EN';
export type Theme = 'light' | 'dark';
export type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Dushanba'
  | 'Seshanba'
  | 'Chorshanba'
  | 'Payshanba'
  | 'Juma'
  | 'Shanba';

export type UserStatus = 'active' | 'disabled';
export type Gender = 'male' | 'female';

export interface User {
  id: string;
  login: string;
  password?: string; // Kept internal, hidden from standard public views
  role: Role;
  fullName: string;
  surname: string;
  dateOfBirth?: string;
  gender: Gender;
  phone: string;
  email?: string;
  address: string;
  photoUrl: string;
  status: UserStatus;
  createdAt: string;

  // Student specific
  studentId?: string;
  classId?: string; // e.g. "9-A"
  parentName?: string;
  parentPhone?: string;
  emergencyContact?: string;
  additionalInfo?: string;

  // Teacher specific
  teacherId?: string;
  subjects?: string[]; // e.g. ["Matematika", "Informatika"]
  assignedSubjects?: string[];
  assignedClasses?: string[]; // e.g. ["9-A", "10-B"]
  position?: string; // e.g. "Bosh o'qituvchi", "Metodist"
  experienceYears?: number;
  biography?: string;
}

export interface SchoolClass {
  id: string; // e.g. "9-A"
  name: string; // e.g. "9-A sinf"
  gradeLevel: number; // 9
  section?: string; // e.g. "A"
  direction?: string; // e.g. "Aniq fanlar", "Tabiiy fanlar", "Umumiy ta'lim"
  classTeacherId: string; // teacher's user id
  classTeacherName: string;
  roomNumber: string;
  academicYear?: string;
  studentCount?: number;
  averageGrade?: number;
  attendanceRate?: number;
  subjects?: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description: string;
  leadTeacherId?: string;
  leadTeacherName?: string;
  assignedClasses?: string[];
  assignedTeachers?: string[];
  hoursPerWeek?: number;
  weeklyHours?: number;
  color?: string;
}

export type GradeType =
  | 'Classwork'
  | 'Homework'
  | 'Quiz'
  | 'Exam'
  | 'Final'
  | 'Daily'
  | 'Test'
  | 'Project';

export interface Grade {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subjectId?: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  gradeValue: number; // 1 to 5, or percentage
  gradeType: GradeType;
  comment?: string;
  date: string; // YYYY-MM-DD
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  subjectName?: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedByTeacherId?: string;
  note?: string;
  reason?: string;
}

export type HomeworkStatus = 'pending' | 'completed' | 'overdue';

export interface Homework {
  id: string;
  subjectId?: string;
  subjectName: string;
  classId: string;
  title: string;
  description: string;
  deadline: string; // YYYY-MM-DD
  dueDate?: string;
  teacherId?: string;
  teacherName?: string;
  attachmentName?: string;
  attachmentUrl?: string;
  createdAt?: string;
  completedStudentIds?: string[]; // IDs of students who marked as completed
  completedBy?: string[];
}

export interface Exam {
  id: string;
  name?: string;
  title?: string;
  subjectId?: string;
  subjectName: string;
  classId: string;
  date: string; // YYYY-MM-DD
  time?: string;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  room: string;
  teacherId?: string;
  teacherName?: string;
  description?: string;
  maxScore: number;
}

export interface ScheduleItem {
  id: string;
  dayOfWeek: string;
  period: number; // 1, 2, 3, 4, 5, 6
  startTime: string; // "08:30"
  endTime: string; // "09:15"
  subjectId?: string;
  subjectName: string;
  teacherId?: string;
  teacherName?: string;
  classId: string;
  room?: string;
  roomNumber?: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  senderId: string;
  receiverId?: string;
  senderName: string;
  senderRole?: Role;
  senderPhoto?: string;
  text: string;
  timestamp: string; // ISO string
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: string;
  lastMessageTime?: string;
  updatedAt: string;
}

export type TargetAudience = 'ALL' | 'TEACHERS' | 'STUDENTS' | 'Everyone' | 'Teachers' | 'Students' | string;
export type Importance = 'normal' | 'important' | 'urgent';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  photoUrl?: string;
  date: string; // YYYY-MM-DD
  author?: string;
  authorName?: string;
  authorRole?: Role;
  targetAudience: TargetAudience;
  priority?: Importance;
  importance?: Importance;
  attachmentUrl?: string;
}

export interface SchoolProfile {
  name: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  academicYear: string;
  principalName: string;
}

export interface NotificationItem {
  id: string;
  userId?: string; // specific user or undefined for all matching role
  targetRole?: Role | 'ALL';
  type: 'grade' | 'homework' | 'announcement' | 'message' | 'exam' | 'attendance' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  linkTab?: string;
}

export interface ChatPermissions {
  isChatEnabled: boolean;
  allowStudentToStudent: boolean;
  allowStudentToTeacher: boolean;
  allowTeacherToStudent: boolean;
  allowTeacherToTeacher: boolean;
}
