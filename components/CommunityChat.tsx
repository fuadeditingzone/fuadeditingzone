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
    if (username === OWNER_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-owner flex-shrink-0 w-4 h-4 flex items-center justify-center" style={{ width: '16px', height: '16px', fontSize: '14px' }}></i>;
    if (username === ADMIN_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-admin flex-shrink-0 w-4 h-4 flex items-center justify-center" style={{ width: '16px', height: '16px', fontSize: '14px' }}></i>;
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
    <section id="community" className="h-full w-full bg-black flex flex-col overflow-hidden no-clip font-sans">
      <div className="flex-1 flex overflow-hidden container mx-auto px-0 md:px-4 max-w-[1600px] py-0 md:py-4">
        {/* Left Sidebar (Spotify Inspired) */}
        <div className={`w-full md:w-[320px] flex flex-col bg-[#121212]/50 md:bg-[#121212] md:rounded-3xl overflow-hidden border-r md:border border-white/5 flex-shrink-0 transition-all ${showConversationOnMobile ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-8 space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-white font-black text-[10px] uppercase tracking-[0.3em] opacity-40">Library Hub</h2>
                    <SparklesIcon className="w-4 h-4 text-red-600" />
                </div>
                
                <div className="space-y-2">
                    <button 
                        onClick={() => { setIsGlobal(true); setSelectedUser(null); }}
                        className={`w-full flex items-center gap-4 px-4 py-4 rounded-2xl transition-all ${isGlobal ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <GlobeAltIcon className="w-5 h-5" />
                        <span className="font-black text-xs uppercase tracking-widest">Global Sync</span>
                    </button>
                    {isSignedIn && (
                        <button 
                            onClick={() => onShowProfile?.(clerkUser.id)}
                            className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <UserCircleIcon className="w-5 h-5" />
                            <span className="font-black text-xs uppercase tracking-widest">My Profile</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="px-8 mb-6">
                <div className="relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-red-500 transition-colors" />
                    <input 
                        value={sidebarSearchQuery}
                        onChange={e => setSidebarSearchQuery(e.target.value)}
                        placeholder="Scan users..."
                        className="w-full bg-[#1e1e1e] border-none rounded-xl py-3.5 pl-12 pr-4 text-xs text-white placeholder-zinc-600 focus:ring-1 focus:ring-red-600 outline-none transition-all font-sans"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 space-y-2 pb-8">
                {filteredUsers.length === 0 ? (
                    <div className="py-20 text-center opacity-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Data Nodes</p>
                    </div>
                ) : (
                    filteredUsers.map(u => (
                        <button 
                            key={u.id}
                            onClick={() => { setIsGlobal(false); setSelectedUser(u); setShowConversationOnMobile(true); }}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedUser?.id === u.id && !isGlobal ? 'bg-white/10' : 'hover:bg-white/5 opacity-70 hover:opacity-100'}`}
                        >
                            <img src={u.avatar} className={`w-12 h-12 rounded-2xl object-cover border-2 flex-shrink-0 ${u.username === OWNER_HANDLE ? 'border-red-600' : u.username === ADMIN_HANDLE ? 'border-blue-600' : 'border-white/5'}`} alt="" />
                            <div className="text-left flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 min-w-0">
                                    <p className="text-xs font-black text-white truncate uppercase tracking-tight">
                                        {u.name}
                                    </p>
                                    {getBadge(u.username)}
                                </div>
                                <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">@{u.username}</p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col bg-gradient-to-b from-[#1a1a1a] to-black md:rounded-3xl md:ml-4 overflow-hidden border border-white/5 relative ${showConversationOnMobile ? 'flex' : 'hidden md:flex'}`}>
            <div className="p-6 md:p-8 bg-black/40 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl z-20">
                <div className="flex items-center gap-6">
                    <button onClick={() => setShowConversationOnMobile(false)} className="md:hidden text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-red-600/10 flex items-center justify-center border ${isGlobal ? 'border-red-600/30' : 'border-white/10 overflow-hidden'}`}>
                            {isGlobal ? <GlobeAltIcon className="w-8 h-8 text-red-600" /> : <img src={selectedUser?.avatar} className="w-full h-full object-cover cursor-pointer" onClick={() => onShowProfile?.(selectedUser!.id)} />}
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5">
                                <h3 className="text-lg md:text-2xl font-black text-white uppercase tracking-tighter font-sans">
                                    {isGlobal ? 'Public Sync Protocol' : selectedUser?.name}
                                </h3>
                                {!isGlobal && getBadge(selectedUser!.username)}
                            </div>
                            <p className="text-[10px] md:text-xs text-zinc-600 font-black uppercase tracking-[0.3em]">{isGlobal ? 'Live Frequency Stream' : `@${selectedUser?.username}`}</p>
                        </div>
                    </div>
                </div>
                {!isGlobal && (
                    <div className="hidden sm:flex items-center gap-4">
                        <span className={`text-[10px] font-black uppercase px-5 py-2 rounded-full border ${isFriend ? 'border-green-600/30 text-green-500 bg-green-600/5' : 'border-white/10 text-zinc-500 bg-white/5'}`}>
                            {isFriend ? 'Auth Synced' : 'Sync Pending'}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar scroll-smooth">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-6 ${msg.senderId === clerkUser?.id ? 'flex-row-reverse' : 'flex-row'} items-end group font-sans`}>
                        <img 
                            src={msg.senderAvatar} 
                            className="w-10 h-10 rounded-2xl border border-white/10 object-cover cursor-pointer hover:scale-110 transition-transform flex-shrink-0" 
                            onClick={() => onShowProfile?.(msg.senderId)}
                            alt=""
                        />
                        <div className={`max-w-[85%] md:max-w-[70%] ${msg.senderId === clerkUser?.id ? 'items-end' : 'items-start'} flex flex-col`}>
                            <div className="flex items-center gap-2 mb-2 px-1">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest truncate max-w-[150px] font-sans">@{msg.senderName}</span>
                                {getBadge(msg.senderName)}
                            </div>
                            <div className={`p-4 md:p-5 rounded-[1.8rem] text-sm md:text-base font-sans leading-relaxed ${
                                msg.senderId === clerkUser?.id 
                                ? 'bg-red-600 text-white rounded-tr-none shadow-xl' 
                                : 'bg-white/5 border border-white/5 text-zinc-300 rounded-tl-none group-hover:bg-white/10 transition-colors'
                            } whitespace-pre-wrap no-clip`} style={{ overflowWrap: 'anywhere' }}>
                                {msg.text}
                            </div>
                            <span className="text-[9px] text-zinc-700 mt-2 uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Received
                            </span>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-6 md:p-10 bg-black/40 border-t border-white/5 backdrop-blur-3xl">
                {isSignedIn ? (
                    <form onSubmit={handleSendMessage} className="flex flex-col gap-4">
                        <div className="flex gap-4 bg-[#1a1a1a] rounded-[2rem] p-3 border border-white/5 focus-within:border-red-600/50 transition-all shadow-inner">
                            <textarea 
                                value={inputValue} 
                                onChange={e => setInputValue(e.target.value)} 
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e as any);
                                    }
                                }}
                                placeholder="Transmit data..." 
                                className="flex-1 bg-transparent px-5 py-3 text-sm text-white outline-none resize-none max-h-40 min-h-[48px] font-sans"
                            />
                            <button 
                                type="submit" 
                                disabled={!inputValue.trim()} 
                                className="bg-red-600 text-white w-14 h-14 flex items-center justify-center rounded-2xl active:scale-95 transition-all shadow-[0_10px_30px_rgba(220,38,38,0.3)] disabled:opacity-20 disabled:grayscale self-end"
                            >
                                <SendIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="text-center py-6 bg-red-600/5 rounded-3xl border border-red-600/10">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em] mb-6 font-sans">Identity Authentication Required</p>
                        <SignInButton mode="modal">
                            <button className="bg-red-600 text-white font-black py-4 px-16 rounded-2xl uppercase text-[11px] tracking-[0.2em] shadow-2xl hover:bg-red-700 transition-all font-sans">Auth Identity</button>
                        </SignInButton>
                    </div>
                )}
            </div>
        </div>
      </div>
    </section>
  );
};