import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, update, get, remove, runTransaction, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, ChatBubbleIcon, VolumeOffIcon, VolumeOnIcon, EyeIcon, HandThumbUpIcon, ChevronRightIcon, SearchIcon, ChevronLeftIcon, GalleryIcon, PhotoManipulationIcon } from './Icons';
import { ProfileModal } from './ProfileModal';
import { siteConfig } from '../config';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

interface Profile {
  role: 'Client' | 'Designer' | 'Editor';
  profession: string;
  experience: string;
  bio: string;
  chatPassword?: string;
  rating?: { average: number; count: number };
  hideSocialStats?: boolean;
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

const AgentProfileModal: React.FC<{ 
  user: ChatUser; 
  currentUser: any; 
  onClose: () => void; 
  onMessage: () => void;
  onShowFullProfile?: (id: string) => void;
}> = ({ user, currentUser, onClose, onMessage, onShowFullProfile }) => {
  const isOwner = user.username === OWNER_HANDLE;
  const isAdmin = user.username === ADMIN_HANDLE;
  const [socialState, setSocialState] = useState({ isFollowing: false, friendStatus: 'none' });
  
  useEffect(() => {
    if (!user) return;
    document.title = `${user.name} (@${user.username}) | Fuad Editing Zone`;
    document.body.style.overflow = 'hidden';
    return () => {
        document.title = siteConfig.seo.title;
        document.body.style.overflow = 'unset';
    };
  }, [user]);

  useEffect(() => {
    if (!currentUser) return;
    const followRef = ref(db, `social/${currentUser.id}/following/${user.id}`);
    const friendRef = ref(db, `social/${currentUser.id}/friends/${user.id}`);
    const reqSentRef = ref(db, `social/${currentUser.id}/requests/sent/${user.id}`);
    const reqRecRef = ref(db, `social/${user.id}/requests/sent/${currentUser.id}`);

    onValue(followRef, (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
    onValue(friendRef, (snap) => {
        if (snap.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'accepted' }));
        else {
            onValue(reqSentRef, (s1) => {
                if (s1.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'requested' }));
                else {
                    onValue(reqRecRef, (s2) => {
                        if (s2.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'pending' }));
                        else setSocialState(prev => ({ ...prev, friendStatus: 'none' }));
                    });
                }
            });
        }
    });
  }, [currentUser, user.id]);

  const handleFollow = async () => {
      if (!currentUser) return;
      const path = `social/${currentUser.id}/following/${user.id}`;
      if (socialState.isFollowing) {
          await remove(ref(db, path));
          await remove(ref(db, `social/${user.id}/followers/${currentUser.id}`));
      } else {
          await set(ref(db, path), true);
          await set(ref(db, `social/${user.id}/followers/${currentUser.id}`), true);
      }
  };

  const handleFriendAction = async () => {
      if (!currentUser) return;
      if (socialState.friendStatus === 'none') {
          await set(ref(db, `social/${currentUser.id}/requests/sent/${user.id}`), { timestamp: Date.now() });
          await set(ref(db, `social/${user.id}/requests/received/${currentUser.id}`), { timestamp: Date.now() });
      } else if (socialState.friendStatus === 'pending') {
          await remove(ref(db, `social/${currentUser.id}/requests/received/${user.id}`));
          await remove(ref(db, `social/${user.id}/requests/sent/${currentUser.id}`));
          // FIX: targetUser was not defined; using user.id from the props instead.
          await set(ref(db, `social/${currentUser.id}/friends/${user.id}`), true);
          await set(ref(db, `social/${user.id}/friends/${currentUser.id}`), true);
          await set(ref(db, `social/${currentUser.id}/following/${user.id}`), true);
          await set(ref(db, `social/${user.id}/followers/${currentUser.id}`), true);
          await set(ref(db, `social/${user.id}/following/${currentUser.id}`), true);
          await set(ref(db, `social/${currentUser.id}/followers/${user.id}`), true);
      }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[450px] bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 flex flex-col items-center shadow-2xl max-h-[90dvh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
        <div className="relative mb-6 flex-shrink-0 cursor-pointer" onClick={() => onShowFullProfile?.(user.id)}>
            <img src={user.avatar} className={`w-32 h-32 rounded-[3rem] border-4 p-1 ${isOwner ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.5)]' : isAdmin ? 'border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'border-white/10'} object-cover`} alt="" />
            {isOwner && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase">Owner</span>}
        </div>
        <div className="text-center w-full mb-8 flex-shrink-0">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-1 cursor-pointer" onClick={() => onShowFullProfile?.(user.id)}>{user.name}</h2>
            <p className={`font-black uppercase text-[10px] tracking-[0.3em] ${isOwner ? 'text-red-500' : 'text-zinc-500'}`}>@{user.username}</p>
        </div>
        
        <div className="w-full space-y-4 mb-10 flex-shrink-0">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                <p className="text-[12px] text-zinc-400 italic">"{user.profile?.bio || 'No status signal.'}"</p>
            </div>
            <div className="flex gap-3">
                <button onClick={handleFollow} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl hover:bg-red-700'}`}>
                    {socialState.isFollowing ? 'Unfollow' : 'Follow'}
                </button>
                <button onClick={handleFriendAction} className="flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white">
                    {socialState.friendStatus === 'accepted' ? 'Linked' : socialState.friendStatus === 'pending' ? 'Accept' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}
                </button>
            </div>
        </div>
        <div className="flex flex-col gap-2 w-full">
            <button onClick={() => { onMessage(); onClose(); }} className="w-full py-5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-2xl transition-all">Message</button>
            <button onClick={() => { onShowFullProfile?.(user.id); onClose(); }} className="w-full py-4 bg-white/5 text-zinc-500 hover:text-white font-black uppercase tracking-[0.2em] text-[9px] rounded-xl transition-all">View Profile</button>
        </div>
      </div>
    </motion.div>
  );
};

export const CommunityChat: React.FC<{ isModalMode?: boolean; initialTargetUserId?: string | null; onShowProfile?: (id: string, tab?: any, openUpload?: boolean) => void }> = ({ isModalMode, initialTargetUserId, onShowProfile }) => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [viewingProfile, setViewingProfile] = useState<ChatUser | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    onValue(ref(db, 'users'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
          const list = Object.values(data) as ChatUser[];
          setUsers(list);
          if(initialTargetUserId) {
              const target = list.find(u => u.id === initialTargetUserId || u.username === initialTargetUserId);
              if(target) {
                  setIsGlobal(false);
                  setSelectedUser(target);
                  setShowConversationOnMobile(true);
              }
          }
      }
    });
  }, [initialTargetUserId]);

  const chatPath = useMemo(() => {
    if (isGlobal) return 'community/global';
    if (!clerkUser?.id || !selectedUser?.id) return null;
    return `messages/${[clerkUser.id, selectedUser.id].sort().join('_')}`;
  }, [isGlobal, clerkUser?.id, selectedUser?.id]);

  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const chatQuery = query(ref(db, chatPath), limitToLast(60));
    return onChildAdded(chatQuery, (snap) => {
      setMessages(prev => [...prev, { ...snap.val() as Message, id: snap.key }]);
    });
  }, [chatPath]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatPath || !clerkUser) return;
    const newMessage = { senderId: clerkUser.id, senderName: clerkUser.fullName || clerkUser.username, senderAvatar: clerkUser.imageUrl, text: inputValue.trim(), timestamp: Date.now() };
    setInputValue('');
    await push(ref(db, chatPath), newMessage);
  };

  return (
    <section id="community" className={`${isModalMode ? 'h-full w-full' : 'py-12 md:py-24 bg-black relative z-10 overflow-hidden'}`}>
      <AnimatePresence>
        {viewingProfile && <AgentProfileModal user={viewingProfile} currentUser={clerkUser} onClose={() => setViewingProfile(null)} onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); setShowConversationOnMobile(true); }} onShowFullProfile={(id) => onShowProfile?.(id)} />}
        {isSearchOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-10 flex flex-col max-h-[80dvh]">
                    <div className="flex justify-between items-center mb-8 flex-shrink-0">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Find Operator</h3>
                        <button onClick={() => setIsSearchOpen(false)} className="p-2 bg-white/5 rounded-full"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                    <div className="relative mb-8 flex-shrink-0">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                        <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Username Search..." className="w-full bg-black border border-white/10 rounded-2xl py-5 pl-14 text-white outline-none focus:border-red-600 transition-all shadow-inner" />
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar min-h-0">
                        {users.filter(u => u.username?.toLowerCase().includes(searchQuery.toLowerCase()) && u.id !== clerkUser?.id).map(u => (
                            <button key={u.id} onClick={() => { setViewingProfile(u); setIsSearchOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-red-600/30 transition-all text-left">
                                <img src={u.avatar} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                                <div><p className="text-[12px] font-black uppercase text-white tracking-widest">{u.name}</p><p className="text-[9px] font-bold text-zinc-600">@{u.username}</p></div>
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      <div className={`${isModalMode ? 'h-full px-0' : 'container mx-auto px-4 max-w-6xl h-[80dvh] md:h-[800px]'}`}>
        <div className="w-full bg-[#080808] border border-white/5 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full min-h-0">
          
          <div className={`w-full md:w-80 border-r border-white/5 flex flex-col bg-[#050505]/50 flex-shrink-0 min-h-0 ${showConversationOnMobile ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 md:p-8 border-b border-white/5 bg-black/30 flex items-center flex-shrink-0">
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Network Nodes</span>
            </div>
            
            <div className="p-4 space-y-2 border-b border-white/5 flex-shrink-0">
                <button onClick={() => { setIsGlobal(true); setSelectedUser(null); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all border ${isGlobal ? 'bg-red-600/10 border-red-600/20' : 'border-transparent hover:bg-white/5'}`}>
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border flex-shrink-0 ${isGlobal ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-500'}`}><GlobeAltIcon className="w-5 h-5" /></div>
                    <div className="text-left"><p className={`text-[11px] font-black uppercase tracking-widest ${isGlobal ? 'text-white' : 'text-zinc-500'}`}>Public Hub</p></div>
                </button>
                <button onClick={() => clerkUser && onShowProfile?.(clerkUser.id, 'posts', true)} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-white/5 transition-all group">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center border bg-white/5 text-zinc-500 flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-all"><PhotoManipulationIcon className="w-5 h-5" /></div>
                    <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-white transition-colors">Upload Post</p></div>
                </button>
                <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-white/5 transition-all">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center border bg-white/5 text-zinc-500 flex-shrink-0"><SearchIcon className="w-5 h-5" /></div>
                    <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Scan Operators</p></div>
                </button>
                <button onClick={() => clerkUser && onShowProfile?.(clerkUser.id, 'identity')} className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] hover:bg-white/5 transition-all">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center border bg-white/5 text-zinc-500 flex-shrink-0"><i className="fa-solid fa-gear text-lg"></i></div>
                    <div className="text-left"><p className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Settings</p></div>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar min-h-0">
              {users.filter(u => u.id !== clerkUser?.id).map(u => (
                <button key={u.id} onClick={() => { setIsGlobal(false); setSelectedUser(u); setShowConversationOnMobile(true); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all border ${selectedUser?.id === u.id && !isGlobal ? 'bg-red-600/10 border-red-600/20' : 'border-transparent hover:bg-white/5'}`}>
                  <img src={u.avatar} className={`w-11 h-11 rounded-xl border border-white/10 object-cover flex-shrink-0`} alt="" />
                  <div className="text-left flex-1 truncate">
                    <p className="text-[11px] font-black uppercase text-white truncate">{u.name}</p>
                    <p className={`text-[9px] font-bold text-zinc-600`}>@{u.username}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className={`flex-1 flex flex-col bg-black relative min-h-0 ${showConversationOnMobile ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-xl flex-shrink-0">
               <button onClick={() => setShowConversationOnMobile(false)} className="md:hidden p-2 text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
               <div className="w-12 h-12 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30 overflow-hidden flex-shrink-0">
                  {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-600" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover" />}
               </div>
               <div className="flex-1 truncate">
                  <h4 className="text-[14px] font-black text-white uppercase tracking-widest truncate">{isGlobal ? 'Global Hub' : selectedUser?.name}</h4>
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">{isGlobal ? 'Public' : `@${selectedUser?.username}`}</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-6 custom-scrollbar bg-black/20 min-h-0">
              {messages.map(msg => {
                const isOrder = msg.text.startsWith('[ORDER INQUIRY]');
                return (
                  <div key={msg.id} className={`flex gap-4 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                    <img src={msg.senderAvatar} className="w-10 h-10 rounded-xl border border-white/5 object-cover cursor-pointer flex-shrink-0 shadow-lg" alt="" onClick={() => onShowProfile?.(msg.senderId)} />
                    <div className={`max-w-[80%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                        <span className="text-[9px] font-black text-zinc-600 uppercase mb-2 px-1 truncate max-w-full">{msg.senderName}</span>
                        <div className={`p-4 rounded-[1.5rem] text-[13px] border whitespace-pre-wrap ${isOrder ? 'bg-red-600/20 border-red-600/50 text-white font-bold' : (msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-zinc-300 rounded-tl-none')}`} style={{ overflowWrap: 'anywhere' }}>{msg.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-10 border-t border-white/5 bg-black/40 flex-shrink-0">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex gap-3 bg-white/5 border border-white/10 rounded-[2rem] p-2">
                    <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Type a message..." className="flex-1 bg-transparent px-4 md:px-6 py-3 text-sm font-bold text-white outline-none min-w-0" />
                    <button type="submit" disabled={!inputValue.trim()} className="bg-red-600 text-white w-12 h-12 flex items-center justify-center rounded-2xl active:scale-90 transition-all shadow-2xl disabled:opacity-50 flex-shrink-0"><SendIcon className="w-5 h-5" /></button>
                </form>
              ) : <div className="text-center py-4"><SignInButton mode="modal"><button className="bg-red-600 text-white font-black py-4 px-12 rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl transition-all hover:bg-red-700 active:scale-95">Log in to Chat</button></SignInButton></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};