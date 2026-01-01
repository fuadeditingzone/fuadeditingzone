import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, update, get, remove, runTransaction, query, limitToLast, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, ChatBubbleIcon, VolumeOffIcon, VolumeOnIcon, EyeIcon, HandThumbUpIcon, ChevronRightIcon, SearchIcon, ChevronLeftIcon, GalleryIcon, PhotoManipulationIcon } from './Icons';
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

const getBadge = (username: string) => {
    if (username === OWNER_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-owner text-xs"></i>;
    if (username === ADMIN_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-admin text-xs"></i>;
    return null;
};

const AgentProfileModal: React.FC<{ 
  user: ChatUser; 
  currentUser: any; 
  onClose: () => void; 
  onMessage: () => void;
  onShowFullProfile?: (id: string) => void;
}> = ({ user, currentUser, onClose, onMessage, onShowFullProfile }) => {
  const isOwner = user.username === OWNER_HANDLE;
  const isAdmin = user.username === ADMIN_HANDLE;
  const [socialState, setSocialState] = useState({ isFollowing: false, friendStatus: 'none', followers: 0, following: 0 });
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  
  useEffect(() => {
    if (!user) return;
    const postsQuery = query(ref(db, 'explore_posts'), orderByChild('userId'), equalTo(user.id), limitToLast(3));
    onValue(postsQuery, (snap) => {
        const data = snap.val();
        setRecentPosts(data ? Object.values(data).reverse() : []);
    });

    onValue(ref(db, `social/${user.id}/followers`), s => setSocialState(p => ({...p, followers: s.exists() ? Object.keys(s.val()).length : 0})));
    onValue(ref(db, `social/${user.id}/following`), s => setSocialState(p => ({...p, following: s.exists() ? Object.keys(s.val()).length : 0})));
  }, [user.id]);

  useEffect(() => {
    if (!currentUser) return;
    onValue(ref(db, `social/${currentUser.id}/following/${user.id}`), (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
    onValue(ref(db, `social/${currentUser.id}/friends/${user.id}`), (snap) => {
        if (snap.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'accepted' }));
        else {
            onValue(ref(db, `social/${currentUser.id}/requests/sent/${user.id}`), (s1) => {
                if (s1.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'requested' }));
                else {
                    onValue(ref(db, `social/${currentUser.id}/requests/received/${user.id}`), (s2) => {
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
          await push(ref(db, `notifications/${user.id}`), {
              type: 'follow', fromId: currentUser.id, fromName: currentUser.username || currentUser.fullName, fromAvatar: currentUser.imageUrl, timestamp: Date.now(), read: false
          });
      }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-[380px] bg-[#0f0f0f] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl" onClick={e => e.stopPropagation()}>
        <div className="p-8 pb-6">
            <div className="flex items-center gap-5 mb-8">
                <div className={`w-16 h-16 rounded-full p-1 border-2 flex-shrink-0 cursor-pointer ${isOwner ? 'border-red-600 shadow-[0_0_15px_rgba(255,0,0,0.4)]' : isAdmin ? 'border-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'border-white/10'}`} onClick={() => onShowFullProfile?.(user.id)}>
                    <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="" />
                </div>
                <div className="min-w-0">
                    <h3 className="text-white font-black text-lg truncate flex items-center gap-1 cursor-pointer" onClick={() => onShowFullProfile?.(user.id)}>
                        {user.username} {getBadge(user.username)}
                    </h3>
                    <p className="text-zinc-500 text-xs font-bold truncate">@{user.username}</p>
                </div>
            </div>

            <div className="flex justify-between items-center mb-8 px-2">
                <div className="text-center"><p className="text-white font-black text-base">{recentPosts.length}</p><p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">posts</p></div>
                <div className="text-center"><p className="text-white font-black text-base">{socialState.followers}</p><p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">followers</p></div>
                <div className="text-center"><p className="text-white font-black text-base">{socialState.following}</p><p className="text-[8px] text-zinc-600 uppercase font-black tracking-widest">following</p></div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-8 rounded-2xl overflow-hidden">
                {recentPosts.length > 0 ? recentPosts.map((p, i) => (
                    <div key={i} className="aspect-square bg-black">
                        {p.mediaType === 'video' ? <video src={p.mediaUrl} className="w-full h-full object-cover" /> : <img src={p.mediaUrl} className="w-full h-full object-cover" alt="" />}
                    </div>
                )) : [...Array(3)].map((_, i) => <div key={i} className="aspect-square bg-white/5 animate-pulse" />)}
            </div>

            <div className="flex flex-col gap-2">
                <button onClick={() => { onMessage(); onClose(); }} className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-xl transition-all">Message</button>
                <button onClick={handleFollow} className={`w-full py-3.5 border font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl transition-all ${socialState.isFollowing ? 'bg-white/5 border-white/10 text-white' : 'bg-white text-black border-transparent'}`}>
                    {socialState.isFollowing ? 'Following' : 'Follow'}
                </button>
            </div>
        </div>
        <button onClick={() => { onShowFullProfile?.(user.id); onClose(); }} className="w-full py-4 bg-black/40 text-[9px] font-black uppercase tracking-widest text-zinc-500 border-t border-white/5 hover:text-white transition-colors">View Master Profile</button>
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
  const [sidebarSearchQuery, setSidebarSearchQuery] = useState('');
  const [showConversationOnMobile, setShowConversationOnMobile] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isFriend, setIsFriend] = useState(false);
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

  useEffect(() => {
    if (!isGlobal && clerkUser && selectedUser) {
        onValue(ref(db, `social/${clerkUser.id}/friends/${selectedUser.id}`), (snap) => {
            setIsFriend(snap.exists());
        });
    } else {
        setIsFriend(false);
    }
  }, [isGlobal, clerkUser, selectedUser]);

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

    if (!isGlobal && !isFriend) {
        const sentCount = messages.filter(m => m.senderId === clerkUser.id).length;
        if (sentCount >= 3) {
            alert("Security Protocol: Unfriend communication limited to 3 signals. Request connection via Profile.");
            return;
        }
    }

    const newMessage = { senderId: clerkUser.id, senderName: clerkUser.fullName || clerkUser.username, senderAvatar: clerkUser.imageUrl, text: inputValue.trim(), timestamp: Date.now() };
    setInputValue('');
    await push(ref(db, chatPath), newMessage);
  };

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => u.id !== clerkUser?.id)
      .filter(u => 
        u.name?.toLowerCase().includes(sidebarSearchQuery.toLowerCase()) || 
        u.username?.toLowerCase().includes(sidebarSearchQuery.toLowerCase())
      );
  }, [users, sidebarSearchQuery, clerkUser]);

  return (
    <section id="community" className={`flex-1 flex flex-col min-h-0 bg-black relative z-10 overflow-hidden ${isModalMode ? 'h-full' : 'pb-2 md:pb-6'}`}>
      <AnimatePresence>
        {viewingProfile && <AgentProfileModal user={viewingProfile} currentUser={clerkUser} onClose={() => setViewingProfile(null)} onMessage={() => { setIsGlobal(false); setSelectedUser(viewingProfile); setShowConversationOnMobile(true); }} onShowFullProfile={(id) => onShowProfile?.(id)} />}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col min-h-0 ${isModalMode ? 'h-full px-0' : 'container mx-auto px-2 md:px-4 max-w-6xl'}`}>
        <div className="flex-1 flex flex-col md:flex-row bg-[#080808] border border-white/5 rounded-[1.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl min-h-0">
          
          <div className={`w-full md:w-72 border-r border-white/5 flex flex-col bg-[#050505]/50 flex-shrink-0 min-h-0 ${showConversationOnMobile ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 md:p-6 border-b border-white/5 bg-black/30 flex items-center flex-shrink-0">
               <span className="text-[9px] font-black text-white uppercase tracking-widest">Network Terminal</span>
            </div>
            
            {/* Search Input & Controls */}
            <div className="p-3 space-y-3 border-b border-white/5 flex-shrink-0">
                <div className="flex gap-1.5">
                    <button onClick={() => { setIsGlobal(true); setSelectedUser(null); setShowConversationOnMobile(true); }} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-[1.2rem] transition-all border ${isGlobal ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'border-transparent hover:bg-white/5 text-zinc-500'}`}>
                        <GlobeAltIcon className="w-4 h-4" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Global</span>
                    </button>
                    <button onClick={() => clerkUser && onShowProfile?.(clerkUser.id)} className="flex-1 flex items-center justify-center gap-2 p-3 rounded-[1.2rem] hover:bg-white/5 transition-all text-zinc-500 group">
                        <UserCircleIcon className="w-4 h-4 group-hover:text-red-500 transition-colors" />
                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-white transition-colors">Profile</span>
                    </button>
                </div>
                
                {/* Community Real-time Search */}
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 w-3.5 h-3.5" />
                    <input 
                      value={sidebarSearchQuery} 
                      onChange={e => setSidebarSearchQuery(e.target.value)} 
                      placeholder="Search Network Profiles..." 
                      className="poppins-font w-full bg-black/60 border border-white/5 rounded-[1.2rem] py-2.5 pl-10 pr-4 text-white text-[10px] outline-none focus:border-red-600/50 transition-all shadow-inner placeholder-zinc-700" 
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar min-h-0">
              {filteredUsers.length === 0 ? (
                <div className="py-12 text-center opacity-10">
                   <p className="text-[8px] font-black uppercase tracking-widest">No Signals Detected</p>
                </div>
              ) : (
                filteredUsers.map(u => (
                  <button key={u.id} onClick={() => { setIsGlobal(false); setSelectedUser(u); setShowConversationOnMobile(true); }} className={`w-full flex items-center gap-3 p-3 rounded-[1.2rem] transition-all border ${selectedUser?.id === u.id && !isGlobal ? 'bg-red-600/10 border-red-600/20' : 'border-transparent hover:bg-white/5'}`}>
                    <img src={u.avatar} className={`w-9 h-9 rounded-xl border object-cover flex-shrink-0 ${u.username === OWNER_HANDLE ? 'border-red-600 shadow-[0_0_8px_rgba(255,0,0,0.4)]' : u.username === ADMIN_HANDLE ? 'border-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.4)]' : 'border-white/10'}`} alt="" />
                    <div className="text-left flex-1 truncate">
                      <div className="flex items-center">
                          <p className="text-[10px] font-black uppercase text-white truncate">{u.name}</p>
                          {getBadge(u.username)}
                      </div>
                      <p className={`text-[8px] font-bold text-zinc-600`}>@{u.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className={`flex-1 flex flex-col bg-black relative min-h-0 ${showConversationOnMobile ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-4 md:p-6 border-b border-white/5 flex items-center gap-3 bg-black/40 backdrop-blur-xl flex-shrink-0">
               <button onClick={() => setShowConversationOnMobile(false)} className="md:hidden p-1.5 text-white bg-white/5 rounded-full"><ChevronLeftIcon className="w-5 h-5" /></button>
               <div className={`w-10 h-10 rounded-xl bg-red-600/15 flex items-center justify-center border overflow-hidden flex-shrink-0 ${!isGlobal && selectedUser?.username === OWNER_HANDLE ? 'border-red-600' : !isGlobal && selectedUser?.username === ADMIN_HANDLE ? 'border-blue-600' : 'border-white/10'}`}>
                  {isGlobal ? <GlobeAltIcon className="w-5 h-5 text-red-600" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover cursor-pointer" onClick={() => onShowProfile?.(selectedUser!.id)} alt="" />}
               </div>
               <div className="flex-1 truncate">
                  <h4 className="text-[12px] font-black text-white uppercase tracking-widest truncate flex items-center">
                    {isGlobal ? 'Global Sync' : selectedUser?.name}
                    {!isGlobal && getBadge(selectedUser!.username)}
                  </h4>
                  <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest">{isGlobal ? 'Public Frequency' : `@${selectedUser?.username}`}</p>
               </div>
               {!isGlobal && (
                 <div className="ml-auto flex items-center">
                    <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-full border ${isFriend ? 'border-green-600/30 text-green-500 bg-green-600/5' : 'border-yellow-600/30 text-yellow-500 bg-yellow-600/5'}`}>
                        {isFriend ? 'Connected' : 'Sync Request'}
                    </span>
                 </div>
               )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-5 custom-scrollbar bg-black/20 min-h-0">
              {messages.map(msg => {
                const isOrder = msg.text.startsWith('[ORDER INQUIRY]');
                return (
                  <div key={msg.id} className={`flex gap-3 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                    <img src={msg.senderAvatar} className={`w-8 h-8 rounded-lg border object-cover cursor-pointer flex-shrink-0 shadow-lg ${msg.senderName.includes(OWNER_HANDLE) ? 'border-red-600' : msg.senderName.includes(ADMIN_HANDLE) ? 'border-blue-600' : 'border-white/5'}`} alt="" onClick={() => onShowProfile?.(msg.senderId)} />
                    <div className={`max-w-[85%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                        <span className="text-[8px] font-black text-zinc-600 uppercase mb-1.5 px-1 truncate max-w-full flex items-center">
                            {msg.senderName}
                            {getBadge(msg.senderName)}
                        </span>
                        {/* Strictly clamp descriptions to 2 lines as requested */}
                        <div className={`clamp-2 p-3 md:p-4 rounded-[1.2rem] text-[12px] md:text-[13px] border whitespace-pre-wrap ${isOrder ? 'bg-red-600/20 border-red-600/50 text-white font-bold' : (msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-zinc-300 rounded-tl-none')}`} style={{ overflowWrap: 'anywhere' }}>{msg.text}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-6 border-t border-white/5 bg-black/40 flex-shrink-0">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex flex-col gap-2">
                    <div className="flex gap-2 bg-white/5 border border-white/10 rounded-[1.8rem] p-1.5">
                        <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Send signal..." className="flex-1 bg-transparent px-4 py-2 text-sm font-bold text-white outline-none min-w-0 poppins-font" />
                        <button type="submit" disabled={!inputValue.trim()} className="bg-red-600 text-white w-10 h-10 flex items-center justify-center rounded-2xl active:scale-90 transition-all shadow-2xl disabled:opacity-50 flex-shrink-0"><SendIcon className="w-4 h-4" /></button>
                    </div>
                    {!isGlobal && !isFriend && (
                        <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest text-center px-4">
                           Link Protocol: {Math.max(0, 3 - messages.filter(m => m.senderId === clerkUser?.id).length)} credits remaining.
                        </p>
                    )}
                </form>
              ) : <div className="text-center py-2"><SignInButton mode="modal"><button className="bg-red-600 text-white font-black py-3 px-10 rounded-2xl uppercase text-[9px] tracking-widest shadow-2xl transition-all hover:bg-red-700 active:scale-95">Initiate Sync</button></SignInButton></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};