import React, { useState } from 'react';
import {
  User as UserIcon,
  GraduationCap,
  Key,
  Copy,
  Check,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { Role, Gender, User } from '../../types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRole?: Role;
}

export const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  defaultRole = 'STUDENT',
}) => {
  const { classes, subjects, createUser } = useSchoolData();
  const { t } = useLanguage();

  const [role, setRole] = useState<Role>(defaultRole === 'ADMIN' ? 'STUDENT' : defaultRole);
  const [fullName, setFullName] = useState('');
  const [surname, setSurname] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('2009-01-01');
  const [gender, setGender] = useState<Gender>('male');
  const [phone, setPhone] = useState('+998 90 ');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400'
  );
  const [photoPreview, setPhotoPreview] = useState('');

  // Login & Password
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  // Student specific
  const [classId, setClassId] = useState(classes[0]?.id || '9-A');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('+998 90 ');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');

  // Teacher specific
  const [position, setPosition] = useState('O\'qituvchi');
  const [experienceYears, setExperienceYears] = useState(5);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>(['Matematika']);
  const [biography, setBiography] = useState('');

  // Success state for created account
  const [createdResult, setCreatedResult] = useState<{
    user: User;
    rawPass: string;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Auto-generate credentials
  const generateCredentials = () => {
    const cleanFirst = fullName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanLast = surname.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);

    const generatedLogin = cleanFirst && cleanLast
      ? `${cleanLast}_${cleanFirst.charAt(0)}${randNum}`
      : `${role.toLowerCase()}${randNum}`;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789@#$';
    let generatedPass = 'Maktab@';
    for (let i = 0; i < 4; i++) {
      generatedPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    setLogin(generatedLogin);
    setPassword(generatedPass);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        setPhotoUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubjectToggle = (subjName: string) => {
    if (selectedSubjects.includes(subjName)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subjName));
    } else {
      setSelectedSubjects([...selectedSubjects, subjName]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !surname.trim() || !login.trim() || !password.trim()) {
      alert('Iltimos, ism, familiya, login va parolni to\'ldiring!');
      return;
    }

    const userData: any = {
      login: login.trim(),
      password: password.trim(),
      role,
      fullName: fullName.trim(),
      surname: surname.trim(),
      dateOfBirth,
      gender,
      phone: phone.trim(),
      email: email.trim() || `${login.trim()}@38maktab.uz`,
      address: address.trim(),
      photoUrl: photoPreview || photoUrl,
      status: 'active',
    };

    if (role === 'STUDENT') {
      userData.classId = classId;
      userData.studentId = `STD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      userData.parentName = parentName.trim();
      userData.parentPhone = parentPhone.trim();
      userData.emergencyContact = emergencyContact.trim();
      userData.additionalInfo = additionalInfo.trim();
    } else if (role === 'TEACHER') {
      userData.teacherId = `TCH-${Math.floor(100 + Math.random() * 900)}`;
      userData.position = position.trim();
      userData.experienceYears = Number(experienceYears);
      userData.subjects = selectedSubjects;
      userData.assignedClasses = [classId];
      userData.biography = biography.trim();
    }

    const result = createUser(userData);
    setCreatedResult(result);
  };

  const handleCopyCredentials = () => {
    if (!createdResult) return;
    const textToCopy = `38-MAKTAB Kirish ma'lumotlari:\nFoydalanuvchi: ${createdResult.user.fullName} ${createdResult.user.surname}\nRol: ${createdResult.user.role}\nLogin: ${createdResult.user.login}\nParol: ${createdResult.rawPass}\nPlatforma manzili: ${window.location.origin}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleResetAndClose = () => {
    setCreatedResult(null);
    setFullName('');
    setSurname('');
    setLogin('');
    setPassword('');
    setPhotoPreview('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title={createdResult ? t('accountCreatedSuccess') : t('createAccount')}
      maxWidth="2xl"
    >
      {createdResult ? (
        /* Success Screen with Copy Credentials Card */
        <div id="account-created-success-card" className="space-y-6 py-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3 shadow-inner">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {t('accountCreatedSuccess')}
            </h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md">
              {t('accountCreatedSubtitle')}
            </p>
          </div>

          <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={createdResult.user.photoUrl}
                alt=""
                className="w-12 h-12 rounded-full object-cover border border-slate-200"
              />
              <div>
                <div className="text-base font-bold text-slate-900 dark:text-white">
                  {createdResult.user.fullName} {createdResult.user.surname}
                </div>
                <div className="text-xs text-slate-500">
                  {createdResult.user.role === 'STUDENT'
                    ? `${createdResult.user.classId} sinf o'quvchisi`
                    : createdResult.user.position}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('loginField')}
                </span>
                <div className="text-base font-mono font-bold text-blue-600 dark:text-blue-400 select-all">
                  {createdResult.user.login}
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {t('passwordField')}
                </span>
                <div className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 select-all">
                  {createdResult.rawPass}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              id="copy-created-credentials-btn"
              onClick={handleCopyCredentials}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-xs ${
                isCopied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4" />
                  {t('copied')}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {t('copyCredentials')}
                </>
              )}
            </button>

            <button
              onClick={handleResetAndClose}
              className="py-3 px-6 rounded-xl font-semibold text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors"
            >
              {t('save')} & Yopish
            </button>
          </div>
        </div>
      ) : (
        /* Create User Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Type Switcher */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {t('userType')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                id="select-role-student-btn"
                onClick={() => setRole('STUDENT')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl font-bold text-sm border transition-all ${
                  role === 'STUDENT'
                    ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-600 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <GraduationCap className="w-5 h-5" />
                {t('studentRole')}
              </button>

              <button
                type="button"
                id="select-role-teacher-btn"
                onClick={() => setRole('TEACHER')}
                className={`flex items-center justify-center gap-2.5 p-3 rounded-xl font-bold text-sm border transition-all ${
                  role === 'TEACHER'
                    ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-600 text-purple-600 dark:text-purple-400 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <UserIcon className="w-5 h-5" />
                {t('teacherRole')}
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('fullName')} *
              </label>
              <input
                id="create-user-fullname"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masalan: Sardor"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('surname')} *
              </label>
              <input
                id="create-user-surname"
                type="text"
                required
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Masalan: Tursunov"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('dateOfBirth')}
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('gender')}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="male">{t('male')}</option>
                <option value="female">{t('female')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                {t('phone')}
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998 90 123 45 67"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
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
                placeholder="pochta@38maktab.uz"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Profile Photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              {t('profilePhoto')}
            </label>
            <div className="flex items-center gap-4">
              <img
                src={photoPreview || photoUrl}
                alt="Preview"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-500/40 shrink-0"
              />
              <div className="flex-1 space-y-2">
                <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{t('uploadPhoto')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                <div className="text-[11px] text-slate-400">
                  Rasm tanlang yoki URL havolasini qoldiring
                </div>
              </div>
            </div>
          </div>

          {/* Role specific assignment */}
          {role === 'STUDENT' ? (
            <div className="p-4 bg-blue-50/40 dark:bg-blue-950/20 rounded-2xl border border-blue-100 dark:border-blue-900/40 space-y-3">
              <div className="font-bold text-xs text-blue-700 dark:text-blue-300 uppercase tracking-wider">
                O'quvchi ma'lumotlari
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('assignClass')} *
                  </label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-hidden"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.classTeacherName})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('parentName')}
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Masalan: Otabek Tursunov (Otasi)"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('parentPhone')}
                  </label>
                  <input
                    type="text"
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="+998 90 999 88 77"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('emergencyContact')}
                  </label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={(e) => setEmergencyContact(e.target.value)}
                    placeholder="+998 91 123 45 67"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-purple-50/40 dark:bg-purple-950/20 rounded-2xl border border-purple-100 dark:border-purple-900/40 space-y-3">
              <div className="font-bold text-xs text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                O'qituvchi ma'lumotlari
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('position')}
                  </label>
                  <input
                    type="text"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Masalan: Oliy toifali matematika o'qituvchisi"
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    {t('experienceYears')}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  {t('assignSubjects')}
                </label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {subjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.name);
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleSubjectToggle(sub.name)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Account Credentials generation */}
          <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-xs text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                  Kirish hisobi (Login & Parol)
                </span>
              </div>
              <button
                type="button"
                id="generate-credentials-btn"
                onClick={generateCredentials}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {t('generatePassword')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('loginField')} *
                </label>
                <input
                  id="create-user-login-field"
                  type="text"
                  required
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="admin tomonidan login"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t('passwordField')} *
                </label>
                <input
                  id="create-user-password-field"
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin tomonidan parol"
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-mono text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetAndClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              id="submit-create-account-btn"
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition-colors"
            >
              {t('createAccount')}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
