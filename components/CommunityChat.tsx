
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, update, get, remove, runTransaction, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, BriefcaseIcon, ChevronRightIcon, ChatBubbleIcon, VolumeOffIcon, VolumeOnIcon, EyeIcon } from './Icons';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

const RECOMMENDED_PROFESSIONS = [
    'VFX Editor', 'Motion Designer', 'YouTuber', 'Photo Artist', 
    'Logo Designer', '3D Modeler', 'Video Editor', 'Graphic Designer', 'Thumbnail Artist'
];

interface Profile {
  role: 'Client' | 'Designer' | 'Editor';
  profession: string;
  experience: string;
  bio: string;
  chatPassword?: string;
}

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online?: boolean;
  profile?: Profile;
  unreadCount?: number;
}

interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: number;
}

const AgentProfileModal: React.FC<{ 
  user: ChatUser; 
  currentUser: any; 
  onClose: () => void; 
  onMessage: () => void; 
  isBlocked: boolean; 
  isMuted: boolean; 
  onToggleBlock: () => void; 
  onToggleMute: () => void 
}> = ({ user, currentUser, onClose, onMessage, isBlocked, isMuted, onToggleBlock, onToggleMute }) => {
  const isOwner = user.username === OWNER_HANDLE;
  const isAdmin = user.username === ADMIN_HANDLE;
  const isImmune = isOwner || isAdmin;
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`@${user.username}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-6"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }}
        className="relative w-full max-w-[480px] bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col max-h-[85vh] mx-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 flex flex-col items-center min-h-0">
            <div className="relative mb-8 flex-shrink-0">
                <div className={`w-32 h-32 rounded-[3rem] overflow-hidden border-4 ${isOwner ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : isAdmin ? 'border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'border-white/10'} p-1.5 bg-black`}>
                    <img src={user.avatar} className="w-full h-full object-cover rounded-[2.4rem]" alt="" />
                </div>
                {isOwner && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] px-3 py-1 rounded-full font-black tracking-widest shadow-lg">OWNER</span>}
                {isAdmin && <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[8px] px-3 py-1 rounded-full font-black tracking-widest shadow-lg">ADMIN</span>}
            </div>

            <div className="text-center mb-8 flex-shrink-0">
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user.name}</h2>
                <div className="flex items-center justify-center gap-2">
                    <span className="text-red-500 font-black text-[11px] uppercase tracking-[0.4em]">@{user.username}</span>
                    <button onClick={handleCopy} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 text-gray-400 transition-colors">
                        <i className={`fa-solid ${copied ? 'fa-check text-green-500' : 'fa-copy'} text-xs`}></i>
                    </button>
                </div>
            </div>

            <div className="w-full space-y-4 mb-8">
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Account</p>
                        <p className="text-[11px] font-black text-white uppercase truncate">{user.profile?.role || 'Member'}</p>
                    </div>
                    <div className="p-5 bg-white/5 rounded-3xl border border-white/5 text-center">
                        <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Work Experience</p>
                        <p className="text-[11px] font-black text-white uppercase truncate">{user.profile?.experience || '1'} Year(s)</p>
                    </div>
                </div>

                <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                    <h4 className="text-red-600 font-black text-[9px] uppercase tracking-[0.3em] mb-4">Professional Bio</h4>
                    <p className="text-[12px] text-gray-300 font-medium leading-relaxed italic" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        "{user.profile?.bio || 'Professional details pending registration.'}"
                    </p>
                </div>

                {currentUser?.id !== user.id && !isImmune && (
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onToggleBlock} className={`py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest border transition-all ${isBlocked ? 'bg-red-600 text-white border-red-500' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-red-600/10 hover:text-red-500'}`}>
                           {isBlocked ? 'Unblock Agent' : 'Block Agent'}
                        </button>
                        <button onClick={onToggleMute} className={`py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest border transition-all ${isMuted ? 'bg-blue-600 text-white border-blue-500' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-blue-600/10 hover:text-blue-500'}`}>
                           {isMuted ? 'Unmute' : 'Mute Signals'}
                        </button>
                    </div>
                )}
            </div>

            <button onClick={() => { onMessage(); onClose(); }} className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-[2rem] shadow-2xl transition-all active:scale-95 flex-shrink-0">
                Message Agent
            </button>
        </div>
        
        <button onClick={onClose} className="absolute top-8 right-8 p-3 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"><CloseIcon className="w-6 h-6" /></button>
      </motion.div>
    </motion.div>
  );
};

