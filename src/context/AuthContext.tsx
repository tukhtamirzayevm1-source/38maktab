import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import { useSchoolData } from './SchoolDataContext';

interface AuthContextType {
  currentUser: User | null;
  login: (loginInput: string, passwordInput: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  hasRole: (role: Role) => boolean;
  updateCurrentProfile: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'maktab38_current_user_id';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { users, updateUser } = useSchoolData();
  const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
    return localStorage.getItem(AUTH_STORAGE_KEY);
  });

  // Find the full user object from school data
  const currentUser = users.find((u) => u.id === currentUserId) || null;

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem(AUTH_STORAGE_KEY, currentUserId);
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUserId]);

  const login = (loginInput: string, passwordInput: string): { success: boolean; error?: string } => {
    const trimmedLogin = loginInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    let matchedUser = users.find(
      (u) => u.login.toLowerCase() === trimmedLogin && u.password === trimmedPass
    );

    // Fallback for admin credentials
    if (!matchedUser && (trimmedLogin === 'admin' || trimmedLogin === 'admin38')) {
      if (trimmedPass === 'admin123' || trimmedPass === 'admin' || trimmedPass === 'Admin@38') {
        matchedUser = users.find((u) => u.role === 'ADMIN');
      }
    }

    if (!matchedUser) {
      return { success: false, error: 'loginFailed' };
    }

    if (matchedUser.status === 'disabled') {
      return { success: false, error: 'accountDisabled' };
    }

    setCurrentUserId(matchedUser.id);
    return { success: true };
  };

  const logout = () => {
    setCurrentUserId(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const isAdmin = currentUser?.role === 'ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isStudent = currentUser?.role === 'STUDENT';

  const hasRole = (role: Role) => currentUser?.role === role;

  const updateCurrentProfile = (updates: Partial<User>) => {
    if (currentUser) {
      updateUser(currentUser.id, updates);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAdmin,
        isTeacher,
        isStudent,
        hasRole,
        updateCurrentProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
