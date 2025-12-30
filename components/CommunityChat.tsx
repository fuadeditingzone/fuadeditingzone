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

const OWNER_USERNAME = 'fuadeditingzone';

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
  const isOwner = user.username === OWNER_USERNAME;
  
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
      <div className="w-full max-w-sm bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.1)] relative" onClick={e => e.stopPropagation()}>
        <button onClick={(e) => { e.preventDefault(); onClose(); }} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-10 flex flex-col items-center">
          <div className="relative mb-6">
            <div className={`w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 ${isOwner ? 'border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.5)]' : 'border-red-600/40'} p-1 bg-black`}>
              <img src={user.avatar} className="w-full h-full object-cover rounded-[2.1rem]" alt="" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[#0a0a0a] ${isOnline ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]' : 'bg-gray-600'}`}></div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{user.name}</h3>
            {isOwner && <span className="owner-badge">OWNER</span>}
          </div>
          
          <button onClick={handleCopyUsername} className="group/copy relative flex flex-col items-center mb-8 transition-transform active:scale-95">
            <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">@{user.username}</p>
            <AnimatePresence>{copied && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute -top-6 text-[8px] font-black text-white bg-red-600 px-2 py-0.5 rounded uppercase tracking-widest">Copied!</motion.span>}</AnimatePresence>
          </button>

          <button onClick={(e) => { e.preventDefault(); onMessage(); onClose(); }} className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3">
            <SendIcon className="w-4 h-4" /> Secure Comms
          </button>
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
  const [hasActiveOrder, setHasActiveOrder] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  }, []);

  // Sync Presence
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      onValue(ref(db, '.info/connected'), (snap) => {
        if (snap.val() === true) {
          set(userRef, {
            id: clerkUser.id,
            name: clerkUser.fullName || clerkUser.username || 'Selected Legend',
            username: clerkUser.username || clerkUser.firstName?.toLowerCase().replace(/\s/g, '_') || 'legend',
            avatar: clerkUser.imageUrl,
            createdAt: clerkUser.createdAt ? new Date(clerkUser.createdAt).getTime() : Date.now(),
            lastSeen: serverTimestamp(),
            online: true
          });
          onDisconnect(userRef).update({ online: false, lastSeen: serverTimestamp() });
        }
      });
    }
  }, [isSignedIn, clerkUser]);

  // Check for User's Active Orders (Gatekeeper Logic)
  useEffect(() => {
    if (!isSignedIn || !clerkUser) return;
    const ordersRef = ref(db, `orders/${clerkUser.id}`);
    const unsubscribe = onValue(ordersRef, (snap) => {
        const data = snap.val();
        if (data) {
            const hasPending = Object.values(data).some((o: any) => o.status === 'Pending' || o.status === 'Accepted');
            setHasActiveOrder(hasPending);
        }
    });
    return () => unsubscribe();
  }, [isSignedIn, clerkUser]);

  // Sync Users
  useEffect(() => {
    onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) setUsers(Object.values(data) as ChatUser[]);
    });
  }, []);

  const chatPath = useMemo(() => {
    if (isGlobal) return 'community/global';
    if (!clerkUser?.id || !selectedUser?.id) return null;
    return `messages/${[clerkUser.id, selectedUser.id].sort().join('_')}`;
  }, [isGlobal, clerkUser?.id, selectedUser?.id]);

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const unsubscribe = onChildAdded(query(ref(db, chatPath), limitToLast(50)), (snap) => {
      setMessages(prev => prev.some(m => m.id === snap.key) ? prev : [...prev, { ...snap.val() as Message, id: snap.key }]);
      if (!isGlobal && snap.val().senderId !== clerkUser?.id) audioRef.current?.play().catch(() => {});
    });
    return () => unsubscribe();
  }, [chatPath, clerkUser?.id, isGlobal]);

  // Gatekeeper: Smart Message Lock Logic
  const isMessageLocked = useMemo(() => {
    if (isGlobal || !selectedUser || clerkUser?.username === OWNER_USERNAME) return false;
    if (selectedUser.username !== OWNER_USERNAME) return false;
    if (!hasActiveOrder) return false;

    const lastMsg = messages[messages.length - 1];
    // If user sent the last message and owner hasn't replied, lock.
    return lastMsg && lastMsg.senderId === clerkUser?.id;
  }, [isGlobal, selectedUser, clerkUser, messages, hasActiveOrder]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser || isMessageLocked) return;

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
    } catch (error) { console.error("Signal Lost:", error); }
  };

  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return users.filter(u => u.id !== clerkUser?.id && (u.name.toLowerCase().includes(s) || (u.username && u.username.toLowerCase().includes(s))));
  }, [users, searchTerm, clerkUser]);

  return (
    <section id="community" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <AnimatePresence>
        {viewingProfile && <UserProfilePopup user={viewingProfile} onClose={() => setViewingProfile(null)} onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); }} />}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Community Core</span>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Neural Network</h2>
          <div className="h-1 w-16 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
        </div>

        <div className="w-full bg-[#080808] border border-white/5 rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[800px] relative">
          
          {/* USER DIRECTORY */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50">
            <button onClick={(e) => { e.preventDefault(); setIsGlobal(true); setSelectedUser(null); }} className={`flex items-center gap-4 p-6 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Global Stream</p>
                <p className="text-[8px] text-gray-600 uppercase font-black">All Legends</p>
              </div>
            </button>

            <div className="p-6">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Scan Records..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold text-white uppercase tracking-widest focus:border-red-600 outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-2">
              {filteredUsers.map((u) => (
                <motion.button key={u.id} layout onClick={(e) => { e.preventDefault(); setViewingProfile(u); }} className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-blue-600/10 border-blue-600/20' : 'hover:bg-white/5'}`}>
                  <div className="relative">
                    <img src={u.avatar} className={`w-11 h-11 rounded-2xl border ${u.username === OWNER_USERNAME ? 'border-red-600 shadow-[0_0_10px_rgba(255,0,0,0.4)]' : 'border-white/10'} object-cover`} alt="" />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#080808] ${u.online ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest truncate flex items-center gap-1">{u.name} {u.username === OWNER_USERNAME && <span className="owner-badge scale-75 origin-left">OWNER</span>}</p>
                    <p className="text-[8px] text-red-500 uppercase font-black">@{u.username}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* CHAT INTERFACE */}
          <div className="flex-1 flex flex-col bg-black relative">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-10">
              <div className="flex items-center gap-5">
                {isGlobal ? (
                  <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30">
                    <GlobeAltIcon className="w-6 h-6 text-red-500" />
                  </div>
                ) : (
                  <div className="relative cursor-pointer group" onClick={(e) => { e.preventDefault(); selectedUser && setViewingProfile(selectedUser); }}>
                    <img src={selectedUser?.avatar} className={`w-14 h-14 rounded-2xl border-2 ${selectedUser?.username === OWNER_USERNAME ? 'border-red-600 shadow-2xl' : 'border-blue-600/40'} group-hover:border-white transition-colors`} alt="" />
                    <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-black ${selectedUser?.online ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  </div>
                )}
                <div>
                  <h4 className="text-[14px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    {isGlobal ? 'Global Transmission' : selectedUser?.name}
                    {!isGlobal && selectedUser?.username === OWNER_USERNAME && <span className="owner-badge">OWNER</span>}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isGlobal || selectedUser?.online ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                    <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">{isGlobal ? 'Protocol: Open-Public' : `@${selectedUser?.username}`}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-1 chat-scrollbar">
              {messages.map((msg, index) => {
                const isOwn = msg.senderId === clerkUser?.id;
                const isOwnerMsg = users.find(u => u.id === msg.senderId)?.username === OWNER_USERNAME;
                const prevMsg = messages[index - 1];
                const showHeader = !prevMsg || prevMsg.senderId !== msg.senderId;

                return (
                  <motion.div key={msg.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`flex gap-4 ${showHeader ? 'mt-8' : 'mt-0.5'} ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-shrink-0 w-11">
                      {showHeader && <img src={msg.senderAvatar} className={`w-11 h-11 rounded-2xl border ${isOwnerMsg ? 'border-red-600 shadow-lg' : 'border-white/10'} object-cover`} alt="" />}
                    </div>
                    <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      {showHeader && <span className={`text-[9px] font-black uppercase mb-1 ${isOwnerMsg ? 'text-red-500' : 'text-gray-500'}`}>{msg.senderName} {isOwnerMsg && <span className="owner-badge scale-[0.6] ml-1">OWNER</span>}</span>}
                      <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium border ${isOwn ? 'sent-bubble rounded-tr-none' : 'received-bubble rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-black/60 border-t border-white/5 backdrop-blur-xl">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className={`flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-2.5 transition-all ${isMessageLocked ? 'opacity-50 grayscale' : 'focus-within:border-red-600/50'}`}>
                  <input 
                    ref={inputRef}
                    disabled={isMessageLocked}
                    value={isMessageLocked ? "Waiting for Owner's response..." : inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={isGlobal ? "Broadcast to Hub..." : `Message ${selectedUser?.name}...`}
                    className="flex-1 bg-transparent px-6 py-3 text-[13px] font-bold text-white outline-none"
                  />
                  <button type="submit" disabled={!inputValue.trim() || isMessageLocked} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white w-14 h-14 flex items-center justify-center rounded-xl shadow-xl transition-all">
                    <SendIcon className="w-5 h-5" />
                  </button>
                </form>
              ) : (
                <div className="text-center py-4">
                  <SignInButton mode="modal"><button onClick={(e) => e.preventDefault()} className="bg-red-600 text-white font-black py-4 px-12 rounded-2xl text-[11px] uppercase tracking-widest">Verify Identity to Transmit</button></SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};