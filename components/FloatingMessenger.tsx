import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, get, query, limitToLast, onChildAdded } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { ChatBubbleIcon, CloseIcon } from './Icons';
import { CommunityChat } from './CommunityChat';
import { siteConfig } from '../config';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

if (!getApps().length) { initializeApp(firebaseConfig); }
const db = getDatabase();

export const FloatingMessenger: React.FC = () => {
    const { user, isSignedIn } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [totalUnread, setTotalUnread] = useState(0);
    const [previewMessage, setPreviewMessage] = useState<{ senderName: string, text: string, avatar: string } | null>(null);
    const [mutedIds, setMutedIds] = useState<string[]>([]);
    const isFirstLoad = useRef(true);

    useEffect(() => {
        if (isOpen) { document.body.style.overflow = 'hidden'; }
        else { document.body.style.overflow = 'unset'; }
    }, [isOpen]);

    useEffect(() => {
        if (!isSignedIn || !user) return;
        
        const muteRef = ref(db, `relationships/${user.id}/muting`);
        const unsubMute = onValue(muteRef, (snap) => setMutedIds(Object.keys(snap.val() || {})));

        const inboxRef = ref(db, `inbox/${user.id}`);
        const unsubInbox = onValue(inboxRef, (snapshot) => {
            const data = snapshot.val() || {};
            const total = Object.entries(data).reduce((acc, [senderId, curr]: [string, any]) => {
                if (mutedIds.includes(senderId)) return acc;
                return acc + (curr.unreadCount || 0);
            }, 0);
            setTotalUnread(total);
        });

        return () => {
            unsubMute();
            unsubInbox();
        };
    }, [isSignedIn, user, mutedIds]);

    if (!isSignedIn) return null;

    return (
        <>
            <div className="fixed bottom-24 right-6 md:bottom-10 md:right-10 z-[20000] flex flex-col items-end gap-4 pointer-events-none">
                <AnimatePresence>
                    {previewMessage && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-black/95 border border-red-600/30 p-4 rounded-2xl shadow-2xl flex items-center gap-4 max-w-[280px] pointer-events-auto cursor-pointer" onClick={() => { setIsOpen(true); setPreviewMessage(null); }}>
                            <img src={previewMessage.avatar} className="w-10 h-10 rounded-xl border border-red-600/50" alt="" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-red-500 uppercase truncate">{previewMessage.senderName}</p>
                                <p className="text-white text-xs font-medium truncate opacity-80">{previewMessage.text}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button whileHover={{ scale: 1.1 }} onClick={() => setIsOpen(!isOpen)} className={`relative w-16 h-16 md:w-20 md:h-20 rounded-full bg-black border-2 flex items-center justify-center shadow-2xl pointer-events-auto transition-all ${totalUnread > 0 ? 'border-red-600' : 'border-white/10'}`}>
                    {isOpen ? <CloseIcon className="w-8 h-8 text-white" /> : <img src={siteConfig.branding.logoUrl} className="w-10 h-10 md:w-12 md:h-12 rounded-full" alt="FEZ" />}
                    {totalUnread > 0 && !isOpen && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white min-w-[24px] h-[24px] rounded-full flex items-center justify-center text-[10px] font-black border-4 border-black px-1.5 shadow-lg">
                        {totalUnread > 9 ? '9+' : totalUnread}
                      </div>
                    )}
                </motion.button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[19000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                        <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="h-full overflow-hidden"><CommunityChat isModalMode={true} /></div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};