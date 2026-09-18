import React, { useState } from 'react';
import {
  GraduationCap,
  Lock,
  User,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Building2,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Language } from '../../types';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { theme } = useTheme();
  const { currentLanguage, setLanguage, t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username.trim(), password);
      if (!result.success) {
        if (result.error === 'accountDisabled') {
          setErrorMsg(t('accountDisabled'));
        } else {
          setErrorMsg(t('loginFailed'));
        }
      }
      setIsLoading(false);
    }, 300);
  };

  const handleDemoFill = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
              38-MAKTAB
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Elektron Ta'lim Boshqaruv Tizimi
            </p>
          </div>
        </div>

        {/* Language selector */}
        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          {(['UZ', 'RU', 'EN'] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentLanguage === lang
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </header>

      {/* Main Login Card */}
      <main className="w-full max-w-md mx-auto px-4 py-8 flex-1 flex flex-col justify-center">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-1 border border-blue-100 dark:border-blue-900/40">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t('loginTitle')}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {t('loginSubtitle')}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-700 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('login')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="login-username-input"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Login nomini kiriting..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {t('password')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Yuklanmoqda...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  {t('loginButton')}
                </>
              )}
            </button>
          </form>

          {/* Clean Admin Access */}
          <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Tizim Boshqaruvchisi (Administrator)
            </div>

            <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-800 dark:text-blue-300">
                <span>Login: <strong className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">admin</strong></span>
                <span>•</span>
                <span>Parol: <strong className="font-mono bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">admin123</strong></span>
              </div>

              <button
                type="button"
                id="quick-admin-login-btn"
                onClick={() => {
                  setUsername('admin');
                  setPassword('admin123');
                  setErrorMsg('');
                  login('admin', 'admin123');
                }}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin hisobiga 1-bosishda kirish</span>
              </button>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Barcha sinflar, o'qituvchilar, o'quvchilar, dars jadvali va uy vazifalari admin tomonidan qo'shiladi.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-400">
        <p>© 2026 38-MAKTAB. Barcha huquqlar himoyalangan. O'zbekiston Respublikasi Xalq Ta'limi Vazirligi tasarrufida.</p>
      </footer>
    </div>
  );
};
