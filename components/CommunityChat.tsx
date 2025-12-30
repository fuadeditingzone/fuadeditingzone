import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, onValue, set, serverTimestamp, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { SparklesIcon, SendIcon, SearchIcon, UserCircleIcon, CheckCircleIcon } from './Icons';

// Firebase Configuration
const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

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

  // 1. Sync current user to Firebase Directory
  useEffect(() => {
    if (isSignedIn && user) {
      const userRef = ref(db, `users/${user.id}`);
      set(userRef, {
        id: user.id,
        name: user.fullName || 'Legend',
        avatar: user.imageUrl,
        lastSeen: serverTimestamp()
      });
    }
  }, [isSignedIn, user]);

  // 2. Fetch all users for the directory
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

  // 3. Deterministic Chat ID for Private Messaging
  const chatID = useMemo(() => {
    if (!user?.id || !selectedUser?.id) return null;
    return [user.id, selectedUser.id].sort().join('--');
  }, [user?.id, selectedUser?.id]);

  // 4. Fetch Messages for the specific pair
  useEffect(() => {
    if (!chatID) {
      setMessages([]);
      return;
    }
    setMessages([]); // Clear previous chat
    const msgRef = query(ref(db, `private_chats/${chatID}`), limitToLast(50));
    const unsubscribe = onChildAdded(msgRef, (snapshot) => {
      const data = snapshot.val();
      setMessages((prev) => [...prev, { ...data, id: snapshot.key }]);
    });
    return () => unsubscribe();
  }, [chatID]);

  // 5. Scroll Fix: Only scroll the chat box
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSignedIn || !inputValue.trim() || !chatID || !user) return;

    const newMessage = {
      senderId: user.id,
      text: inputValue.trim(),
      timestamp: serverTimestamp(),
    };

    try {
      await push(ref(db, `private_chats/${chatID}`), newMessage);
      setInputValue('');
    } catch (error) {
      console.error("Transmission Error:", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section id="community" className="py-24 bg-[#050505] relative z-10 select-none overflow-hidden">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-3 block">Identity Pulse</span>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Community Zone</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="w-full bg-[#0a0a0a] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row h-[700px]">
          
          {/* USER SIDEBAR */}
          <div className="w-full md:w-80 border-r border-white/5 flex flex-col bg-black/40">
            <div className="p-6 border-b border-white/5">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Find Legends..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-xs text-white focus:border-red-600 outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto chat-scrollbar p-4 space-y-2">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-10 opacity-20">
                  <UserCircleIcon className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-[9px] uppercase font-black">No agents found</p>
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button 
                    key={u.id}
                    onClick={() => setSelectedUser(u)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all border border-transparent ${selectedUser?.id === u.id ? 'bg-red-600/10 border-red-600/30 active-user-pulse' : 'hover:bg-white/5'}`}
                  >
                    <img src={u.avatar} className="w-10 h-10 rounded-full border border-white/10" alt="" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-black text-white uppercase tracking-wider truncate">{u.name}</p>
                      <p className="text-[9px] text-gray-500 uppercase font-bold tracking-widest">Active Agent</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* CHAT AREA */}
          <div className="flex-1 flex flex-col bg-[#050505]">
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                  <div className="flex items-center gap-4">
                    <img src={selectedUser.avatar} className="w-10 h-10 rounded-full border border-blue-600/50" alt="" />
                    <div>
                      <h4 className="text-sm font-black text-white uppercase tracking-widest">{selectedUser.name}</h4>
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        <span className="text-[9px] text-gray-500 uppercase font-black tracking-widest">Encrypted Signal</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 chat-scrollbar">
                  {messages.map((msg) => {
                    const isOwn = msg.senderId === user?.id;
                    return (
                      <motion.div 
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] p-4 rounded-2xl text-xs font-medium border shadow-lg ${
                          isOwn 
                            ? 'bg-red-600/10 border-red-600/40 text-white rounded-tr-none shadow-[0_0_20px_rgba(255,0,0,0.15)]' 
                            : 'bg-blue-600/10 border-blue-600/40 text-white rounded-tl-none shadow-[0_0_20px_rgba(59,130,246,0.15)]'
                        }`}>
                          {msg.text}
                        </div>
                      </motion.div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-6 bg-black/40 border-t border-white/5">
                  {isSignedIn ? (
                    <form onSubmit={handleSendMessage} className="flex gap-4">
                      <input 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        placeholder={`Message ${selectedUser.name}...`}
                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-red-600 outline-none transition-all"
                      />
                      <button 
                        type="submit"
                        className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all group"
                      >
                        <SendIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </button>
                    </form>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-12">
                <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <SparklesIcon className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-3">Initialize Signal</h3>
                <p className="text-gray-500 text-xs font-medium max-w-xs uppercase tracking-widest leading-loose">
                  Select a legend from the terminal to begin a secured VFX briefing session.
                </p>
                {!isSignedIn && (
                  <SignInButton mode="modal">
                    <button className="mt-8 bg-red-600 hover:bg-red-700 text-white font-black py-4 px-10 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-xl">
                      Authenticate Access
                    </button>
                  </SignInButton>
                )}
              </div>
            )}
          </div>
        </div>
        <p className="mt-8 text-center text-gray-700 text-[9px] font-black uppercase tracking-[1em]">End-to-End Visual Encryption Protocol v4.0</p>
      </div>
    </section>
  );
};
