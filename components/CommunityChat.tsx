
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, update, get, remove, runTransaction, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { SparklesIcon, SendIcon, UserCircleIcon, GlobeAltIcon, CheckCircleIcon, CloseIcon, ChatBubbleIcon, VolumeOffIcon, VolumeOnIcon, EyeIcon, HandThumbUpIcon, ChevronRightIcon, SearchIcon } from './Icons';

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

interface RatingStats {
    average: number;
    count: number;
}

interface Profile {
  role: 'Client' | 'Designer' | 'Editor';
  profession: string;
  experience: string;
  bio: string;
  chatPassword?: string;
  rating?: RatingStats;
  hideSocialStats?: boolean;
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

const IMDbRating: React.FC<{ rating: number; count: number; onRate?: (val: number) => void }> = ({ rating, count, onRate }) => {
    const displayRating = rating > 0 ? rating.toFixed(1) : "0.0";
    return (
        <div className="flex flex-col items-center gap-1.5 py-4 px-6 bg-white/5 rounded-3xl border border-white/5 shadow-inner">
            <div className="flex items-center gap-3">
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            disabled={!onRate}
                            onClick={() => onRate?.(star)}
                            className={`transition-all duration-300 ${star <= Math.round(rating) ? 'text-yellow-500 scale-110 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : 'text-gray-700 opacity-40'} ${onRate ? 'hover:scale-125 hover:text-yellow-400 cursor-pointer' : 'cursor-default'}`}
                        >
                            <i className={`${star <= Math.round(rating) ? 'fa-solid' : 'fa-regular'} fa-star text-[14px]`}></i>
                        </button>
                    ))}
                </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-white font-black text-lg tracking-tighter">{displayRating}<span className="text-gray-500 text-xs ml-0.5">/5.0</span></span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="w-1 h-1 bg-red-600 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{count.toLocaleString()} Global Verified Ratings</span>
            </div>
        </div>
    );
};

