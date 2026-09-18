import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './i18n/LanguageContext';
import { SchoolDataProvider } from './context/SchoolDataContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Auth
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';

// Common Modals
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { CreateUserModal } from './components/admin/CreateUserModal';
import { EditUserModal } from './components/admin/EditUserModal';
import { StudentProfileModal } from './components/views/StudentProfileModal';
import { TeacherProfileModal } from './components/views/TeacherProfileModal';

// Views
import { DashboardView } from './components/views/DashboardView';
import { UsersManagementView } from './components/views/UsersManagementView';
import { StudentsView } from './components/views/StudentsView';
import { TeachersView } from './components/views/TeachersView';
import { ClassesView } from './components/views/ClassesView';
import { SubjectsView } from './components/views/SubjectsView';
import { AttendanceView } from './components/views/AttendanceView';
import { GradesView } from './components/views/GradesView';
import { HomeworkView } from './components/views/HomeworkView';
import { ExamsView } from './components/views/ExamsView';
import { ScheduleView } from './components/views/ScheduleView';
import { AnnouncementsView } from './components/views/AnnouncementsView';
import { ChatView } from './components/views/ChatView';
import { NotificationsView } from './components/views/NotificationsView';
import { ReportsView } from './components/views/ReportsView';
import { SettingsView } from './components/views/SettingsView';

import { User, Role } from './types';

const MainApplication: React.FC = () => {
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals state
  const [isGlobalSearchOpen, setIsGlobalSearchOpen] = useState(false);
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [createUserDefaultRole, setCreateUserDefaultRole] = useState<Role>('STUDENT');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedStudentForProfile, setSelectedStudentForProfile] = useState<User | null>(null);
  const [selectedTeacherForProfile, setSelectedTeacherForProfile] = useState<User | null>(null);

  // Global keyboard shortcut for search (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsGlobalSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Security check: Redirect non-admins away from admin-only pages
  useEffect(() => {
    if (!isAdmin && (activeTab === 'users' || activeTab === 'reports')) {
      setActiveTab('dashboard');
    }
  }, [isAdmin, activeTab]);

  if (!currentUser) {
    return <LoginPage />;
  }

  const handleOpenCreateUser = (role?: Role) => {
    setCreateUserDefaultRole(role || 'STUDENT');
    setIsCreateUserModalOpen(true);
  };

  const handleOpenEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleViewStudentProfile = (student: User) => {
    setSelectedStudentForProfile(student);
  };

  const handleViewTeacherProfile = (teacher: User) => {
    setSelectedTeacherForProfile(teacher);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenCreateUser={() => handleOpenCreateUser('STUDENT')}
          />
        );

      case 'users':
        if (!isAdmin) return null;
        return (
          <UsersManagementView
            onOpenCreateUser={handleOpenCreateUser}
            onOpenEditUser={handleOpenEditUser}
            onViewStudent={handleViewStudentProfile}
            onViewTeacher={handleViewTeacherProfile}
          />
        );

      case 'active-students':
      case 'my-students':
      case 'students':
        return (
          <StudentsView
            onOpenCreateUser={handleOpenCreateUser}
            onViewStudent={handleViewStudentProfile}
            onOpenEditUser={handleOpenEditUser}
          />
        );

      case 'active-teachers':
      case 'teachers':
        return (
          <TeachersView
            onOpenCreateUser={handleOpenCreateUser}
            onViewTeacher={handleViewTeacherProfile}
            onOpenEditUser={handleOpenEditUser}
          />
        );

      case 'active-classes':
      case 'my-classes':
      case 'my-class':
      case 'classes':
        return <ClassesView onViewStudent={handleViewStudentProfile} />;

      case 'subjects':
        return <SubjectsView />;

      case 'my-attendance':
      case 'attendance':
        return <AttendanceView />;

      case 'my-grades':
      case 'grades':
        return <GradesView />;

      case 'homework':
        return <HomeworkView />;

      case 'exams':
        return <ExamsView />;

      case 'schedule':
        return <ScheduleView />;

      case 'announcements':
        return <AnnouncementsView />;

      case 'chat':
        return <ChatView />;

      case 'notifications':
        return <NotificationsView onNavigate={setActiveTab} />;

      case 'reports':
        if (!isAdmin) return null;
        return <ReportsView />;

      case 'settings':
        return <SettingsView />;

      case 'profile':
        if (currentUser) {
          if (currentUser.role === 'STUDENT') {
            return <StudentsView onOpenCreateUser={handleOpenCreateUser} onViewStudent={handleViewStudentProfile} onOpenEditUser={handleOpenEditUser} />;
          } else {
            return <TeachersView onOpenCreateUser={handleOpenCreateUser} onViewTeacher={handleViewTeacherProfile} onOpenEditUser={handleOpenEditUser} />;
          }
        }
        return <SettingsView />;

      default:
        return (
          <DashboardView
            onNavigate={setActiveTab}
            onOpenCreateUser={() => handleOpenCreateUser('STUDENT')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      <Header
        onToggleMobileSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onOpenSearch={() => setIsGlobalSearchOpen(true)}
        onNavigate={setActiveTab}
        activeTabTitle={activeTab}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>
      </div>

      {/* Modals */}
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setIsGlobalSearchOpen(false)}
        onNavigate={setActiveTab}
      />

      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        defaultRole={createUserDefaultRole}
      />

      <EditUserModal
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />

      <StudentProfileModal
        isOpen={!!selectedStudentForProfile}
        onClose={() => setSelectedStudentForProfile(null)}
        student={selectedStudentForProfile}
      />

      <TeacherProfileModal
        isOpen={!!selectedTeacherForProfile}
        onClose={() => setSelectedTeacherForProfile(null)}
        teacher={selectedTeacherForProfile}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <SchoolDataProvider>
          <AuthProvider>
            <MainApplication />
          </AuthProvider>
        </SchoolDataProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