export const CommunityChat: React.FC<{ isModalMode?: boolean }> = ({ isModalMode }) => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatUser | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<Profile>({ role: 'Client', profession: '', experience: '', bio: '', chatPassword: '' });
  const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
  const [profSearch, setProfSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!clerkUser) return;
    const relRef = ref(db, `relationships/${clerkUser.id}`);
    return onValue(relRef, (snap) => {
        const data = snap.val() || {};
        setBlockedIds(Object.keys(data.blocking || {}));
        setMutedIds(Object.keys(data.muting || {}));
    });
  }, [clerkUser]);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      onValue(userRef, (snap) => { 
        if (!snap.val()?.profile) setShowSetup(true); 
      });
      update(userRef, { 
        online: true, 
        name: clerkUser.fullName || clerkUser.username, 
        avatar: clerkUser.imageUrl, 
        username: clerkUser.username, 
        id: clerkUser.id 
      });
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

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const chatQuery = query(ref(db, chatPath), limitToLast(50));
    return onChildAdded(chatQuery, (snap) => {
      setMessages(prev => [...prev, { ...snap.val() as Message, id: snap.key }]);
    });
  }, [chatPath]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isUnlocked]);

  const filteredMessages = useMemo(() => {
      return messages.filter(m => !blockedIds.includes(m.senderId));
  }, [messages, blockedIds]);

  const toggleBlock = async (targetId: string) => {
    if (!clerkUser) return;
    const isCurrentlyBlocked = blockedIds.includes(targetId);
    if (isCurrentlyBlocked) {
        await remove(ref(db, `relationships/${clerkUser.id}/blocking/${targetId}`));
    } else {
        await set(ref(db, `relationships/${clerkUser.id}/blocking/${targetId}`), true);
        if (selectedUser?.id === targetId) setSelectedUser(null);
    }
  };

  const toggleMute = async (targetId: string) => {
    if (!clerkUser) return;
    const isCurrentlyMuted = mutedIds.includes(targetId);
    if (isCurrentlyMuted) {
        await remove(ref(db, `relationships/${clerkUser.id}/muting/${targetId}`));
    } else {
        await set(ref(db, `relationships/${clerkUser.id}/muting/${targetId}`), true);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser) return;
    const newMessage = { 
      senderId: clerkUser.id, 
      senderName: clerkUser.fullName || clerkUser.username, 
      senderAvatar: clerkUser.imageUrl, 
      text: inputValue.trim(), 
      timestamp: Date.now() 
    };
    setInputValue('');
    await push(ref(db, chatPath), newMessage);

    if (!isGlobal && selectedUser) {
        const timestamp = Date.now();
        const recipientInboxRef = ref(db, `inbox/${selectedUser.id}/${clerkUser.id}`);
        runTransaction(recipientInboxRef, (currentData) => {
            if (currentData === null) return { timestamp, unreadCount: 1 };
            return { ...currentData, timestamp, unreadCount: (currentData.unreadCount || 0) + 1 };
        });
    }
  };

  const inboxUsers = useMemo(() => {
    const list = users.filter(u => u.id !== clerkUser?.id && !blockedIds.includes(u.id));
    const owner = list.find(u => u.username === OWNER_HANDLE);
    const admin = list.find(u => u.username === ADMIN_HANDLE);
    const others = list.filter(u => u.username !== OWNER_HANDLE && u.username !== ADMIN_HANDLE);
    
    const sorted = [];
    if (owner) sorted.push(owner);
    if (admin) sorted.push(admin);
    sorted.push(...others);
    return sorted;
  }, [users, clerkUser, blockedIds]);

  const handleChatUnlock = () => {
    const myProfile = users.find(u => u.id === clerkUser?.id)?.profile;
    if (!myProfile?.chatPassword || unlockPassword === myProfile.chatPassword) {
        setIsUnlocked(true);
    } else {
        alert("Incorrect Chat Signature.");
    }
  };

  useEffect(() => {
      setIsUnlocked(false);
      setUnlockPassword('');
  }, [selectedUser, isGlobal]);

  // FIX: Cast complex conditional to explicit boolean to prevent type mismatches in JSX attributes like 'disabled'.
  const needsUnlock = !!(!isGlobal && !isUnlocked && users.find(u => u.id === clerkUser?.id)?.profile?.chatPassword);

  return (
    <section id="community" className={`${isModalMode ? 'py-0 h-full' : 'py-24 bg-black relative z-10 select-none'}`}>
      <AnimatePresence>
        {viewingProfile && (
            <AgentProfileModal 
                user={viewingProfile} 
                currentUser={clerkUser}
                onClose={() => setViewingProfile(null)} 
                onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); }}
                isBlocked={blockedIds.includes(viewingProfile.id)}
                isMuted={mutedIds.includes(viewingProfile.id)}
                onToggleBlock={() => toggleBlock(viewingProfile.id)}
                onToggleMute={() => toggleMute(viewingProfile.id)}
            />
        )}
        
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl overflow-hidden">
             <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-[3rem] p-10 md:p-12 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Profile Setup</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-10">Define your presence in the zone</p>
                <form onSubmit={async (e) => { e.preventDefault(); if (clerkUser) { await update(ref(db, `users/${clerkUser.id}/profile`), setupData); setShowSetup(false); } }} className="space-y-6">
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Identity Role</label>
                      <select value={setupData.role} onChange={e => setSetupData({...setupData, role: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none">
                         <option value="Client">Client</option>
                         <option value="Designer">Designer</option>
                      </select>
                   </div>
                   {setupData.role !== 'Client' && (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Work Experience</label>
                                <input type="text" value={setupData.experience} placeholder="e.g. 5" onChange={e => setSetupData({...setupData, experience: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none" />
                            </div>
                            <div className="relative">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Profession</label>
                                <input type="text" value={setupData.profession} onFocus={() => setIsProfDropdownOpen(true)} placeholder="Search..." onChange={e => { setSetupData({...setupData, profession: e.target.value}); setProfSearch(e.target.value); }} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none" />
                                <AnimatePresence>
                                    {isProfDropdownOpen && (
                                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute left-0 right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-xl z-50 overflow-hidden shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {RECOMMENDED_PROFESSIONS.filter(p => p.toLowerCase().includes(profSearch.toLowerCase())).map(p => (
                                                <button key={p} type="button" onClick={() => { setSetupData({...setupData, profession: p}); setIsProfDropdownOpen(false); }} className="w-full text-left px-5 py-3 text-xs text-gray-400 hover:bg-red-600 hover:text-white border-b border-white/5 last:border-0">{p}</button>
                                            ))}
                                            <button type="button" onClick={() => setIsProfDropdownOpen(false)} className="w-full text-center py-2 bg-black text-[8px] text-gray-500 uppercase font-black">Close</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                       </div>
                   )}
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Professional Bio</label>
                      <textarea required rows={3} value={setupData.bio} onChange={e => setSetupData({...setupData, bio: e.target.value})} placeholder="Describe your background..." className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white resize-none focus:border-red-600 outline-none" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Chat Password (Optional)</label>
                      <input type="password" value={setupData.chatPassword} placeholder="Leave blank for no lock" onChange={e => setSetupData({...setupData, chatPassword: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none" />
                   </div>
                   <button type="submit" className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">Confirm Identity</button>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${isModalMode ? 'h-full max-w-full px-0' : 'container mx-auto px-6 max-w-6xl h-[800px]'}`}>
        <div className="w-full bg-[#080808] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full min-h-0">
          
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50 flex-shrink-0 min-h-0">
            <div className="p-8 border-b border-white/5 bg-black/30 flex-shrink-0">
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Inbox Signals</span>
            </div>
            
            <button onClick={() => { setIsGlobal(true); setSelectedUser(null); }} className={`flex items-center gap-4 p-7 border-b border-white/5 transition-all flex-shrink-0 ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left min-w-0 flex-1">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Public Grid</p>
                <p className="text-[8px] text-gray-600 font-bold uppercase">Community Sync</p>
              </div>
            </button>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-0">
              {inboxUsers.map(u => (
                <button key={u.id} onClick={() => { setIsGlobal(false); setSelectedUser(u); }} className={`w-full flex items-center gap-4 p-4 rounded-[2.2rem] transition-all border ${selectedUser?.id === u.id && !isGlobal ? 'bg-red-600/10 border-red-600/20' : 'border-transparent hover:bg-white/5'}`}>
                  <div className="relative flex-shrink-0">
                    <img src={u.avatar} className={`w-10 h-10 rounded-[1rem] border ${u.username === OWNER_HANDLE ? 'border-red-600' : u.username === ADMIN_HANDLE ? 'border-blue-600' : 'border-white/10'} object-cover`} alt="" />
                    {u.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-black bg-green-500"></div>}
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-[11px] font-black uppercase text-white truncate flex items-center gap-1.5">
                        {u.name}
                        {u.username === OWNER_HANDLE && <span className="owner-badge scale-[0.6] origin-left">OWNER</span>}
                        {u.username === ADMIN_HANDLE && <span className="owner-badge bg-blue-600 scale-[0.6] origin-left border-blue-400 shadow-blue-600/50">ADMIN</span>}
                    </p>
                    <p className="text-[9px] text-gray-600 font-bold uppercase truncate">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-black min-h-0 min-w-0">
            <div className="p-8 border-b border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-xl flex-shrink-0">
               <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30 overflow-hidden flex-shrink-0">
                  {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-600" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover rounded-2xl cursor-pointer" onClick={() => selectedUser && setViewingProfile(selectedUser)} />}
               </div>
               <div className="min-w-0">
                  <h4 className="text-[16px] font-black text-white uppercase tracking-widest truncate">{isGlobal ? 'Global Transmission' : selectedUser?.name}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">{isGlobal ? 'Public Sector' : `@${selectedUser?.username}`}</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-6 custom-scrollbar scroll-smooth min-h-0 relative">
              {needsUnlock ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-50 p-12 text-center">
                      <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-8 border border-red-600/30">
                          <i className="fa-solid fa-lock text-red-500 text-2xl"></i>
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Chat History Locked</h3>
                      <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-10">Verification required to access signals</p>
                      <div className="w-full max-w-sm space-y-4">
                          <input type="password" value={unlockPassword} onChange={e => setUnlockPassword(e.target.value)} placeholder="Signal Signature" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-white text-center outline-none focus:border-red-600" />
                          <button onClick={handleChatUnlock} className="w-full py-5 bg-red-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Verify & Access</button>
                      </div>
                  </div>
              ) : (
                  <>
                    {filteredMessages.map(msg => (
                        <div key={msg.id} className={`flex gap-5 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'} items-end min-w-0`}>
                        <img src={msg.senderAvatar} className="w-10 h-10 rounded-[0.8rem] border border-white/5 object-cover cursor-pointer flex-shrink-0 shadow-lg active:scale-90" alt="" onClick={() => { const u = users.find(usr => usr.id === msg.senderId); if(u) setViewingProfile(u); }} />
                        <div className={`max-w-[85%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                            <span className="text-[9px] font-black text-gray-600 uppercase mb-2 truncate max-w-full">{msg.senderName}</span>
                            <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium border whitespace-pre-wrap ${msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none shadow-lg'}`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{msg.text}</div>
                        </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} className="h-2 w-full flex-shrink-0" />
                  </>
              )}
            </div>

            <div className="p-8 md:p-10 border-t border-white/5 flex-shrink-0 bg-black/40">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className={`flex gap-4 bg-white/5 border border-white/10 rounded-[1.8rem] p-2 transition-all shadow-inner ${needsUnlock ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                    <input value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={needsUnlock} placeholder={isGlobal ? "Broadcast Signal..." : `Message ${selectedUser?.name}...`} className="flex-1 bg-transparent px-6 py-4 text-sm font-bold text-white outline-none" />
                    <button type="submit" disabled={!inputValue.trim() || needsUnlock} className="bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl active:scale-90 transition-all shadow-2xl flex-shrink-0"><SendIcon className="w-5 h-5" /></button>
                </form>
              ) : <div className="text-center py-4"><SignInButton mode="modal"><button className="bg-red-600 text-white font-black py-5 px-16 rounded-2xl uppercase text-[11px] tracking-[0.5em] shadow-2xl active:scale-95 transition-all">Verify Signature to Join</button></SignInButton></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
