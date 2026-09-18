import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User, UserStatus } from '../../types';

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user }) => {
  const { updateUser, changeUserPassword } = useSchoolData();
  const { t } = useLanguage();

  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<UserStatus>('active');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordSavedNotice, setPasswordSavedNotice] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setSurname(user.surname);
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      setStatus(user.status);
      setNewPassword('');
      setPasswordSavedNotice(false);
    }
  }, [user]);

  if (!user) return null;

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(user.id, {
      fullName: fullName.trim(),
      surname: surname.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      status,
    });
    onClose();
  };

  const handleChangePassword = () => {
    if (!newPassword.trim()) return;
    changeUserPassword(user.id, newPassword.trim());
    setPasswordSavedNotice(true);
    setTimeout(() => {
      setPasswordSavedNotice(false);
      setNewPassword('');
    }, 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${t('edit')}: ${user.fullName} ${user.surname}`}>
      <div className="space-y-6">
        {/* User preview */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
          <img
            src={user.photoUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <div>
            <div className="text-sm font-bold text-slate-900 dark:text-white">
              {user.fullName} {user.surname}
            </div>
            <div className="text-xs text-slate-400">
              Login: <span className="font-mono text-blue-600 dark:text-blue-400">{user.login}</span> • Rol: {user.role}
            </div>
          </div>
        </div>

        {/* Change password section (Admin only) */}
        <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">
              {t('changePassword')}
            </span>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                id="edit-user-new-password-input"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yangi maxfiy parol kiriting..."
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              id="confirm-change-password-btn"
              type="button"
              onClick={handleChangePassword}
              disabled={!newPassword.trim()}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors"
            >
              {passwordSavedNotice ? 'Saqlandi!' : t('save')}
            </button>
          </div>
        </div>

        {/* Details Form */}
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('fullName')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('surname')}
              </label>
              <input
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('phone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t('address')}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t('status')}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm"
            >
              <option value="active">{t('active')}</option>
              <option value="disabled">{t('disabled')}</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              {t('cancel')}
            </button>
            <button
              id="submit-edit-user-btn"
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
