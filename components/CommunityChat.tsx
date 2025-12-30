import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast, onDisconnect, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, BriefcaseIcon } from './Icons';

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

const UserProfilePopup: React.FC<{ user: ChatUser; onClose: () => void; onMessage: () => void }> = ({ user, onClose, onMessage }) => {
  const isOwner = user.username === OWNER_USERNAME;
  const profile = user.profile;

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[3.5rem] overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={(e) => { e.preventDefault(); onClose(); }} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="p-12 flex flex-col items-center">
          <div className="relative mb-8">
            <div className={`w-32 h-32 rounded-[2.5rem] overflow-hidden border-2 ${isOwner ? 'border-red-600 shadow-[0_0_25px_rgba(255,0,0,0.4)]' : 'border-white/10'} p-1 bg-black`}>
              <img src={user.avatar} className="w-full h-full object-cover rounded-[2.1rem]" alt="" />
            </div>
            {user.online && <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-black bg-green-500 shadow-lg"></div>}
          </div>

          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-1">
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">{user.name}</h3>
              {isOwner && <span className="owner-badge scale-90">OWNER</span>}
            </div>
            <p className="text-red-500 font-black text-[10px] uppercase tracking-[0.4em]">@{user.username}</p>
          </div>

          <div className="w-full grid grid-cols-2 gap-4 mb-8">
             <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">Role</span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{profile?.role || 'Agent'}</span>
             </div>
             <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest block mb-1">XP</span>
                <span className="text-[11px] font-black text-white uppercase tracking-widest">{profile?.experience || '1+ Year'}</span>
             </div>
          </div>

          <div className="w-full bg-white/5 rounded-[2rem] p-6 border border-white/5 mb-10">
             <span className="text-[8px] font-black text-red-500 uppercase tracking-widest block mb-2">Neural Brief</span>
             <p className="text-[12px] text-gray-400 font-medium leading-relaxed">
                {profile?.bio || "No secure transmission found for this agent's history."}
             </p>
          </div>

          <button onClick={(e) => { e.preventDefault(); onMessage(); onClose(); }} className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl transition-all shadow-xl active:scale-95">
            Establish Comms
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
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<Profile>({ role: 'Client', profession: '', experience: '1 Year', bio: '' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSignedIn && clerkUser) {
      const userRef = ref(db, `users/${clerkUser.id}`);
      onValue(userRef, (snap) => {
        const data = snap.val();
        if (data && !data.profile) {
          setShowSetup(true);
        }
      });
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

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const unsubscribe = onChildAdded(query(ref(db, chatPath), limitToLast(50)), (snap) => {
      setMessages(prev => prev.some(m => m.id === snap.key) ? prev : [...prev, { ...snap.val() as Message, id: snap.key }]);
    });
    return () => unsubscribe();
  }, [chatPath]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clerkUser) return;
    await update(ref(db, `users/${clerkUser.id}/profile`), setupData);
    setShowSetup(false);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser) return;

    const newMessage = {
      senderId: clerkUser.id,
      senderName: clerkUser.fullName || clerkUser.username || 'Legend',
      senderAvatar: clerkUser.imageUrl,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };
    setInputValue('');
    await push(ref(db, chatPath), newMessage);
  };

  const filteredUsers = useMemo(() => {
    const s = searchTerm.toLowerCase();
    return users.filter(u => u.id !== clerkUser?.id && (u.name.toLowerCase().includes(s) || u.username.toLowerCase().includes(s)));
  }, [users, searchTerm, clerkUser]);

  return (
    <section id="community" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <AnimatePresence>
        {viewingProfile && <UserProfilePopup user={viewingProfile} onClose={() => setViewingProfile(null)} onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); }} />}
        
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl">
             <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600"></div>
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Neural Synchronization</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-10">Configure your agent identity in the zone</p>
                
                <form onSubmit={handleSetup} className="space-y-6">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Role</label>
                         <select onChange={e => setSetupData({...setupData, role: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white">
                            <option value="Client">Client</option>
                            <option value="Designer">Designer</option>
                            <option value="Editor">Editor</option>
                         </select>
                      </div>
                      <div>
                         <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">XP</label>
                         <input required placeholder="e.g. 3 Years" onChange={e => setSetupData({...setupData, experience: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white" />
                      </div>
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Profession</label>
                      <input required placeholder="e.g. Content Creator, Brand Owner" onChange={e => setSetupData({...setupData, profession: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Bio Transmission</label>
                      <textarea required rows={3} onChange={e => setSetupData({...setupData, bio: e.target.value})} placeholder="What defines your presence in the zone?" className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white resize-none" />
                   </div>
                   <button type="submit" className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-xl transition-all hover:bg-red-700 active:scale-95">Verify Identity</button>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Community Hub</span>
          <h2 className="text-white text-4xl md:text-5xl font-black uppercase tracking-tighter">Neural Network</h2>
          <div className="h-1 w-20 bg-red-600 mx-auto mt-6 rounded-full shadow-[0_0_20px_rgba(255,0,0,0.5)]"></div>
        </div>

        <div className="w-full bg-[#080808] border border-white/5 rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-[800px]">
          {/* SIDEBAR */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50">
            <button onClick={(e) => { e.preventDefault(); setIsGlobal(true); setSelectedUser(null); }} className={`flex items-center gap-4 p-8 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-xl' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className={`text-[12px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Public Hub</p>
                <p className="text-[9px] text-gray-600 font-black uppercase">Sync Stream</p>
              </div>
            </button>

            <div className="p-8">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Agent Scan..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-black text-white uppercase tracking-widest focus:border-red-600 outline-none" />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
              {filteredUsers.map(u => (
                <button key={u.id} onClick={(e) => { e.preventDefault(); setViewingProfile(u); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-blue-600/10 border-blue-600/20' : 'hover:bg-white/5'}`}>
                  <div className="relative">
                    <img src={u.avatar} className={`w-12 h-12 rounded-2xl border ${u.username === OWNER_USERNAME ? 'border-red-600 shadow-lg' : 'border-white/10'} object-cover`} alt="" />
                    {u.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-black bg-green-500"></div>}
                  </div>
                  <div className="text-left min-w-0">
                    <p className="text-[11px] font-black text-white uppercase tracking-widest truncate flex items-center gap-1">{u.name} {u.username === OWNER_USERNAME && <span className="owner-badge scale-[0.6] origin-left">OWNER</span>}</p>
                    <p className="text-[9px] text-red-500 font-bold uppercase">@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* CHAT */}
          <div className="flex-1 flex flex-col bg-black">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-xl">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30">
                    {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-500" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover rounded-2xl" />}
                  </div>
                  <div>
                    <h4 className="text-[16px] font-black text-white uppercase tracking-widest">{isGlobal ? 'Global Transmission' : selectedUser?.name}</h4>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.2em]">{isGlobal ? 'Protocol: Multi-Signal' : `@${selectedUser?.username}`}</p>
                  </div>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-2 custom-scrollbar">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-4 mb-4 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'}`}>
                   <img src={msg.senderAvatar} className="w-10 h-10 rounded-xl border border-white/5 object-cover" alt="" />
                   <div className={`max-w-[70%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                      <span className="text-[9px] font-black text-gray-600 uppercase mb-1">{msg.senderName}</span>
                      <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium border ${msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none'}`}>{msg.text}</div>
                   </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-8 bg-black border-t border-white/5">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-2">
                  <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Transmit to Hub..." className="flex-1 bg-transparent px-6 py-4 text-sm font-bold text-white outline-none" />
                  <button type="submit" disabled={!inputValue.trim()} className="bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white w-14 h-14 flex items-center justify-center rounded-xl transition-all active:scale-95 shadow-xl"><SendIcon className="w-5 h-5" /></button>
                </form>
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