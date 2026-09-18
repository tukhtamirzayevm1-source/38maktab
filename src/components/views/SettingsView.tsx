import React, { useState } from 'react';
import {
  Settings,
  School,
  Globe,
  Moon,
  Sun,
  KeyRound,
  Save,
  CheckCircle,
  Shield,
  Building,
} from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../types';

export const SettingsView: React.FC = () => {
  const { schoolProfile, updateSchoolProfile, updateUser } = useSchoolData();
  const { currentUser, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage, t } = useLanguage();

  // School profile state for Admin
  const [schoolName, setSchoolName] = useState(schoolProfile.name);
  const [address, setAddress] = useState(schoolProfile.address);
  const [phone, setPhone] = useState(schoolProfile.phone);
  const [email, setEmail] = useState(schoolProfile.email);
  const [academicYear, setAcademicYear] = useState(schoolProfile.academicYear);
  const [principalName, setPrincipalName] = useState(schoolProfile.principalName);

  // Password change state
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordNotice, setPasswordNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile save notice
  const [schoolSavedNotice, setSchoolSavedNotice] = useState(false);

  const handleSaveSchoolProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile({
      name: schoolName,
      address,
      phone,
      email,
      academicYear,
      principalName,
    });
    setSchoolSavedNotice(true);
    setTimeout(() => setSchoolSavedNotice(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (currentUser.password !== currentPasswordInput) {
      setPasswordNotice({ type: 'error', text: 'Joriy parol noto\'g\'ri kiritildi!' });
      return;
    }

    if (newPasswordInput.length < 6) {
      setPasswordNotice({ type: 'error', text: 'Yangi parol kamida 6 belgidan iborat bo\'lishi shart!' });
      return;
    }

    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordNotice({ type: 'error', text: 'Yangi parollar bir-biriga mos kelmadi!' });
      return;
    }

    updateUser(currentUser.id, {
      password: newPasswordInput,
    });

    setCurrentPasswordInput('');
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setPasswordNotice({ type: 'success', text: 'Parol muvaffaqiyatli yangilandi!' });
    setTimeout(() => setPasswordNotice(null), 3000);
  };

  return (
    <div id="settings-view" className="space-y-6">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-slate-700 dark:text-slate-300" />
          {t('navSettings')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tizim parametrlari, maktab rekvizitlari, interfeys tili va xavfsizlik sozlamalari
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language & Theme Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t('languageSettings')} & Interfeys
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              Dastur tili (Interface Language)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`py-2.5 rounded-xl font-bold text-xs transition-all border ${
                    currentLanguage === lang
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {lang === 'UZ' ? '🇺🇿 O\'zbek' : lang === 'RU' ? '🇷🇺 Русский' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">
              Mavzu rejimi (Theme)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  theme === 'light'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Sun className="w-4 h-4" />
                {t('lightMode')}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                  theme === 'dark'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Moon className="w-4 h-4" />
                {t('darkMode')}
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-5 h-5 text-purple-600" />
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              {t('changePassword')}
            </h3>
          </div>

          {passwordNotice && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                passwordNotice.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {passwordNotice.text}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Joriy parol
              </label>
              <input
                type="password"
                required
                value={currentPasswordInput}
                onChange={(e) => setCurrentPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Yangi parol
              </label>
              <input
                type="password"
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Yangi mustahkam parol"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Yangi parolni tasdiqlash
              </label>
              <input
                type="password"
                required
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Qayta kiriting"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
            >
              Parolni yangilash
            </button>
          </form>
        </div>

        {/* School Profile Card (Admin Only) */}
        {isAdmin && (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {t('schoolProfile')} (Admin nazorati)
                </h3>
              </div>

              {schoolSavedNotice && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Saqlandi
                </span>
              )}
            </div>

            <form onSubmit={handleSaveSchoolProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('schoolName')}
                  </label>
                  <input
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('academicYear')}
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('schoolAddress')}
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Direktor F.I.Sh
                  </label>
                  <input
                    type="text"
                    required
                    value={principalName}
                    onChange={(e) => setPrincipalName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('schoolPhone')}
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('schoolEmail')}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
