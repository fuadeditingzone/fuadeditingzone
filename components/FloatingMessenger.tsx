import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, update, onChildAdded, query, limitToLast, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { ChatBubbleIcon, CloseIcon, SparklesIcon } from './Icons';
import { CommunityChat } from './CommunityChat';
import { siteConfig } from '../config';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

// Initialize Firebase safely
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

export const FloatingMessenger: React.FC = () => {
    const { user, isSignedIn } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [previewMessage, setPreviewMessage] = useState<{ senderName: string, text: string, avatar: string } | null>(null);
    const isFirstLoad = useRef(true);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    // Track Total Unread Counts across all private chats
    useEffect(() => {
        if (!isSignedIn || !user) return;

        const inboxRef = ref(db, `inbox/${user.id}`);
        const unsubscribe = onValue(inboxRef, (snapshot) => {
            const data = snapshot.val() as any;
            if (data) {
                const total = Object.values(data).reduce((acc: number, curr: any) => acc + (curr.unreadCount || 0), 0) as number;
                setTotalUnread(total);
            } else {
                setTotalUnread(0);
            }
        });

        // Listen for new private messages to trigger the Preview Bubble
        const messagesRef = ref(db, `messages`);
        const unsubscribeNew = onChildAdded(messagesRef, (snapshot) => {
            if (isFirstLoad.current) return;
            
            const chatId = snapshot.key;
            if (chatId?.includes(user.id)) {
                const lastMsgQuery = query(ref(db, `messages/${chatId}`), limitToLast(1));
                get(lastMsgQuery).then(snap => {
                    const msgData = Object.values(snap.val() || {})[0] as any;
                    if (msgData && msgData.senderId !== user.id && !isOpen) {
                        setPreviewMessage({
                            senderName: msgData.senderName,
                            text: msgData.text,
                            avatar: msgData.senderAvatar
                        });
                        setTimeout(() => setPreviewMessage(null), 5000);
                    }
                });
            }
        });

        const timer = setTimeout(() => { isFirstLoad.current = false; }, 2000);

        return () => {
            unsubscribe();
            unsubscribeNew();
            clearTimeout(timer);
        };
    }, [isSignedIn, user, isOpen]);

    if (!isSignedIn) return null;

    return (
        <>
            <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[20000] flex flex-col items-end gap-4 pointer-events-none">
                <AnimatePresence>
                    {previewMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8, x: 20 }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 10 }}
                            className="bg-black/90 border border-red-600/30 backdrop-blur-2xl p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[280px] pointer-events-auto cursor-pointer mb-2"
                            onClick={() => { setIsOpen(true); setPreviewMessage(null); }}
                        >
                            <div className="relative flex-shrink-0">
                                <img src={previewMessage.avatar} className="w-10 h-10 rounded-xl border border-red-600/50" alt="" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-black animate-pulse"></div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest truncate">{previewMessage.senderName}</p>
                                <p className="text-white text-xs font-medium truncate opacity-80">{previewMessage.text}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-black border-2 flex items-center justify-center shadow-[0_15px_40px_rgba(0,0,0,0.6)] transition-all pointer-events-auto ${
                        totalUnread > 0 ? 'border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.4)]' : 'border-white/10'
                    }`}
                >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-red-600/5 to-transparent"></div>
                    <img 
                        src={siteConfig.branding.logoUrl} 
                        className={`w-10 h-10 md:w-12 md:h-12 rounded-full relative z-10 transition-transform ${isOpen ? 'rotate-180 scale-0' : 'scale-100'}`} 
                        alt="FEZ" 
                    />
                    <div className={`absolute inset-0 flex items-center justify-center transition-transform ${isOpen ? 'scale-100 rotate-0' : 'scale-0 -rotate-180'}`}>
                        <CloseIcon className="w-8 h-8 text-white" />
                    </div>

                    <AnimatePresence>
                        {totalUnread > 0 && !isOpen && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 bg-red-600 text-white min-w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-black border-4 border-black z-20 shadow-lg px-1.5"
                            >
                                {totalUnread > 9 ? '9+' : totalUnread}
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {totalUnread > 0 && !isOpen && (
                        <div className="absolute inset-0 rounded-full border-2 border-red-600 animate-ping opacity-20"></div>
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[19000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6"
                        onClick={() => setIsOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 40 }}
                            className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,1)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="md:hidden flex justify-end p-6 border-b border-white/5">
                                <button onClick={() => setIsOpen(false)} className="p-3 bg-white/5 rounded-full text-white">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="h-full overflow-hidden">
                                <CommunityChat isModalMode={true} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};