import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';
import { siteConfig } from '../config';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, CheckCircleIcon } from './Icons';

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
  text: string;
  timestamp: number;
}

interface ChatUser {
  id: string;
  name: string;
  avatar: string;
}

export const CommunityChat: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Sound
  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  }, []);

  // 1. User Directory & Token Management
  useEffect(() => {
    if (isSignedIn && user) {
      const userRef = ref(db, `users/${user.id}`);
      
      // Request Notification Permission
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
        }
      });
    }
  }, [isSignedIn, user]);

  // 2. Load Community Members
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

  // 3. Private Chat ID Calculation
  const chatID = useMemo(() => {
    if (!user?.id || !selectedUser?.id) return null;
    return [user.id, selectedUser.id].sort().join('--');
  }, [user?.id, selectedUser?.id]);

  // 4. Message Listener with Sound Effect
  useEffect(() => {
    if (!chatID) return;
    setMessages([]);
    const msgRef = query(ref(db, `private_chats/${chatID}`), limitToLast(30));
    const unsubscribe = onChildAdded(msgRef, (snapshot) => {
      const data = snapshot.val() as Message;
      setMessages((prev) => [...prev, { ...data, id: snapshot.key }]);
      
      // Play sound for incoming messages if it's recent
      if (data.senderId !== user?.id && Date.now() - data.timestamp < 10000) {
        audioRef.current?.play().catch(() => {});
      }
    });
    return () => unsubscribe();
  }, [chatID, user?.id]);

  // 5. Scroll Isolation
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatID || !user) return;

    const newMessage = {
      senderId: user.id,
      text: inputValue.trim(),
      timestamp: Date.now(),
    };

    try {
      await push(ref(db, `private_chats/${chatID}`), newMessage);
      setInputValue('');
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
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Real-time Terminal</span>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Community Briefing</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-[3rem] overflow-hidden shadow-[0_60px_120px_rgba(0,0,0,0.9)] flex flex-col md:flex-row h-[750px] relative">
          
          {/* SIDEBAR */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-black/40">
            <div className="p-8 border-b border-white/5">
              <div className="relative group">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-red-500 transition-colors" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Scan for Legends..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-[11px] font-bold text-white uppercase tracking-widest focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto chat-scrollbar p-6 space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-20 opacity-10">
                  <UserCircleIcon className="w-12 h-12 mx-auto mb-4" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No Signals Found</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button 
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-5 p-4 rounded-3xl transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-red-600/10 border-red-600/30' : 'hover:bg-white/5'}`}
                  >
                    <div className="relative">
                      <img src={u.avatar} className="w-12 h-12 rounded-full border-2 border-white/10" alt="" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#0a0a0a]"></div>
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">{u.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em] mt-1">Status: Active</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* CHAT WINDOW */}
          <div className="flex-1 flex flex-col bg-[#050505] relative">
            {selectedUser ? (
              <>
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/30 backdrop-blur-md">
                  <div className="flex items-center gap-5">
                    <img src={selectedUser.avatar} className="w-12 h-12 rounded-full border-2 border-blue-600/40" alt="" />
                    <div>
                      <h4 className="text-[13px] font-black text-white uppercase tracking-widest">{selectedUser.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[9px] text-gray-600 uppercase font-black tracking-widest">Secured Line 0xFEZ</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-8 chat-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, x: isOwn ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[75%] p-5 rounded-3xl text-xs font-bold leading-relaxed tracking-wide border transition-all ${
                          isOwn 
                            ? 'sent-bubble text-white rounded-tr-none' 
                            : 'received-bubble text-white rounded-tl-none'
                        }`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-black/60 border-t border-white/5">
                  <form onSubmit={handleSendMessage} className="flex gap-5">
                    <textarea 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder={`Encrypted transmission to ${selectedUser.name.split(' ')[0]}...`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs font-bold text-white focus:border-red-600 outline-none transition-all resize-none h-14"
                    />
                    <button 
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-30 disabled:hover:bg-red-600 text-white px-8 rounded-2xl shadow-xl active:scale-95 transition-all group"
                    >
                      <SendIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </button>
                  </form>
                  <p className="mt-4 text-[8px] text-gray-700 uppercase font-black tracking-[0.4em] text-center">Enter: Send | Shift+Enter: New Line</p>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-16">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mb-10 border border-red-600/30"
                >
                  <SparklesIcon className="w-12 h-12 text-red-600" />
                </motion.div>
                <h3 className="text-2xl font-black text-white uppercase tracking-[0.4em] mb-4">Select an Agent</h3>
                <p className="text-gray-500 text-[10px] font-bold max-w-sm uppercase tracking-[0.2em] leading-relaxed">
                  Initializing Community Neural Link... Select a Legend from the directory to start a private encrypted session.
                </p>
                {!isSignedIn && (
                  <SignInButton mode="modal">
                    <button className="mt-12 bg-red-600 hover:bg-red-700 text-white font-black py-5 px-14 rounded-2xl text-[10px] uppercase tracking-widest transition-all shadow-[0_20px_40px_rgba(220,38,38,0.4)]">
                      Authenticate Neural Signature
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="mt-8 text-center text-gray-800 text-[9px] font-black uppercase tracking-[1.5em] opacity-40">Fuad Editing Zone • Neural Chat Protocol v4.5</p>
      </div>
    </section>
  );
};
