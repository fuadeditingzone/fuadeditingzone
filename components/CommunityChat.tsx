import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, GlobeAltIcon } from './Icons';

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
  avatar: string;
  lastSeen?: number;
}

export const CommunityChat: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [isGlobal, setIsGlobal] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Notification Sound
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  }, []);

  // 1. Synchronize User Profile to Firebase
  useEffect(() => {
    if (isSignedIn && user) {
      const userRef = ref(db, `users/${user.id}`);
      
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          getToken(messaging, { vapidKey: 'BE7pik37RZvIuKStwPfrAucx4DhCTQ3BK9ehWMpThmtxKaKZfGkurRqWGECejo8Wu_LqHh-k5JMnGetyEJ4Uukc' })
            .then((token) => {
              set(userRef, {
                id: user.id,
                name: user.fullName || 'Legend',
                avatar: user.imageUrl,
                fcmToken: token,
                lastSeen: serverTimestamp()
              });
            });
        } else {
          set(userRef, {
            id: user.id,
            name: user.fullName || 'Legend',
            avatar: user.imageUrl,
            lastSeen: serverTimestamp()
          });
        }
      });
    }
  }, [isSignedIn, user]);

  // 2. Fetch User Directory
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const userList = Object.values(data) as ChatUser[];
        setUsers(userList.filter(u => u.id !== user?.id));
      }
    });
    return () => unsubscribe();
  }, [user?.id]);

  // 3. Determine Chat Path
  const chatPath = useMemo(() => {
    if (isGlobal) return 'community/global';
    if (!user?.id || !selectedUser?.id) return null;
    const sortedIds = [user.id, selectedUser.id].sort().join('_');
    return `messages/${sortedIds}`;
  }, [isGlobal, user?.id, selectedUser?.id]);

  // 4. Load Messages & Play Pings
  useEffect(() => {
    if (!chatPath) return;
    setMessages([]);
    const msgRef = query(ref(db, chatPath), limitToLast(40));
    
    const unsubscribe = onChildAdded(msgRef, (snapshot) => {
      const data = snapshot.val() as Message;
      setMessages((prev) => {
        // Prevent duplicate local messages if needed, but Firebase push ensures unique keys
        if (prev.some(m => m.id === snapshot.key)) return prev;
        return [...prev, { ...data, id: snapshot.key }];
      });
      
      // Play sound for incoming signals
      if (data.senderId !== user?.id && (!data.timestamp || Date.now() - data.timestamp < 15000)) {
        audioRef.current?.play().catch(() => {});
      }
    });
    
    return () => unsubscribe();
  }, [chatPath, user?.id]);

  // 5. Anti-Scroll Bug: Smooth container-only scrolling
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault(); // Crucial: Prevents page jump
    if (!isSignedIn || !inputValue.trim() || !chatPath || !user) return;

    const newMessage = {
      senderId: user.id,
      senderName: user.fullName || 'Legend',
      senderAvatar: user.imageUrl,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    try {
      setInputValue('');
      await push(ref(db, chatPath), newMessage);
    } catch (error) {
      console.error("Signal Lost:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="community" className="py-24 bg-[#050505] relative z-10 select-none overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Neural Link Hub</span>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Community Briefing</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)] flex flex-col md:flex-row h-[750px] relative">
          
          {/* SIDEBAR: Search & Directory */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-black/40">
            {/* Global Lobby Toggle */}
            <button 
              onClick={() => { setIsGlobal(true); setSelectedUser(null); }}
              className={`flex items-center gap-4 p-6 border-b border-white/5 transition-all ${isGlobal ? 'bg-red-600/10' : 'hover:bg-white/5'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isGlobal ? 'bg-red-600 border-red-500 text-white' : 'bg-white/5 border-white/10 text-gray-500'}`}>
                <GlobeAltIcon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black text-white uppercase tracking-widest">Global Lobby</p>
                <p className="text-[8px] text-gray-500 uppercase font-black">Open Frequency</p>
              </div>
            </button>

            <div className="p-6">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Scan Legends..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[10px] font-bold text-white uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 opacity-10">
                  <UserCircleIcon className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-black tracking-widest">No Signals Found</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button 
                    key={u.id}
                    onClick={() => { setIsGlobal(false); setSelectedUser(u); }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-blue-600/10 border-blue-600/30' : 'hover:bg-white/5'}`}
                  >
                    <div className="relative">
                      <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{u.name}</p>
                      <p className="text-[8px] text-gray-500 uppercase font-black">Neural ID: {u.id.slice(0, 8)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* MAIN CHAT AREA */}
          <div className="flex-1 flex flex-col bg-[#050505] relative">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/30 backdrop-blur-md">
              <div className="flex items-center gap-5">
                {isGlobal ? (
                  <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/40">
                    <GlobeAltIcon className="w-6 h-6 text-red-500" />
                  </div>
                ) : (
                  <img src={selectedUser?.avatar} className="w-12 h-12 rounded-full border-2 border-blue-600/40" alt="" />
                )}
                <div>
                  <h4 className="text-[13px] font-black text-white uppercase tracking-widest">
                    {isGlobal ? 'Global Communications' : `Direct Link: ${selectedUser?.name}`}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">
                      {isGlobal ? 'Community Frequency Active' : 'Private Encrypted Session'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-10 space-y-6 chat-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center opacity-20 text-center">
                  <SparklesIcon className="w-12 h-12 mb-4" />
                  <p className="text-[10px] uppercase font-black tracking-[0.3em]">No transmission data found</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.senderId === user?.id;
                  return (
                    <motion.div 
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {!isOwn && <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{msg.senderName}</span>}
                        {isOwn && <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">You</span>}
                      </div>
                      <div className={`max-w-[80%] p-4 rounded-3xl text-xs font-bold leading-relaxed tracking-wide border transition-all ${
                        isOwn 
                          ? 'sent-bubble text-white rounded-tr-none' 
                          : 'received-bubble text-white rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-8 bg-black/60 border-t border-white/5">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex gap-5">
                  <input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isGlobal ? "Broadcast to Global Lobby..." : `Transmitting to ${selectedUser?.name.split(' ')[0]}...`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-red-600 outline-none transition-all h-14"
                  />
                  <button 
                    type="submit"
                    disabled={!inputValue.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:opacity-30 text-white px-8 rounded-2xl shadow-xl active:scale-95 transition-all group"
                  >
                    <SendIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              ) : (
                <div className="text-center">
                  <SignInButton mode="modal">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-2xl text-[10px] uppercase tracking-widest transition-all">
                      Authenticate to Transmit
                    </button>
                  </SignInButton>
                </div>
              )}
              <p className="mt-4 text-[8px] text-gray-700 uppercase font-black tracking-[0.4em] text-center">Protocol v4.8 • Neural Signature Verified</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
