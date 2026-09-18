import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Paperclip, Search, CheckCheck } from 'lucide-react';
import { useSchoolData } from '../../context/SchoolDataContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';
import { User } from '../../types';

export const ChatView: React.FC = () => {
  const { messages, users, sendMessage } = useSchoolData();
  const { currentUser, isAdmin, isTeacher, isStudent } = useAuth();
  const { t } = useLanguage();

  const [searchContact, setSearchContact] = useState('');
  const [activePartnerId, setActivePartnerId] = useState<string>('');
  const [newMessageText, setNewMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Available chat contacts based on role
  const contacts = users.filter((u) => {
    if (u.id === currentUser?.id) return false;
    if (searchContact.trim()) {
      const q = searchContact.toLowerCase();
      return (
        u.fullName.toLowerCase().includes(q) ||
        u.surname.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Set default partner
  useEffect(() => {
    if (!activePartnerId && contacts.length > 0) {
      setActivePartnerId(contacts[0].id);
    }
  }, [contacts, activePartnerId]);

  const activePartner = users.find((u) => u.id === activePartnerId);

  // Filter messages between current user and partner
  const chatThread = messages.filter((m) => {
    const isPair =
      (m.senderId === currentUser?.id && m.receiverId === activePartnerId) ||
      (m.senderId === activePartnerId && m.receiverId === currentUser?.id);
    return isPair;
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatThread.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim() || !activePartnerId || !currentUser) return;

    sendMessage({
      senderId: currentUser.id,
      senderName: `${currentUser.fullName} ${currentUser.surname}`,
      senderRole: currentUser.role,
      receiverId: activePartnerId,
      text: newMessageText.trim(),
    });

    setNewMessageText('');
  };

  return (
    <div id="chat-view" className="space-y-4">
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          {t('navChat')}
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          O'qituvchilar, o'quvchilar va ma'muriyat o'rtasida tezkor xabarlar almashinuvi
        </p>
      </div>

      <div className="h-[620px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Left Contacts List */}
        <div className="w-full md:w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                placeholder="Suhbatdoshni qidirish..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {contacts.map((c) => {
              const isSelected = c.id === activePartnerId;
              const unreadFromThisUser = messages.filter(
                (m) => m.senderId === c.id && m.receiverId === currentUser?.id && !m.isRead
              ).length;

              const roleLabel =
                c.role === 'ADMIN'
                  ? 'Boshqaruv'
                  : c.role === 'TEACHER'
                  ? c.position || 'O\'qituvchi'
                  : `${c.classId} sinf o'quvchisi`;

              return (
                <button
                  key={c.id}
                  onClick={() => setActivePartnerId(c.id)}
                  className={`w-full p-3.5 flex items-center justify-between text-left transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-l-4 border-l-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <img
                      src={c.photoUrl}
                      alt=""
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="truncate">
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {c.fullName} {c.surname}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate mt-0.5">
                        {roleLabel}
                      </div>
                    </div>
                  </div>

                  {unreadFromThisUser > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0 ml-2">
                      {unreadFromThisUser}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Conversation */}
        <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
          {activePartner ? (
            <>
              {/* Partner Header */}
              <div className="p-3.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activePartner.photoUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {activePartner.fullName} {activePartner.surname}
                    </div>
                    <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                      Onlayn • {activePartner.role}
                    </div>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-mono">
                  {activePartner.phone || activePartner.login}
                </span>
              </div>

              {/* Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {chatThread.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                    <MessageSquare className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                    <span>Hozircha xabarlar yo'q. Birinchi bo'lib yozing!</span>
                  </div>
                ) : (
                  chatThread.map((msg) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-bl-xs border border-slate-200/80 dark:border-slate-700 shadow-xs'
                          }`}
                        >
                          <p>{msg.text}</p>
                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            <span>{msg.timestamp}</span>
                            {isMe && <CheckCheck className="w-3 h-3" />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2"
              >
                <input
                  id="chat-message-input"
                  type="text"
                  value={newMessageText}
                  onChange={(e) => setNewMessageText(e.target.value)}
                  placeholder="Xabar matnini kiriting..."
                  className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={!newMessageText.trim()}
                  className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl transition-all shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Suhbatlashish uchun chap tomondagi ro'yxatdan biror kontaktni tanlang
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
