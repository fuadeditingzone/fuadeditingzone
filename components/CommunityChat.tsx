import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onChildAdded, serverTimestamp, query, limitToLast } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { SparklesIcon, SendIcon, UserCircleIcon, CheckCircleIcon } from './Icons';

// Firebase Configuration
const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  // Note: Using RTDB with Public Rules for this portfolio context. 
  // For production, add your API key here.
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

interface Message {
  id?: string;
  name: string;
  text: string;
  avatar: string;
  timestamp: number;
  userId: string;
}

export const CommunityChat: React.FC = () => {
  const { user, isSignedIn } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sync Messages from Firebase
  useEffect(() => {
    const messagesRef = query(ref(db, 'messages'), limitToLast(50));
    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const data = snapshot.val();
      setMessages((prev) => [...prev, { ...data, id: snapshot.key }]);
    });

    return () => unsubscribe();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn || !inputValue.trim()) return;

    const newMessage = {
      name: user.fullName || 'Selected Legend',
      text: inputValue.trim(),
      avatar: user.imageUrl,
      userId: user.id,
      timestamp: serverTimestamp(),
    };

    try {
      await push(ref(db, 'messages'), newMessage);
      setInputValue('');
    } catch (error) {
      console.error("Chat Error:", error);
    }
  };

  return (
    <section id="community" className="py-24 bg-black relative z-10 select-none overflow-hidden">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-12 text-center">
          <span className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-3 block">Real-time Pulse</span>
          <h2 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter">Community Zone</h2>
          <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-blue-600 mx-auto mt-6 rounded-full"></div>
        </div>

        <div className="w-full bg-[#080808] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col h-[600px]">
          {/* Chat Messages */}
          <div 
            id="chat-box"
            className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-fixed"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                <SparklesIcon className="w-12 h-12 mb-4 text-gray-500" />
                <p className="text-xs uppercase tracking-widest font-black">No transmissions yet...</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.userId === user?.id;
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    key={msg.id} 
                    className={`flex items-end gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <img 
                      src={msg.avatar} 
                      alt={msg.name} 
                      className={`w-8 h-8 rounded-full border ${isOwn ? 'border-red-600' : 'border-blue-600'}`} 
                    />
                    <div className={`max-w-[75%] space-y-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                      <div className="flex items-center gap-2 mb-1 justify-end">
                        {isOwn && <span className="text-[8px] font-black uppercase text-red-500 tracking-widest">You</span>}
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">{msg.name}</span>
                      </div>
                      <div className={`px-5 py-3 rounded-2xl text-sm font-medium border ${
                        isOwn 
                          ? 'bg-red-600/10 border-red-600/50 text-white shadow-[0_0_20px_rgba(220,38,38,0.2)] rounded-tr-none' 
                          : 'bg-blue-600/10 border-blue-600/50 text-white shadow-[0_0_20px_rgba(59,130,246,0.2)] rounded-tl-none'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-6 md:p-8 bg-black/50 border-t border-white/10">
            <AnimatePresence mode="wait">
              {isSignedIn ? (
                <form onSubmit={handleSendMessage} className="flex gap-4">
                  <input 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Broadcast your message..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-red-600 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-2xl shadow-xl active:scale-95 transition-all group"
                  >
                    <SendIcon className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4 p-2">
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Sign in to join the Selected Legends chat</p>
                  <SignInButton mode="modal">
                    <button className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 rounded-xl text-[10px] uppercase tracking-widest transition-all">
                      Authenticate
                    </button>
                  </SignInButton>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-8 text-center text-gray-600 text-[9px] font-black uppercase tracking-[0.8em]">End-to-End Visual Encryption Active</p>
      </div>
    </section>
  );
};
