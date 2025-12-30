import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getMessaging, getToken } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon } from './Icons';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const messaging = getMessaging(app);

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
}

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  createdAt: number;
  lastSeen?: number;
}

const UserProfilePopup: React.FC<{ user: ChatUser; onClose: () => void; onMessage: () => void }> = ({ user, onClose, onMessage }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-[2rem] overflow-hidden border-2 border-red-600/40 p-1 bg-black">
              <img src={user.avatar} className="w-full h-full object-cover rounded-[1.6rem]" alt="" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1.5 rounded-full border-2 border-[#0f0f0f]">
              <CheckCircleIcon className="w-4 h-4" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">{user.name}</h3>
          <p className="text-red-500 font-black text-[11px] uppercase tracking-[0.3em] mb-8">@{user.username || 'legendary_agent'}</p>

          <div className="w-full space-y-3 mb-10">
            <div className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Joined Zone</span>
              <span className="text-[10px] text-white font-bold">{new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between items-center px-6 py-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Neural ID</span>
              <span className="text-[10px] text-white font-bold uppercase">{user.id.slice(0, 10)}...</span>
            </div>
          </div>

          <button 
            onClick={() => { onMessage(); onClose(); }}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl transition-all shadow-xl active:scale-95"
          >
            Open Secure Line
          </button>
        </div>
        
        <div className="bg-black/40 py-4 text-center border-t border-white/5">
          <p className="text-[8px] text-gray-600 uppercase font-black tracking-[1em]">Official Identity Verification</p>
        </div>
      </div>
    </motion.div>
  );
};

export const CommunityChat: React.FC = () => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatUser | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  }, []);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      
      const syncUserData = (token?: string) => {
        set(userRef, {
          id: clerkUser.id,
          name: clerkUser.fullName || 'Legend',
          username: clerkUser.username || clerkUser.firstName?.toLowerCase().replace(/\s/g, '_') || 'anonymous',
          avatar: clerkUser.imageUrl,
          createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : Date.now(),
          fcmToken: token || null,
          lastSeen: serverTimestamp()
        });
      };

      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          getToken(messaging, { vapidKey: 'BE7pik37RZvIuKStwPfrAucx4DhCTQ3BK9ehWMpThmtxKaKZfGkurRqWGECejo8Wu_LqHh-k5JMnGetyEJ4Uukc' })
            .then(syncUserData)
            .catch(() => syncUserData());
        } else {
          syncUserData();
        }
      });
    }
  }, [isSignedIn, clerkUser]);

  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.values(data) as ChatUser[];
        setUsers(userList.filter(u => u.id !== clerkUser?.id));
      }
    });
    return () => unsubscribe();
  }, [clerkUser?.id]);

  const chatPath = useMemo(() => {
    if (isGlobal) return 'community/global';
    if (!clerkUser?.id || !selectedUser?.id) return null;
    const sortedIds = [clerkUser.id, selectedUser.id].sort().join('_');
    return `messages/${sortedIds}`;
  }, [isGlobal, clerkUser?.id, selectedUser?.id]);

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const msgRef = query(ref(db, chatPath), limitToLast(50));
    
    const unsubscribe = onChildAdded(msgRef, (snapshot) => {
      const data = snapshot.val() as Message;
      setMessages((prev) => {
        if (prev.some(m => m.id === snapshot.key)) return prev;
        return [...prev, { ...data, id: snapshot.key }];
      });
      
      if (data.senderId !== clerkUser?.id && (!data.timestamp || Date.now() - data.timestamp < 10000)) {
        audioRef.current?.play().catch(() => {});
      }
    });
    
    return () => unsubscribe();
  }, [chatPath, clerkUser?.id]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser) return;

    const textToSend = inputValue.trim();
    setInputValue('');

    const newMessage = {
      senderId: clerkUser.id,
      senderName: clerkUser.fullName || 'Legend',
      senderAvatar: clerkUser.imageUrl,
      text: textToSend,
      timestamp: Date.now(),
    };

    try {
      await push(ref(db, chatPath), newMessage);
      inputRef.current?.focus();
    } catch (error) {
      console.error("Transmission Error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const s = searchTerm.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(s) || 
      (u.username && u.username.toLowerCase().includes(s))
    );
  }, [users, searchTerm]);

  const startPrivateChat = (u: ChatUser) => {
    setIsGlobal(false);
    setSelectedUser(u);
  };

  return (
    <section id="community" className="py-24 bg-[#050505] relative z-10 select-none overflow-hidden">
      <AnimatePresence>
        {viewingProfile && (
          <UserProfilePopup 
            user={viewingProfile} 
            onClose={() => setViewingProfile(null)} 
            onMessage={() => startPrivateChat(viewingProfile)} 
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Neural Link Hub</span>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Community Briefing</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)] flex flex-col md:flex-row h-[750px] relative">
          
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-black/40">
            <button 
              onClick={() => { setIsGlobal(true); setSelectedUser(null); }}
              className={`flex items-center gap-4 p-6 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Global Lobby</p>
                <p className="text-[8px] text-gray-500 uppercase font-black">Open Frequency</p>
              </div>
            </button>

            <div className="p-6">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search @username..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold text-white uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredUsers.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 opacity-10">
                    <UserCircleIcon className="w-10 h-10 mx-auto mb-2" />
                    <p className="text-[9px] uppercase font-black tracking-widest">No Signals Found</p>
                  </motion.div>
                ) : (
                  filteredUsers.map((u) => (
                    <motion.button 
                      layout key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      onClick={() => setViewingProfile(u)}
                      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-blue-600/10 border-blue-600/30' : 'hover:bg-white/5'}`}
                    >
                      <div className="relative">
                        <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
                      </div>
                      <div className="text-left min-w-0">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{u.name}</p>
                        <p className="text-[8px] text-red-500 uppercase font-black">@{u.username}</p>
                      </div>
                    </motion.button>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#050505] relative">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md">
              <div className="flex items-center gap-5">
                {isGlobal ? (
                  <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/40">
                    <GlobeAltIcon className="w-6 h-6 text-red-500" />
                  </div>
                ) : (
                  <div className="relative cursor-pointer group" onClick={() => selectedUser && setViewingProfile(selectedUser)}>
                    <img src={selectedUser?.avatar} className="w-12 h-12 rounded-full border-2 border-blue-600/40 group-hover:border-blue-500 transition-colors" alt="" />
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#050505]"></div>
                  </div>
                )}
                <div>
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">
                    {isGlobal ? 'Global Communications' : selectedUser?.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                      {isGlobal ? 'Frequency: Community' : `@${selectedUser?.username}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-1 chat-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <SparklesIcon className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase font-black tracking-[0.3em]">Ready for Transmission</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === clerkUser?.id;
                  const prevMsg = messages[index - 1];
                  const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId || (msg.timestamp - prevMsg.timestamp > 300000);

                  return (
                    <motion.div 
                      key={msg.id}
                      initial={showHeader ? { opacity: 0, y: 5 } : { opacity: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 group ${showHeader ? 'mt-6' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="flex-shrink-0 w-10 flex flex-col items-center">
                        {showHeader ? (
                          <img 
                            src={msg.senderAvatar} 
                            className={`w-10 h-10 rounded-xl border cursor-pointer hover:scale-110 transition-transform ${isOwn ? 'border-red-600/30' : 'border-blue-600/30'}`} 
                            alt="" 
                            onClick={() => {
                              const found = users.find(u => u.id === msg.senderId);
                              if (found) setViewingProfile(found);
                            }}
                          />
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-700 font-black pt-1 transition-opacity">
                            {new Date(msg.timestamp).getHours()}:{String(new Date(msg.timestamp).getMinutes()).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[80%]`}>
                        {showHeader && (
                          <div className={`flex items-center gap-3 mb-1.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isOwn ? 'text-red-500' : 'text-blue-500'}`}>
                              {isOwn ? 'You' : msg.senderName}
                            </span>
                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">
                               {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <div className={`p-4 rounded-2xl text-[13px] font-medium leading-relaxed border transition-all ${
                          isOwn 
                            ? 'sent-bubble text-white rounded-tr-none' 
                            : 'received-bubble text-white rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-4 w-full" />
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-red-600/50 transition-all shadow-inner">
                  <input 
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isGlobal ? "Broadcast to Global Lobby..." : `Message ${selectedUser?.name.split(' ')[0]}...`}
                    className="flex-1 bg-transparent px-6 py-3 text-[13px] font-bold text-white outline-none placeholder:text-gray-700"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:bg-gray-800 text-white w-12 h-12 flex items-center justify-center rounded-xl shadow-xl active:scale-95 transition-all group"
                  >
                    <SendIcon className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <SignInButton mode="modal">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-[0_15px_30px_rgba(220,38,38,0.3)]">
                      Identify Yourself to Transmit
                    </button>
                  </SignInButton>
                </div>
              )}
              <div className="mt-4 flex items-center justify-center gap-6 opacity-30">
                <p className="text-[7px] text-gray-500 uppercase font-black tracking-[0.4em]">Verified Neural Signature</p>
                <p className="text-[7px] text-gray-500 uppercase font-black tracking-[0.4em]">E2E Encryption Active</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
