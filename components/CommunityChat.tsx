import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, update, get, remove, query, limitToLast, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
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

interface ChatUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  online?: boolean;
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

export const CommunityChat: React.FC<{ isModalMode?: boolean; initialTargetUserId?: string | null; onShowProfile?: (id: string) => void }> = ({ isModalMode, initialTargetUserId, onShowProfile }) => {
  const { user: clerkUser, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
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
            alert("Security Protocol: Sync required for extensive transmission. Proceed to Profile for connection.");
            return;
        }
    }

    const newMessage = { senderId: clerkUser.id, senderName: clerkUser.username || clerkUser.fullName, senderAvatar: clerkUser.imageUrl, text: inputValue.trim(), timestamp: Date.now() };
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
    <section id="community" className="h-full w-full bg-black flex flex-col overflow-hidden no-clip">
      <div className="flex-1 flex overflow-hidden container mx-auto px-0 md:px-4 max-w-[1600px] py-0 md:py-4">
        {/* Left Sidebar (Spotify Style) */}
        <div className={`w-full md:w-[320px] flex flex-col bg-[#121212]/50 md:bg-[#121212] md:rounded-2xl overflow-hidden border-r md:border border-white/5 flex-shrink-0 transition-all ${showConversationOnMobile ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-black text-xs uppercase tracking-widest opacity-60">Your Library</h2>
                    <SparklesIcon className="w-4 h-4 text-red-600 animate-pulse" />
                </div>
                
                <div className="space-y-1">
                    <button 
                        onClick={() => { setIsGlobal(true); setSelectedUser(null); }}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${isGlobal ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <GlobeAltIcon className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-tight">Global Sync</span>
                    </button>
                    <button 
                        onClick={() => isSignedIn ? onShowProfile?.(clerkUser.id) : alert('Sign in to view your profile')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-zinc-400 hover:text-white hover:bg-white/5`}
                    >
                        <UserCircleIcon className="w-5 h-5" />
                        <span className="font-bold text-sm tracking-tight">My Profile</span>
                    </button>
                </div>
            </div>

            <div className="px-6 mb-4">
                <div className="relative group">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-red-500 transition-colors" />
                    <input 
                        value={sidebarSearchQuery}
                        onChange={e => setSidebarSearchQuery(e.target.value)}
                        placeholder="Search artists..."
                        className="w-full bg-[#242424] border-none rounded-lg py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 focus:ring-1 focus:ring-red-600 outline-none transition-all font-sans"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
                {filteredUsers.length === 0 ? (
                    <div className="py-10 text-center opacity-20">
                        <p className="text-[10px] font-black uppercase tracking-widest">No Signals detected</p>
                    </div>
                ) : (
                    filteredUsers.map(u => (
                        <button 
                            key={u.id}
                            onClick={() => { setIsGlobal(false); setSelectedUser(u); setShowConversationOnMobile(true); }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${selectedUser?.id === u.id && !isGlobal ? 'bg-white/10' : 'hover:bg-white/5 opacity-80 hover:opacity-100'}`}
                        >
                            <img src={u.avatar} className={`w-10 h-10 rounded-full object-cover border-2 ${u.username === OWNER_HANDLE ? 'border-red-600' : u.username === ADMIN_HANDLE ? 'border-blue-600' : 'border-white/10'}`} alt="" />
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate flex items-center gap-1">
                                    {u.name}
                                    {getBadge(u.username)}
                                </p>
                                <p className="text-[10px] text-zinc-500 font-medium truncate">@{u.username}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Main Content (Spotify Style) */}
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#1a1a1a] to-black md:rounded-2xl md:ml-4 overflow-hidden border border-white/5 relative ${showConversationOnMobile ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-4 md:p-6 bg-black/20 border-b border-white/5 flex items-center justify-between backdrop-blur-xl z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowConversationOnMobile(false)} className="md:hidden text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-red-600/10 flex items-center justify-center border ${isGlobal ? 'border-red-600/30' : 'border-white/10 overflow-hidden'}`}>
                            {isGlobal ? <GlobeAltIcon className="w-6 h-6 text-red-600" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover cursor-pointer" onClick={() => onShowProfile?.(selectedUser!.id)} />}
                        </div>
                        <div>
                            <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight flex items-center gap-1">
                                {isGlobal ? 'Global Public Sync' : selectedUser?.name}
                                {!isGlobal && getBadge(selectedUser!.username)}
                            </h3>
                            <p className="text-[10px] md:text-xs text-zinc-500 font-bold uppercase tracking-widest">{isGlobal ? 'Live Frequency' : `@${selectedUser?.username}`}</p>
                        </div>
                    </div>
                </div>
                {!isGlobal && (
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${isFriend ? 'border-green-600/30 text-green-500 bg-green-600/5' : 'border-yellow-600/30 text-yellow-500 bg-yellow-600/5'}`}>
                            {isFriend ? 'Connected' : 'Pending Sync'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 custom-scrollbar scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'} items-end group`}>
                        <img 
                            src={msg.senderAvatar} 
                            className="w-8 h-8 rounded-full border border-white/10 object-cover cursor-pointer hover:scale-110 transition-transform" 
                            onClick={() => onShowProfile?.(msg.senderId)}
                            alt=""
                        />
                        <div className={`max-w-[75%] md:max-w-[60%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-1 px-1">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest truncate max-w-[120px]">{msg.senderName}</span>
                                {getBadge(msg.senderName)}
                            </div>
                            <div className={`p-3 md:p-4 rounded-2xl text-xs md:text-sm font-sans ${
                                msg.senderId === clerkUser?.id 
                                ? 'bg-red-600 text-white rounded-tr-none' 
                                : 'bg-white/5 border border-white/5 text-zinc-300 rounded-tl-none group-hover:bg-white/10 transition-colors'
                            } whitespace-pre-wrap no-clip`} style={{ overflowWrap: 'anywhere' }}>
                                {msg.text}
                            </div>
                            <span className="text-[8px] text-zinc-600 mt-1 uppercase font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 md:p-6 bg-black/40 border-t border-white/5 backdrop-blur-md">
                {isSignedIn ? (
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
                        <div className="flex gap-3 bg-[#242424] rounded-xl p-2 border border-white/5 focus-within:border-red-600/50 transition-all shadow-inner">
                            <textarea 
                                value={inputValue} 
                                onChange={e => setInputValue(e.target.value)} 
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e as any);
                                    }
                                }}
                                placeholder="Transmit signal..." 
                                className="flex-1 bg-transparent px-3 py-2 text-sm text-white outline-none resize-none max-h-32 min-h-[40px] font-sans"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim()} 
                                className="bg-red-600 text-white w-12 h-12 flex items-center justify-center rounded-xl active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:grayscale self-end"
                            >
                                <SendIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-4 bg-red-600/5 rounded-2xl border border-red-600/20">
                        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-4">Authentication required for transmission</p>
                        <SignInButton mode="modal">
                            <button className="bg-red-600 text-white font-black py-3 px-12 rounded-xl uppercase text-[10px] tracking-widest shadow-2xl hover:bg-red-700 transition-all">Connect Identity</button>
                        </SignInButton>
                    </div>
                )}
            </div>
        </div>
      </div>
    </section>
  );
};