import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast, onDisconnect, update, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, BriefcaseIcon, ChevronRightIcon } from './Icons';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const OWNER_USERNAME = 'fuadeditingzone';

interface Profile {
  role: 'Client' | 'Designer' | 'Editor';
  profession: string;
  experience: string;
  bio: string;
}

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online?: boolean;
  profile?: Profile;
}

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
}

interface Connection {
  status: 'pending' | 'accepted';
  initiatorId: string;
}

const FullScreenProfile: React.FC<{ user: ChatUser; onClose: () => void; onMessage: () => void }> = ({ user, onClose, onMessage }) => {
  const isOwner = user.username === OWNER_USERNAME;
  const profile = user.profile;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[600] bg-black flex flex-col items-center justify-center p-6 select-none"
    >
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
         <img src={user.avatar} className="w-full h-full object-cover blur-3xl scale-125" alt="" />
      </div>

      <button onClick={onClose} className="absolute top-8 right-8 z-10 p-4 bg-white/5 hover:bg-white/10 rounded-full text-white transition-all">
        <CloseIcon className="w-8 h-8" />
      </button>

      <div className="relative w-full max-w-2xl bg-[#080808]/80 backdrop-blur-2xl border border-white/10 rounded-[4rem] p-12 md:p-20 shadow-[0_0_100px_rgba(0,0,0,1)] overflow-hidden">
        <div className="flex flex-col items-center text-center">
            <div className="relative mb-10">
                <div className={`w-40 h-40 md:w-56 md:h-56 rounded-[3.5rem] overflow-hidden border-4 ${isOwner ? 'border-red-600 shadow-[0_0_50px_rgba(255,0,0,0.3)]' : 'border-white/10'} p-2 bg-black`}>
                    <img src={user.avatar} className="w-full h-full object-cover rounded-[2.8rem]" alt="" />
                </div>
                <div className={`absolute bottom-2 right-2 w-8 h-8 rounded-full border-4 border-black ${user.online ? 'bg-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]' : 'bg-gray-700'}`}></div>
            </div>

            <div className="mb-12">
                <div className="flex items-center justify-center gap-3 mb-2">
                    <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none">{user.name}</h2>
                    {isOwner && <span className="owner-badge text-xs scale-125">OWNER</span>}
                </div>
                <p className="text-red-500 font-black text-xs md:text-base uppercase tracking-[0.5em]">@{user.username}</p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full mb-12">
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Primary Role</span>
                    <span className="text-sm font-black text-white uppercase tracking-widest">{profile?.role || 'Agent'}</span>
                </div>
                <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Experience</span>
                    <span className="text-sm font-black text-white uppercase tracking-widest">{profile?.experience || '1+ Year'}</span>
                </div>
            </div>

            <div className="w-full bg-white/5 border border-white/5 rounded-[2.5rem] p-8 md:p-10 mb-12 text-left">
                <h4 className="text-red-600 font-black text-[10px] uppercase tracking-[0.3em] mb-4">Neural Data Log</h4>
                <p className="text-sm md:text-lg text-gray-400 font-medium leading-relaxed italic">
                    "{profile?.bio || 'No public transmission logs found for this entity. This user has limited biometric visibility.'}"
                </p>
            </div>

            <button 
                onClick={(e) => { e.preventDefault(); onMessage(); onClose(); }}
                className="w-full py-6 md:py-8 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.6em] text-[12px] md:text-sm rounded-[2.5rem] shadow-2xl transition-all active:scale-95"
            >
                Initiate Secure Comm Link
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export const CommunityChat: React.FC = () => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [recentChats, setRecentChats] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatUser | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [connection, setConnection] = useState<Connection | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      update(userRef, { online: true });
      onDisconnect(userRef).update({ online: false });
    }
  }, [isSignedIn, clerkUser]);

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

  // Track Recent Chats (Inbox)
  useEffect(() => {
    if (!isSignedIn || !clerkUser || !users.length) return;
    const inboxRef = ref(db, `inbox/${clerkUser.id}`);
    const unsubscribe = onValue(inboxRef, (snap) => {
        const data = snap.val();
        if (data) {
            const sortedIds = Object.entries(data)
                .sort((a: any, b: any) => b[1].timestamp - a[1].timestamp)
                .map(e => e[0]);
            const filtered = sortedIds.map(id => users.find(u => u.id === id)).filter(Boolean) as ChatUser[];
            setRecentChats(filtered);
        }
    });
    return () => unsubscribe();
  }, [isSignedIn, clerkUser, users]);

  // Track Connection Status
  useEffect(() => {
    if (isGlobal || !chatPath) return;
    const connRef = ref(db, `connections/${chatPath.replace('messages/', '')}`);
    const unsubscribe = onValue(connRef, (snap) => setConnection(snap.val()));
    return () => unsubscribe();
  }, [isGlobal, chatPath]);

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const unsubscribe = onChildAdded(query(ref(db, chatPath), limitToLast(50)), (snap) => {
      setMessages(prev => prev.some(m => m.id === snap.key) ? prev : [...prev, { ...snap.val() as Message, id: snap.key }]);
    });
    return () => unsubscribe();
  }, [chatPath]);

  const messageCountFromMe = useMemo(() => {
    if (isGlobal || !clerkUser) return 0;
    return messages.filter(m => m.senderId === clerkUser.id).length;
  }, [messages, isGlobal, clerkUser]);

  const isLocked = useMemo(() => {
    if (isGlobal || !clerkUser || !selectedUser) return false;
    if (clerkUser.username === OWNER_USERNAME || selectedUser.username === OWNER_USERNAME) return false;
    if (connection?.status === 'accepted') return false;
    return messageCountFromMe >= 3;
  }, [messageCountFromMe, isGlobal, connection, clerkUser, selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser || isLocked) return;

    const newMessage = {
      senderId: clerkUser.id,
      senderName: clerkUser.fullName || clerkUser.username || 'Legend',
      senderAvatar: clerkUser.imageUrl,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };
    
    setInputValue('');
    await push(ref(db, chatPath), newMessage);

    // Update Inbox for both users
    if (!isGlobal && selectedUser) {
        const timestamp = Date.now();
        update(ref(db, `inbox/${clerkUser.id}/${selectedUser.id}`), { timestamp });
        update(ref(db, `inbox/${selectedUser.id}/${clerkUser.id}`), { timestamp });
    }
  };

  const handleSendRequest = async () => {
    if (isGlobal || !chatPath || !clerkUser) return;
    const connId = chatPath.replace('messages/', '');
    await set(ref(db, `connections/${connId}`), {
        status: 'pending',
        initiatorId: clerkUser.id
    });
  };

  const handleAcceptRequest = async () => {
    if (isGlobal || !chatPath) return;
    const connId = chatPath.replace('messages/', '');
    await update(ref(db, `connections/${connId}`), { status: 'accepted' });
  };

  const filteredSearch = useMemo(() => {
    const s = searchTerm.toLowerCase();
    if (!s) return [];
    return users.filter(u => u.id !== clerkUser?.id && (u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s)));
  }, [users, searchTerm, clerkUser]);

  return (
    <section id="community" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <AnimatePresence>
        {viewingProfile && <FullScreenProfile user={viewingProfile} onClose={() => setViewingProfile(null)} onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); }} />}
        
        {isSearching && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[550] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4"
          >
             <div className="w-full max-w-xl flex flex-col h-[70vh]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Scan Neural Network</h3>
                    <button onClick={() => setIsSearching(false)} className="p-2 text-gray-500 hover:text-white"><CloseIcon className="w-8 h-8" /></button>
                </div>
                <div className="relative mb-8">
                    <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-red-600" />
                    <input 
                        autoFocus
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        placeholder="Search Agents by Name or ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] py-6 pl-16 pr-8 text-lg font-bold text-white outline-none focus:border-red-600 transition-all"
                    />
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {filteredSearch.map(u => (
                        <button key={u.id} onClick={() => { setViewingProfile(u); setIsSearching(false); }} className="w-full bg-white/5 hover:bg-red-600/10 border border-white/5 hover:border-red-600/20 rounded-[2rem] p-6 flex items-center gap-6 transition-all group">
                            <img src={u.avatar} className="w-16 h-16 rounded-2xl object-cover border border-white/10" alt="" />
                            <div className="text-left flex-1">
                                <p className="text-lg font-black text-white uppercase tracking-tight">{u.name}</p>
                                <p className="text-xs text-red-500 font-bold uppercase tracking-widest">@{u.username}</p>
                            </div>
                            <ChevronRightIcon className="w-6 h-6 text-gray-700 group-hover:text-red-600 transition-colors" />
                        </button>
                    ))}
                    {searchTerm && filteredSearch.length === 0 && <p className="text-center py-10 text-gray-600 uppercase font-black text-[10px] tracking-widest">No matching agents found in current sector</p>}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Community Sector</span>
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Neural Network</h2>
          <div className="h-1 w-20 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
        </div>

        <div className="w-full bg-[#080808] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[800px] relative">
          
          {/* SIDEBAR: INBOX FOCUS */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                    <span className="text-[11px] font-black text-white uppercase tracking-widest">Inbox</span>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsSearching(true)} className="p-2.5 rounded-xl bg-white/5 hover:bg-red-600/20 text-red-600 transition-all border border-white/5 hover:border-red-600/30">
                        <SearchIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <button onClick={(e) => { e.preventDefault(); setIsGlobal(true); setSelectedUser(null); }} className={`flex items-center gap-4 p-6 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border transition-all ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Public Feed</p>
                <p className="text-[8px] text-gray-600 font-black uppercase">Main Stream</p>
              </div>
            </button>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {recentChats.map(u => (
                <button key={u.id} onClick={(e) => { e.preventDefault(); setIsGlobal(false); setSelectedUser(u); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all border border-transparent ${selectedUser?.id === u.id && !isGlobal ? 'bg-blue-600/10 border-blue-600/20' : 'hover:bg-white/5'}`}>
                  <div className="relative">
                    <img src={u.avatar} className={`w-11 h-11 rounded-2xl border ${u.username === OWNER_USERNAME ? 'border-red-600 shadow-lg' : 'border-white/10'} object-cover`} alt="" />
                    {u.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black bg-green-500"></div>}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest truncate flex items-center gap-1">{u.name} {u.username === OWNER_USERNAME && <span className="owner-badge scale-[0.6] origin-left">OWNER</span>}</p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase truncate">@{u.username}</p>
                  </div>
                </button>
              ))}
              {recentChats.length === 0 && <p className="text-center py-20 text-[9px] text-gray-700 uppercase font-black tracking-widest px-8">No active private signals detected. Use search to find agents.</p>}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col bg-black">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30 overflow-hidden">
                    {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-500" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover rounded-2xl" onClick={() => selectedUser && setViewingProfile(selectedUser)} />}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                        {isGlobal ? 'Global Transmission' : selectedUser?.name}
                        {!isGlobal && selectedUser?.username === OWNER_USERNAME && <span className="owner-badge scale-75">OWNER</span>}
                    </h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">{isGlobal ? 'Protocol: Multi-Signal' : `@${selectedUser?.username}`}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 mb-4 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                   <img src={msg.senderAvatar} className="w-10 h-10 rounded-xl border border-white/5 object-cover flex-shrink-0 cursor-pointer" alt="" onClick={() => { const u = users.find(usr => usr.id === msg.senderId); if(u) setViewingProfile(u); }} />
                   <div className={`max-w-[70%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-[9px] font-black text-gray-600 uppercase mb-1">{msg.senderName}</span>
                      <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium border ${msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none'}`}>{msg.text}</div>
                   </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Private Chat connection Logic */}
            {!isGlobal && connection?.status === 'pending' && connection.initiatorId !== clerkUser?.id && (
                <div className="p-8 bg-red-600/10 border-t border-red-600/20 flex flex-col items-center gap-4">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Neural Connection Requested</p>
                    <button onClick={handleAcceptRequest} className="px-10 py-4 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Accept Connection</button>
                </div>
            )}

            <div className="p-8 bg-black border-t border-white/5">
              {isSignedIn ? (
                <div className="space-y-4">
                    {isLocked && connection?.status !== 'pending' && (
                        <div className="bg-red-600/10 border border-red-600/20 rounded-[2rem] p-8 text-center space-y-6">
                            <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.4em]">Signal Limit Reached (3/3)</p>
                            <p className="text-[11px] text-gray-400 font-medium leading-relaxed max-w-sm mx-auto uppercase tracking-widest">A secure connection request is required to continue unlimited private transmissions with this entity.</p>
                            <button onClick={handleSendRequest} className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[10px] rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3">
                                <SparklesIcon className="w-4 h-4" /> Send Connection Request
                            </button>
                        </div>
                    )}
                    
                    {isLocked && connection?.status === 'pending' && connection.initiatorId === clerkUser?.id && (
                        <div className="text-center py-6 border border-white/5 rounded-[2rem] bg-white/5">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.5em] animate-pulse">Waiting for Entity Approval...</p>
                        </div>
                    )}

                    <form onSubmit={handleSendMessage} className={`flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 transition-opacity ${isLocked ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={isLocked} placeholder={isGlobal ? "Broadcast to Main Hub..." : `Secure Signal to ${selectedUser?.name}...`} className="flex-1 bg-transparent px-6 py-4 text-sm font-bold text-white outline-none" />
                        <button type="submit" disabled={!inputValue.trim() || isLocked} className="bg-red-600 hover:bg-red-700 disabled:bg-gray-900 text-white w-14 h-14 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-xl"><SendIcon className="w-5 h-5" /></button>
                    </form>
                </div>
              ) : (
                <div className="text-center py-4">
                  <SignInButton mode="modal"><button onClick={(e) => e.preventDefault()} className="bg-red-600 text-white font-black py-4 px-12 rounded-2xl text-[11px] uppercase tracking-widest shadow-xl">Verify Signature to Transmit</button></SignInButton>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};