const SocialListViewer: React.FC<{ 
    title: string; 
    ids: string[]; 
    users: ChatUser[]; 
    onClose: () => void; 
    onSelectUser: (user: ChatUser) => void;
}> = ({ title, ids, users, onClose, onSelectUser }) => {
    const listUsers = useMemo(() => users.filter(u => ids.includes(u.id)), [ids, users]);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100000] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] p-6 md:p-8 flex flex-col max-h-[80vh] shadow-2xl overflow-hidden">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h3 className="text-xl font-black text-white uppercase tracking-widest truncate pr-4">{title}</h3>
                    <button onClick={onClose} className="p-2 bg-white/5 rounded-full hover:bg-red-600 transition-colors"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0 pr-1">
                    {listUsers.length === 0 ? (
                        <div className="text-center py-10 opacity-20"><p className="text-[10px] uppercase font-black tracking-widest">No matching agents found</p></div>
                    ) : listUsers.map(u => (
                        <button key={u.id} onClick={() => { onSelectUser(u); onClose(); }} className="w-full flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-red-600/30 transition-all text-left">
                            <img src={u.avatar} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" alt="" />
                            <div className="min-w-0 flex-1">
                                <p className="text-[11px] font-black uppercase text-white tracking-widest truncate">{u.name}</p>
                                <p className="text-[9px] font-bold text-gray-600 truncate">@{u.username}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

const AgentProfileModal: React.FC<{ 
  user: ChatUser; 
  currentUser: any; 
  onClose: () => void; 
  onMessage: () => void; 
  isBlocked: boolean; 
  isMuted: boolean; 
  onToggleBlock: () => void; 
  onToggleMute: () => void;
  onOpenList: (type: 'followers' | 'following' | 'friends') => void;
}> = ({ user, currentUser, onClose, onMessage, isBlocked, isMuted, onToggleBlock, onToggleMute, onOpenList }) => {
  const isOwner = user.username === OWNER_HANDLE;
  const isAdmin = user.username === ADMIN_HANDLE;
  const isImmune = isOwner || isAdmin;
  const [socialState, setSocialState] = useState({ 
    isFollowing: false, 
    friendStatus: 'none', 
    stats: { followers: 0, following: 0, friends: 0 } 
  });
  
  useEffect(() => {
    if (!currentUser) return;
    const followRef = ref(db, `social/${currentUser.id}/following/${user.id}`);
    const friendRef = ref(db, `social/${currentUser.id}/friends/${user.id}`);
    const reqSentRef = ref(db, `social/${currentUser.id}/requests/sent/${user.id}`);
    const reqRecRef = ref(db, `social/${currentUser.id}/requests/received/${user.id}`);
    
    const followersRef = ref(db, `social/${user.id}/followers`);
    const followingRef = ref(db, `social/${user.id}/following`);
    const friendsRef = ref(db, `social/${user.id}/friends`);

    onValue(followRef, (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
    
    const unsubFriends = onValue(friendRef, (snap) => {
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
    
    const unsubFCount = onValue(followersRef, (snap) => setSocialState(prev => ({ ...prev, stats: { ...prev.stats, followers: snap.exists() ? Object.keys(snap.val()).length : 0 } })));
    const unsubFgCount = onValue(followingRef, (snap) => setSocialState(prev => ({ ...prev, stats: { ...prev.stats, following: snap.exists() ? Object.keys(snap.val()).length : 0 } })));
    const unsubFrCount = onValue(friendsRef, (snap) => setSocialState(prev => ({ ...prev, stats: { ...prev.stats, friends: snap.exists() ? Object.keys(snap.val()).length : 0 } })));

    return () => { unsubFriends(); unsubFCount(); unsubFgCount(); unsubFrCount(); };
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
              type: 'follow',
              fromId: currentUser.id,
              fromName: currentUser.fullName || currentUser.username,
              fromAvatar: currentUser.imageUrl,
              timestamp: Date.now(),
              read: false
          });
      }
  };

  const handleFriendAction = async () => {
      if (!currentUser) return;
      if (socialState.friendStatus === 'none') {
          await set(ref(db, `social/${currentUser.id}/requests/sent/${user.id}`), true);
          await set(ref(db, `social/${user.id}/requests/received/${currentUser.id}`), true);
          await push(ref(db, `notifications/${user.id}`), {
              type: 'friend_request',
              fromId: currentUser.id,
              fromName: currentUser.fullName || currentUser.username,
              fromAvatar: currentUser.imageUrl,
              timestamp: Date.now(),
              read: false
          });
      } else if (socialState.friendStatus === 'pending') {
          await remove(ref(db, `social/${currentUser.id}/requests/received/${user.id}`));
          await remove(ref(db, `social/${user.id}/requests/sent/${currentUser.id}`));
          await set(ref(db, `social/${currentUser.id}/friends/${user.id}`), true);
          await set(ref(db, `social/${user.id}/friends/${currentUser.id}`), true);
          await push(ref(db, `notifications/${user.id}`), {
              type: 'request_accepted',
              fromId: currentUser.id,
              fromName: currentUser.fullName || currentUser.username,
              fromAvatar: currentUser.imageUrl,
              timestamp: Date.now(),
              read: false
          });
      } else if (socialState.friendStatus === 'requested') {
          await remove(ref(db, `social/${currentUser.id}/requests/sent/${user.id}`));
          await remove(ref(db, `social/${user.id}/requests/received/${currentUser.id}`));
      }
  };

  const handleRate = async (val: number) => {
      if (!currentUser) return;
      const ratingRef = ref(db, `ratings/${user.id}/${currentUser.id}`);
      await set(ratingRef, val);
      
      const allRatingsRef = ref(db, `ratings/${user.id}`);
      const snap = await get(allRatingsRef);
      if (snap.exists()) {
          const ratings = Object.values(snap.val()) as number[];
          const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          await update(ref(db, `users/${user.id}/profile/rating`), { average: avg, count: ratings.length });
      }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-6 overflow-y-auto" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 40 }} className="relative w-full max-w-[500px] bg-[#0a0a0a] border border-white/10 rounded-[3rem] shadow-[0_50px_150px_rgba(0,0,0,1)] overflow-hidden flex flex-col my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center min-h-0">
            <div className="relative mb-6 flex-shrink-0">
                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[3rem] overflow-hidden border-4 ${isOwner ? 'border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.4)]' : isAdmin ? 'border-blue-600 shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'border-white/10'} p-1 bg-black`}>
                    <img src={user.avatar} className="w-full h-full object-cover rounded-[2.4rem]" alt="" />
                </div>
                {isOwner && <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] px-3 py-1 rounded-full font-black tracking-widest shadow-lg">OWNER</span>}
            </div>

            <div className="text-center mb-6 flex-shrink-0 w-full px-2">
                <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter mb-4 break-words">{user.name}</h2>
                <div className="mb-8">
                    <IMDbRating rating={user.profile?.rating?.average || 0} count={user.profile?.rating?.count || 0} onRate={currentUser?.id !== user.id ? handleRate : undefined} />
                </div>

                {!user.profile?.hideSocialStats && (
                    <div className="flex gap-3 md:gap-6 mb-8 justify-center bg-white/5 p-4 rounded-3xl border border-white/5">
                        <button onClick={() => onOpenList('followers')} className="text-center group flex-1"><p className="text-white font-black text-lg group-hover:text-red-500 transition-colors">{socialState.stats.followers}</p><p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Followers</p></button>
                        <div className="w-px h-8 bg-white/10 self-center"></div>
                        <button onClick={() => onOpenList('following')} className="text-center group flex-1"><p className="text-white font-black text-lg group-hover:text-red-500 transition-colors">{socialState.stats.following}</p><p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Following</p></button>
                        <div className="w-px h-8 bg-white/10 self-center"></div>
                        <button onClick={() => onOpenList('friends')} className="text-center group flex-1"><p className="text-white font-black text-lg group-hover:text-red-500 transition-colors">{socialState.stats.friends}</p><p className="text-[8px] text-gray-500 uppercase font-black tracking-widest">Handshakes</p></button>
                    </div>
                )}

                {currentUser?.id !== user.id && !isBlocked && (
                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full max-w-xs mx-auto">
                        <button onClick={handleFollow} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl hover:bg-red-700'}`}>
                            {socialState.isFollowing ? 'Unsync Grid' : 'Sync Grid'}
                        </button>
                        <button onClick={handleFriendAction} className={`flex-1 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest bg-white/5 border border-white/10 hover:bg-white/10 text-white`}>
                            {socialState.friendStatus === 'accepted' ? 'Linked' : socialState.friendStatus === 'pending' ? 'Accept Signal' : socialState.friendStatus === 'requested' ? 'Pending Revoke' : 'Neural Handshake'}
                        </button>
                    </div>
                )}
            </div>

            <div className="w-full space-y-4 mb-8">
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/5">
                    <h4 className="text-red-600 font-black text-[9px] uppercase tracking-[0.3em] mb-3">Transmission Bio</h4>
                    <p className="text-[12px] text-gray-300 font-medium leading-relaxed italic" style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>
                        "{user.profile?.bio || 'No public identity record synchronized.'}"
                    </p>
                </div>

                {currentUser?.id !== user.id && !isImmune && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button onClick={onToggleBlock} className={`py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest border transition-all ${isBlocked ? 'bg-red-600 text-white border-red-500 shadow-xl' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-red-600/10 hover:text-red-500'}`}>
                           {isBlocked ? 'Restore Signal' : 'Block Signal'}
                        </button>
                        {!isBlocked && (
                            <button onClick={onToggleMute} className={`py-4 rounded-2xl font-black uppercase text-[9px] tracking-widest border transition-all ${isMuted ? 'bg-blue-600 text-white border-blue-500 shadow-xl' : 'bg-white/5 text-gray-500 border-white/5 hover:bg-blue-600/10 hover:text-blue-500'}`}>
                               {isMuted ? 'Audio Resumed' : 'Audio Muted'}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {!isBlocked && (
                <button onClick={() => { onMessage(); onClose(); }} className="w-full py-6 bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-2xl transition-all active:scale-95 flex-shrink-0">
                    Initialize Transmission
                </button>
            )}
        </div>
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all active:scale-90"><CloseIcon className="w-6 h-6" /></button>
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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTab, setSearchTab] = useState<'all' | 'blocked'>('all');
  const [socialListView, setSocialListView] = useState<{ type: string; ids: string[] } | null>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [blockedIds, setBlockedIds] = useState<string[]>([]);
  const [mutedIds, setMutedIds] = useState<string[]>([]);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<Profile>({ role: 'Client', profession: '', experience: '', bio: '', chatPassword: '', hideSocialStats: false });
  const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
  const [profSearch, setProfSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSearchOpen || viewingProfile || socialListView) document.body.style.overflow = 'hidden';
    else if (!isModalMode) document.body.style.overflow = 'unset';
  }, [isSearchOpen, viewingProfile, socialListView, isModalMode]);

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
      onValue(userRef, (snap) => { if (!snap.val()?.profile) setShowSetup(true); });
      update(userRef, { online: true, name: clerkUser.fullName || clerkUser.username, avatar: clerkUser.imageUrl, username: clerkUser.username, id: clerkUser.id });
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
    const chatQuery = query(ref(db, chatPath), limitToLast(60));
    return onChildAdded(chatQuery, (snap) => {
      setMessages(prev => [...prev, { ...snap.val() as Message, id: snap.key }]);
    });
  }, [chatPath]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isUnlocked, isGlobal]);

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
    const newMessage = { senderId: clerkUser.id, senderName: clerkUser.fullName || clerkUser.username, senderAvatar: clerkUser.imageUrl, text: inputValue.trim(), timestamp: Date.now() };
    setInputValue('');
    await push(ref(db, chatPath), newMessage);

    if (!isGlobal && selectedUser) {
        const timestamp = Date.now();
        const recipientInboxRef = ref(db, `inbox/${selectedUser.id}/${clerkUser.id}`);
        runTransaction(recipientInboxRef, (currentData) => {
            if (currentData === null) return { timestamp, unreadCount: 1, lastMessage: newMessage.text };
            return { ...currentData, timestamp, unreadCount: (currentData.unreadCount || 0) + 1, lastMessage: newMessage.text };
        });
    }
  };

  const handleOpenSocialList = async (type: 'followers' | 'following' | 'friends', targetUserId: string) => {
      const socialRef = ref(db, `social/${targetUserId}/${type}`);
      const snap = await get(socialRef);
      if (snap.exists()) {
          const ids = Object.keys(snap.val());
          setSocialListView({ type: type.charAt(0).toUpperCase() + type.slice(1), ids });
      } else {
          setSocialListView({ type: type.charAt(0).toUpperCase() + type.slice(1), ids: [] });
      }
  };

  const inboxUsers = useMemo(() => {
    const list = users.filter(u => u.id !== clerkUser?.id && !blockedIds.includes(u.id));
    const sorted = [...list].sort((a,b) => {
        if (a.username === OWNER_HANDLE) return -1;
        if (b.username === OWNER_HANDLE) return 1;
        return 0;
    });
    return sorted;
  }, [users, clerkUser, blockedIds]);

  const searchResults = useMemo(() => {
      const sourceList = searchTab === 'all' ? users : users.filter(u => blockedIds.includes(u.id));
      const base = sourceList.filter(u => u.id !== clerkUser?.id);
      if (!searchQuery.trim()) return base;
      return base.filter(u => 
        (u.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
         u.name?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
  }, [searchQuery, users, clerkUser, searchTab, blockedIds]);

  const handleChatUnlock = () => {
    const myProfile = users.find(u => u.id === clerkUser?.id)?.profile;
    if (!myProfile?.chatPassword || unlockPassword === myProfile.chatPassword) {
        setIsUnlocked(true);
    } else {
        alert("Authorization Key Signal Failure.");
    }
  };

  useEffect(() => {
      setIsUnlocked(false);
      setUnlockPassword('');
  }, [selectedUser, isGlobal]);

  const needsUnlock = !!(!isGlobal && !isUnlocked && users.find(u => u.id === clerkUser?.id)?.profile?.chatPassword);

  return (
    <section id="community" className={`${isModalMode ? 'py-0 h-full w-full' : 'py-24 bg-black relative z-10 select-none overflow-hidden'}`}>
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
                onOpenList={(type) => handleOpenSocialList(type, viewingProfile.id)}
            />
        )}

        {socialListView && (
            <SocialListViewer title={socialListView.type} ids={socialListView.ids} users={users} onClose={() => setSocialListView(null)} onSelectUser={(u) => setViewingProfile(u)} />
        )}

        {isSearchOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
                <div className="w-full max-w-xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 flex flex-col max-h-[85vh] shadow-[0_40px_100px_rgba(0,0,0,1)] overflow-hidden">
                    <div className="flex justify-between items-center mb-6 flex-shrink-0">
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter truncate pr-4">Agent Identification</h3>
                        <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); setSearchTab('all'); }} className="p-2.5 bg-white/5 rounded-full hover:bg-white/10 transition-colors flex-shrink-0"><CloseIcon className="w-5 h-5 md:w-6 md:h-6 text-gray-400" /></button>
                    </div>

                    <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-2xl border border-white/5 flex-shrink-0">
                        <button onClick={() => setSearchTab('all')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchTab === 'all' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Grid Search</button>
                        <button onClick={() => setSearchTab('blocked')} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchTab === 'blocked' ? 'bg-red-600 text-white' : 'text-gray-500 hover:text-gray-300'}`}>Blacklist</button>
                    </div>

                    <div className="relative mb-6 flex-shrink-0">
                        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={searchTab === 'all' ? "Scan Agent ID..." : "Review Restricted Signals..."} className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-sm outline-none focus:border-red-600 transition-all" />
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 min-h-0 pr-1">
                        {searchResults.length === 0 ? (
                            <div className="text-center py-10 opacity-20"><p className="text-xs uppercase font-black tracking-widest">{searchTab === 'all' ? 'No matches found' : 'Blacklist clear'}</p></div>
                        ) : searchResults.map(u => (
                            <button key={u.id} onClick={() => { setViewingProfile(u); setIsSearchOpen(false); }} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-red-600/30 transition-all group text-left">
                                <img src={u.avatar} className="w-12 h-12 rounded-xl object-cover flex-shrink-0" alt="" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-black uppercase text-white tracking-widest truncate">{u.name}</p>
                                    <p className="text-[9px] font-bold text-gray-600 truncate">@{u.username}</p>
                                </div>
                                {searchTab === 'blocked' && <span className="text-[8px] font-black text-red-500 uppercase group-hover:underline flex-shrink-0 ml-2">Restore Link</span>}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        )}
        
        {showSetup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-[70000] flex items-center justify-center p-4 bg-black/98 backdrop-blur-3xl overflow-hidden">
             <div className="w-full max-w-lg bg-[#080808] border border-white/10 rounded-[3rem] p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[85vh] custom-scrollbar">
                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Record Init</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest mb-10">Synchronize your identity within the zone</p>
                <form onSubmit={async (e) => { e.preventDefault(); if (clerkUser) { await update(ref(db, `users/${clerkUser.id}/profile`), setupData); setShowSetup(false); } }} className="space-y-6">
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Identity Class</label>
                      <select value={setupData.role} onChange={e => setSetupData({...setupData, role: e.target.value as any})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none appearance-none">
                         <option value="Client">Client</option>
                         <option value="Designer">Designer</option>
                      </select>
                   </div>
                   {setupData.role !== 'Client' && (
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Experience (Cycles)</label>
                                <input type="text" value={setupData.experience} placeholder="e.g. 3" onChange={e => setSetupData({...setupData, experience: e.target.value.replace(/[^0-9]/g, '')})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none" />
                            </div>
                            <div className="relative">
                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Domain Specialty</label>
                                <input type="text" value={setupData.profession} onFocus={() => setIsProfDropdownOpen(true)} placeholder="Scan Specializations..." onChange={e => { setSetupData({...setupData, profession: e.target.value}); setProfSearch(e.target.value); }} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none" />
                                <AnimatePresence>
                                    {isProfDropdownOpen && (
                                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute left-0 right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-xl z-50 overflow-hidden shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                                            {RECOMMENDED_PROFESSIONS.filter(p => p.toLowerCase().includes(profSearch.toLowerCase())).map(p => (
                                                <button key={p} type="button" onClick={() => { setSetupData({...setupData, profession: p}); setIsProfDropdownOpen(false); }} className="w-full text-left px-5 py-3 text-xs text-gray-400 hover:bg-red-600 hover:text-white border-b border-white/5 last:border-0">{p}</button>
                                            ))}
                                            <button type="button" onClick={() => setIsProfDropdownOpen(false)} className="w-full text-center py-2 bg-black text-[8px] text-gray-500 uppercase font-black">Close Filter</button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                       </div>
                   )}
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Identity Bio</label>
                      <textarea required rows={3} value={setupData.bio} onChange={e => setSetupData({...setupData, bio: e.target.value})} placeholder="Broadcast your creative background..." className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white resize-none focus:border-red-600 outline-none" />
                   </div>
                   <div>
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 block ml-1">Vault Key (Optional)</label>
                      <input type="password" value={setupData.chatPassword} placeholder="Leave blank for public link" onChange={e => setSetupData({...setupData, chatPassword: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl py-4 px-6 text-sm text-white focus:border-red-600 outline-none" />
                   </div>
                   <button type="submit" className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.5em] text-[11px] rounded-2xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">Establish Identity</button>
                </form>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${isModalMode ? 'h-full max-w-full px-0' : 'container mx-auto px-4 md:px-6 max-w-6xl h-[85vh] md:h-[800px] my-6 md:my-0'}`}>
        <div className="w-full bg-[#080808] border border-white/5 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row h-full min-h-0">
          
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/5 flex flex-col bg-[#050505]/50 flex-shrink-0 min-h-0">
            <div className="p-6 md:p-8 border-b border-white/5 bg-black/30 flex-shrink-0">
               <span className="text-[10px] font-black text-white uppercase tracking-widest">Global Signals</span>
            </div>
            
            <div className="p-3 md:p-4 space-y-2 flex-shrink-0 border-b border-white/5">
                <button onClick={() => { setIsGlobal(true); setSelectedUser(null); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] md:rounded-[2.2rem] transition-all border ${isGlobal ? 'bg-red-600/10 border-red-600/20' : 'border-transparent hover:bg-white/5'}`}>
                    <div className={`w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center border flex-shrink-0 ${isGlobal ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                        <GlobeAltIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                        <p className={`text-[11px] font-black uppercase tracking-widest truncate ${isGlobal ? 'text-white' : 'text-gray-500'}`}>Public Grid</p>
                        <p className="text-[8px] text-gray-600 font-bold uppercase truncate">Sync Live</p>
                    </div>
                </button>

                <button onClick={() => setIsSearchOpen(true)} className="w-full flex items-center gap-4 p-4 rounded-[1.8rem] md:rounded-[2.2rem] transition-all border border-transparent hover:bg-white/5">
                    <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl flex items-center justify-center border bg-white/5 border-white/10 text-gray-500 flex-shrink-0">
                        <SearchIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                        <p className="text-[11px] font-black uppercase tracking-widest text-gray-500 truncate">Scan Agents</p>
                        <p className="text-[8px] text-gray-600 font-bold uppercase truncate">Find Signals</p>
                    </div>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 custom-scrollbar min-h-0 pr-2">
              {inboxUsers.map(u => (
                <button key={u.id} onClick={() => { setIsGlobal(false); setSelectedUser(u); }} className={`w-full flex items-center gap-4 p-4 rounded-[1.8rem] md:rounded-[2.2rem] transition-all border ${selectedUser?.id === u.id && !isGlobal ? 'bg-red-600/10 border-red-600/20' : 'border-transparent hover:bg-white/5'}`}>
                  <div className="relative flex-shrink-0">
                    <img src={u.avatar} className={`w-10 h-10 rounded-[1rem] border ${u.username === OWNER_HANDLE ? 'border-red-600' : u.username === ADMIN_HANDLE ? 'border-blue-600' : 'border-white/10'} object-cover`} alt="" />
                    {u.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black bg-green-500"></div>}
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

          <div className="flex-1 flex flex-col bg-black min-h-0 min-w-0 relative">
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center gap-4 bg-black/40 backdrop-blur-xl flex-shrink-0 z-10">
               <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-red-600/15 flex items-center justify-center border border-red-600/30 overflow-hidden flex-shrink-0">
                  {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-600" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover rounded-2xl cursor-pointer" onClick={() => selectedUser && setViewingProfile(selectedUser)} />}
               </div>
               <div className="min-w-0 flex-1">
                  <h4 className="text-[14px] md:text-[16px] font-black text-white uppercase tracking-widest truncate">{isGlobal ? 'Sector Grid' : selectedUser?.name}</h4>
                  <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest truncate">{isGlobal ? 'Active Satellite Link' : `@${selectedUser?.username}`}</p>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar scroll-smooth min-h-0 relative bg-black/20">
              {needsUnlock ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md z-[20] p-8 text-center">
                      <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mb-6 border border-red-600/30 shadow-2xl">
                          <i className="fa-solid fa-lock text-red-500 text-xl"></i>
                      </div>
                      <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mb-4">Channel Protected</h3>
                      <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-10 max-w-[200px]">Verification signature required to synchronize signal history</p>
                      <div className="w-full max-w-sm space-y-4">
                          <input type="password" value={unlockPassword} onChange={e => setUnlockPassword(e.target.value)} placeholder="Authorization Signature" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 md:py-5 px-6 text-white text-center outline-none focus:border-red-600 text-sm transition-all" />
                          <button onClick={handleChatUnlock} className="w-full py-4 md:py-5 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-xl active:scale-95 transition-all">Unlock Channel</button>
                      </div>
                  </div>
              ) : (
                  <>
                    {filteredMessages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-10 py-20">
                             <ChatBubbleIcon className="w-16 h-16 mb-4" />
                             <p className="text-[11px] font-black uppercase tracking-[0.3em]">No activity detected</p>
                        </div>
                    ) : (
                        filteredMessages.map(msg => (
                            <div key={msg.id} className={`flex gap-4 md:gap-5 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'} items-end min-w-0`}>
                            <img src={msg.senderAvatar} className="w-9 h-9 md:w-10 md:h-10 rounded-xl border border-white/5 object-cover cursor-pointer flex-shrink-0 shadow-lg active:scale-90" alt="" onClick={() => { const u = users.find(usr => usr.id === msg.senderId); if(u) setViewingProfile(u); }} />
                            <div className={`max-w-[85%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col min-w-0`}>
                                <span className="text-[9px] font-black text-gray-600 uppercase mb-2 truncate max-w-full px-1">{msg.senderName}</span>
                                <div className={`p-4 rounded-[1.5rem] text-[13px] font-medium border whitespace-pre-wrap ${msg.senderId === clerkUser?.id ? 'bg-red-600/10 border-red-600/30 text-white rounded-tr-none' : 'bg-white/5 border-white/10 text-gray-300 rounded-tl-none shadow-lg'}`} style={{ overflowWrap: 'anywhere', wordBreak: 'break-word' }}>{msg.text}</div>
                            </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} className="h-4 w-full flex-shrink-0" />
                  </>
              )}
            </div>

            <div className="p-6 md:p-10 border-t border-white/5 flex-shrink-0 bg-black/40 z-10">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className={`flex gap-3 bg-white/5 border border-white/10 rounded-[1.5rem] md:rounded-[2rem] p-1.5 md:p-2 transition-all shadow-inner ${needsUnlock ? 'opacity-20 pointer-events-none grayscale' : ''}`}>
                    <input value={inputValue} onChange={e => setInputValue(e.target.value)} disabled={needsUnlock} placeholder={isGlobal ? "Broadcast Signal..." : "Agent Synchronization..."} className="flex-1 bg-transparent px-4 md:px-6 py-3 md:py-4 text-sm font-bold text-white outline-none min-w-0" />
                    <button type="submit" disabled={!inputValue.trim() || needsUnlock} className="bg-red-600 text-white w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-xl md:rounded-2xl active:scale-90 transition-all shadow-2xl flex-shrink-0 disabled:opacity-50"><SendIcon className="w-5 h-5" /></button>
                </form>
              ) : <div className="text-center py-4"><SignInButton mode="modal"><button className="bg-red-600 text-white font-black py-4 md:py-5 px-8 md:px-16 rounded-2xl uppercase text-[10px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all">Establish Credentials</button></SignInButton></div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
