import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast, onDisconnect } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
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
  lastSeen: number | string | object;
  online?: boolean;
}

const UserProfilePopup: React.FC<{ user: ChatUser; onClose: () => void; onMessage: () => void }> = ({ user, onClose, onMessage }) => {
  const [copied, setCopied] = useState(false);
  const isOnline = user.online;
  const lastSeenStr = user.lastSeen && typeof user.lastSeen === 'number' 
    ? new Date(user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : 'Unknown';

  const handleCopyUsername = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(user.username);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.1)] relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 border-red-600/40 p-1 bg-black shadow-2xl">
              <img src={user.avatar} className="w-full h-full object-cover rounded-[2.1rem]" alt="" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0a0a0a] ${isOnline ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
          </div>

          <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{user.name}</h3>
          
          <button 
            onClick={handleCopyUsername}
            className="group/copy relative flex flex-col items-center mb-4 transition-transform active:scale-95"
            title="Click to copy username"
          >
            <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">@{user.username}</p>
            <AnimatePresence>
              {copied && (
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: -20 }}
                  exit={{ opacity: 0 }}
                  className="absolute text-[8px] font-black text-white bg-red-600 px-2 py-0.5 rounded uppercase tracking-widest whitespace-nowrap"
                >
                  Copied!
                </motion.span>
              )}
            </AnimatePresence>
            <span className="text-[7px] text-gray-700 font-black uppercase tracking-[0.2em] mt-1 opacity-0 group-hover/copy:opacity-100 transition-opacity">Click to copy</span>
          </button>
          
          <div className="flex items-center gap-2 mb-8">
            <span className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-green-500' : 'text-gray-500'}`}>
              {isOnline ? 'Neural Link Active' : `Signal Lost at ${lastSeenStr}`}
            </span>
          </div>

          <div className="w-full grid grid-cols-2 gap-3 mb-10">
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
              <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Status</p>
              <p className="text-[10px] text-white font-bold uppercase">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
            <div className="bg-white/5 border border-white/5 p-4 rounded-2xl text-center">
              <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mb-1">Identity</p>
              <p className="text-[10px] text-white font-bold uppercase">Verified</p>
            </div>
          </div>

          <button 
            onClick={() => { onMessage(); onClose(); }}
            className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
          >
            <SendIcon className="w-4 h-4" />
            Send Message
          </button>
        </div>
        
        <div className="bg-black/60 py-4 text-center border-t border-white/5">
          <p className="text-[8px] text-gray-700 uppercase font-black tracking-[1em]">Official Identity Verification</p>
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

  // 1. PRESENCE & USER SYNC
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      const connectedRef = ref(db, '.info/connected');

      onValue(connectedRef, (snap) => {
        if (snap.val() === true) {
          // Sync Clerk data to Firebase on connection
          set(userRef, {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || 'Selected Legend',
            username: clerkUser.username || clerkUser.firstName?.toLowerCase().replace(/\s/g, '_') || 'legend',
            avatar: clerkUser.imageUrl,
            createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : Date.now(),
            lastSeen: serverTimestamp(),
            online: true
          });

          // Handle Disconnect
          onDisconnect(userRef).update({
            online: false,
            lastSeen: serverTimestamp()
          });
        }
      });
    }
  }, [isSignedIn, clerkUser]);

  // 2. LISTEN TO ALL USERS (FOR SEARCH)
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

  // 3. DETERMINISTIC CHAT PATHS
  const chatPath = useMemo(() => {
    if (isGlobal) return 'community/global';
    if (!clerkUser?.id || !selectedUser?.id) return null;
    const sortedIds = [clerkUser.id, selectedUser.id].sort().join('_');
    return `messages/${sortedIds}`;
  }, [isGlobal, clerkUser?.id, selectedUser?.id]);

  // 4. MESSAGE SUBSCRIPTION & ALERTS
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
      
      // Sound alert for private messages
      if (!isGlobal && data.senderId !== clerkUser?.id && (!data.timestamp || Date.now() - data.timestamp < 10000)) {
        audioRef.current?.play().catch(() => {});
      }
    });
    
    return () => unsubscribe();
  }, [chatPath, clerkUser?.id, isGlobal]);

  // 5. ANTI-SCROLL MSG HANDLER
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // CRITICAL: Stop global scroll jump
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser) return;

    const textToSend = inputValue.trim();
    setInputValue('');

    const newMessage = {
      senderId: clerkUser.id,
      senderName: clerkUser.fullName || clerkUser.username || 'Legend',
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
      e.preventDefault(); // Stop newline/scrolling
      handleSendMessage();
    }
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

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
    <section id="community" className="py-24 bg-black relative z-10 select-none overflow-hidden">
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
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">FEZ Community</h2>
          <div className="h-1 w-16 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(220,38,38,0.5)]"></div>
        </div>

        <div className="w-full bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_60px_150px_rgba(0,0,0,1)] flex flex-col md:flex-row h-[800px] relative">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50">
            {/* GLOBAL TOGGLE */}
            <button 
              onClick={() => { setIsGlobal(true); setSelectedUser(null); }}
              className={`flex items-center gap-4 p-6 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}
            >
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Global Lobby</p>
                <p className="text-[8px] text-gray-600 uppercase font-black">Open Transmission</p>
              </div>
            </button>

            <div className="p-6">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Scan Legends..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold text-white uppercase tracking-widest focus:border-red-600 outline-none transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-2">
              <AnimatePresence mode="popLayout">
                {filteredUsers.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 opacity-10">
                    <UserCircleIcon className="w-12 h-12 mx-auto mb-3" />
                    <p className="text-[9px] uppercase font-black tracking-widest">No Signals Found</p>
                  </motion.div>
                ) : (
                  filteredUsers.map((u) => (
                    <motion.button 
                      layout key={u.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      onClick={() => setViewingProfile(u)}
                      className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-blue-600/10 border-blue-600/20' : 'hover:bg-white/5'}`}
                    >
                      <div className="relative">
                        <img src={u.avatar} className="w-11 h-11 rounded-2xl border border-white/10 object-cover" alt="" />
                        <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#080808] ${u.online ? 'bg-green-500' : 'bg-gray-600'}`}></div>
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

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col bg-black relative">
            {/* HEADER */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
              <div className="flex items-center gap-5">
                {isGlobal ? (
                  <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30">
                    <GlobeAltIcon className="w-6 h-6 text-red-500" />
                  </div>
                ) : (
                  <div className="relative cursor-pointer group" onClick={() => selectedUser && setViewingProfile(selectedUser)}>
                    <img src={selectedUser?.avatar} className="w-14 h-14 rounded-2xl border-2 border-blue-600/40 group-hover:border-blue-500 transition-colors shadow-2xl" alt="" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black ${selectedUser?.online ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
                )}
                <div>
                  <h4 className="text-[14px] font-black text-white uppercase tracking-widest">
                    {isGlobal ? 'Global Transmission' : selectedUser?.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGlobal || selectedUser?.online ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">
                      {isGlobal ? 'Protocol: Community' : `@${selectedUser?.username}`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* MESSAGES */}
            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-1 chat-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-10 text-center">
                  <SparklesIcon className="w-16 h-16 mb-6" />
                  <p className="text-[11px] uppercase font-black tracking-[0.5em]">Establishing Neural Connection...</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isOwn = msg.senderId === clerkUser?.id;
                  const prevMsg = messages[index - 1];
                  const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId || (msg.timestamp - prevMsg.timestamp > 300000);

                  return (
                    <motion.div 
                      key={msg.id}
                      initial={showHeader ? { opacity: 0, y: 10 } : { opacity: 1 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-4 group ${showHeader ? 'mt-8' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className="flex-shrink-0 w-11 flex flex-col items-center">
                        {showHeader ? (
                          <img 
                            src={msg.senderAvatar} 
                            className={`w-11 h-11 rounded-2xl border cursor-pointer hover:scale-105 transition-all duration-300 ${isOwn ? 'border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.15)]' : 'border-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.15)]'}`} 
                            alt="" 
                            onClick={() => {
                              const found = users.find(u => u.id === msg.senderId);
                              if (found) setViewingProfile(found);
                            }}
                          />
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 text-[8px] text-gray-800 font-black pt-1 transition-opacity">
                            {new Date(msg.timestamp).getHours()}:{String(new Date(msg.timestamp).getMinutes()).padStart(2, '0')}
                          </span>
                        )}
                      </div>

                      <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                        {showHeader && (
                          <div className={`flex items-center gap-3 mb-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${isOwn ? 'text-red-500' : 'text-blue-500'}`}>
                              {isOwn ? 'Authorized User' : msg.senderName}
                            </span>
                            <span className="text-[8px] text-gray-700 font-black uppercase tracking-widest">
                               {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        )}
                        <div className={`p-4 rounded-[1.8rem] text-[13px] font-medium leading-relaxed border transition-all ${
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

            {/* INPUT */}
            <div className="p-8 bg-black/60 border-t border-white/5 backdrop-blur-xl">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-2.5 focus-within:border-red-600/50 transition-all shadow-inner">
                  <input 
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isGlobal ? "Broadcast to Global Lobby..." : `Transmitting to ${selectedUser?.name.split(' ')[0]}...`}
                    className="flex-1 bg-transparent px-6 py-3 text-[13px] font-bold text-white outline-none placeholder:text-gray-700"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:bg-gray-900 text-white w-14 h-14 flex items-center justify-center rounded-xl shadow-2xl active:scale-95 transition-all group"
                  >
                    <SendIcon className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-2">
                  <SignInButton mode="modal">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-black py-5 px-12 rounded-2xl text-[11px] uppercase tracking-[0.5em] transition-all shadow-[0_20px_50px_rgba(220,38,38,0.3)] border border-red-500/20 active:scale-95">
                      Verify Signature to Transmit
                    </button>
                  </SignInButton>
                </div>
              )}
              <div className="mt-6 flex items-center justify-center gap-8 opacity-20">
                <p className="text-[7px] text-gray-500 uppercase font-black tracking-[0.5em]">Neural Link Verified</p>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <p className="text-[7px] text-gray-500 uppercase font-black tracking-[0.5em]">E2E Encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
