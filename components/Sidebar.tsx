
import React, { useState, useEffect, useCallback } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser
} from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, remove, push, update, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { HomeIcon, BriefcaseIcon, VfxIcon, UserCircleIcon, ChatBubbleIcon, SparklesIcon, CloseIcon, CheckCircleIcon, GlobeAltIcon } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';

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

interface NavProps {
  onScrollTo: (section: string) => void;
  onOpenChatWithUser?: (userId: string) => void;
  onOpenProfile?: (userId: string) => void;
}

const RequestHub: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void; onShowUser: (id: string) => void }> = ({ isOpen, setIsOpen, onShowUser }) => {
    const { user } = useUser();
    const [requests, setRequests] = useState<{received: any[], sent: any[]}>({received: [], sent: []});

    useEffect(() => {
        if (!user) return;
        const reqRef = ref(db, `social/${user.id}/requests`);
        return onValue(reqRef, (snap) => {
            const data = snap.val() || {};
            const receivedEntries = Object.entries(data.received || {});
            const sentEntries = Object.entries(data.sent || {});
            
            onValue(ref(db, 'users'), (userSnap) => {
                const allUsers = userSnap.val() || {};
                setRequests({
                    received: receivedEntries.map(([id]) => ({ id, ...allUsers[id] })),
                    sent: sentEntries.map(([id, info]: [string, any]) => ({ 
                        id, 
                        ...allUsers[id], 
                        timestamp: info.timestamp || 0 
                    }))
                });
            });
        });
    }, [user]);

    const handleAction = async (targetId: string, action: 'accept' | 'reject' | 'cancel') => {
        if (!user) return;
        if (action === 'accept') {
            await remove(ref(db, `social/${user.id}/requests/received/${targetId}`));
            await remove(ref(db, `social/${targetId}/requests/sent/${user.id}`));
            await set(ref(db, `social/${user.id}/friends/${targetId}`), true);
            await set(ref(db, `social/${targetId}/friends/${user.id}`), true);
            
            await set(ref(db, `social/${user.id}/following/${targetId}`), true);
            await set(ref(db, `social/${targetId}/followers/${user.id}`), true);
            await set(ref(db, `social/${targetId}/following/${user.id}`), true);
            await set(ref(db, `social/${user.id}/followers/${targetId}`), true);

            await push(ref(db, `notifications/${targetId}`), {
                type: 'request_accepted',
                fromId: user.id,
                fromName: user.fullName || user.username,
                fromAvatar: user.imageUrl,
                text: `${user.fullName} accepted your neural link request.`,
                timestamp: Date.now(),
                read: false
            });
        } else {
            await remove(ref(db, `social/${user.id}/requests/${action === 'reject' ? 'received' : 'sent'}/${targetId}`));
            await remove(ref(db, `social/${targetId}/requests/${action === 'reject' ? 'sent' : 'received'}/${user.id}`));
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2.5 rounded-xl bg-white/5 hover:bg-red-600/10 border border-white/5 transition-all text-gray-400 hover:text-red-500">
                <i className="fa-solid fa-user-plus text-[16px]"></i>
                {requests.received.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-bounce border-2 border-black"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-1/2 md:top-full -translate-y-1/2 md:translate-y-0 md:mt-4 w-auto md:w-[320px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999999]">
                        <div className="p-5 border-b border-white/5 bg-black flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Neural Requests</span>
                            <button onClick={() => setIsOpen(false)}><CloseIcon className="w-5 h-5 text-zinc-500" /></button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-4 space-y-4">
                            {requests.received.length === 0 ? (
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-600 text-center py-8">No Incoming Frequencies</p>
                            ) : (
                                requests.received.map(r => (
                                    <div key={r.id} onClick={() => onShowUser(r.id)} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl cursor-pointer hover:border-red-600/30 transition-all border border-transparent">
                                        <img src={r.avatar} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[11px] font-black text-white uppercase truncate">{r.name}</p>
                                            <p className="text-[9px] text-zinc-500">@{r.username}</p>
                                        </div>
                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            <button onClick={() => handleAction(r.id, 'accept')} className="bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-700 transition-colors"><CheckCircleIcon className="w-4 h-4" /></button>
                                            <button onClick={() => handleAction(r.id, 'reject')} className="bg-white/10 text-zinc-400 w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors"><CloseIcon className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NotificationHub: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void; onShowUser: (id: string) => void; onGoToInbox: (id: string) => void }> = ({ isOpen, setIsOpen, onShowUser, onGoToInbox }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);
    const isOwner = user?.username === OWNER_HANDLE;

    useEffect(() => {
        if (!user) return;
        const notifyRef = ref(db, `notifications/${user.id}`);
        return onValue(notifyRef, (snap) => {
            const data = snap.val() || {};
            const list = Object.entries(data)
                .map(([id, info]: [string, any]) => ({ id, ...info }))
                .sort((a, b) => b.timestamp - a.timestamp);
            setNotifications(list);
        });
    }, [user]);

    const markAsRead = async (id: string) => {
        if (!user) return;
        await update(ref(db, `notifications/${user.id}/${id}`), { read: true });
    };

    const handleOrderAction = async (notif: any, action: 'accept' | 'reject') => {
        if (!user) return;
        let reason = "";
        if (action === 'reject') reason = prompt("Reason for mission rejection:") || "Security clearance denied.";
        
        await update(ref(db, `orders/${notif.fromId}/${notif.orderKey}`), { 
            status: action === 'accept' ? 'Accepted' : 'Rejected',
            rejectionReason: reason || null,
            acceptedAt: action === 'accept' ? Date.now() : null
        });

        await push(ref(db, `notifications/${notif.fromId}`), {
            type: action === 'accept' ? 'order_accepted' : 'order_rejected',
            fromId: user.id,
            fromName: "Fuad Editing Zone",
            fromAvatar: siteConfig.branding.logoUrl,
            timestamp: Date.now(),
            read: false,
            text: action === 'accept' ? `Mission for "${notif.orderName}" has been ACCEPTED.` : `Mission for "${notif.orderName}" was REJECTED: ${reason}`,
            orderName: notif.orderName,
            reason: reason || null
        });

        const chatPath = `messages/${[user.id, notif.fromId].sort().join('_')}`;
        await push(ref(db, chatPath), {
            senderId: user.id, senderName: "Fuad Editing Zone", senderAvatar: siteConfig.branding.logoUrl,
            text: `[MISSION UPDATE]\nProject: ${notif.orderName}\nStatus: ${action === 'accept' ? 'LOCKED & ACCEPTED' : 'ABORTED'}${reason ? '\nReason: ' + reason : ''}`,
            timestamp: Date.now()
        });
        await markAsRead(notif.id);
    };

    const handleNotificationClick = (n: any) => {
        if (n.fromId && n.fromId !== 'system') {
          if (n.type === 'identity_update' || n.type === 'profile_update' || n.type === 'request_accepted' || n.type === 'friend_request') onShowUser(n.fromId === 'system' ? user?.id! : n.fromId);
          else if (['order_accepted', 'order_rejected', 'new_order'].includes(n.type)) onGoToInbox(isOwner && n.type === 'new_order' ? n.fromId : OWNER_HANDLE);
        }
        markAsRead(n.id);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2.5 rounded-xl bg-white/5 hover:bg-red-600/10 border border-white/5 transition-all text-gray-400 hover:text-red-500">
                <i className="fa-solid fa-bell text-[16px]"></i>
                {notifications.some(n => !n.read) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-black animate-pulse"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-1/2 md:top-full -translate-y-1/2 md:translate-y-0 md:mt-4 w-auto md:w-[320px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999999]">
                        <div className="p-5 border-b border-white/5 bg-black flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Logs</span>
                            <button onClick={() => setIsOpen(false)}><CloseIcon className="w-5 h-5 text-zinc-500" /></button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {notifications.length === 0 ? (
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-600 text-center py-8">Log Database Empty</p>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 rounded-xl cursor-pointer transition-all border border-transparent ${!n.read ? 'bg-red-600/5 border-red-600/10' : 'opacity-50 hover:opacity-100 hover:bg-white/5'}`}>
                                        <div className="flex gap-3">
                                            <img src={n.fromAvatar} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] text-gray-200 leading-tight">
                                                    <span className="font-black text-white">{n.fromName}</span> {n.text || n.type.replace('_', ' ')}
                                                </p>
                                                <p className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        {n.type === 'new_order' && isOwner && (
                                            <div className="flex gap-2 mt-3" onClick={e => e.stopPropagation()}>
                                                <button onClick={() => handleOrderAction(n, 'accept')} className="flex-1 py-2 bg-red-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg hover:bg-red-700 transition-all">Accept</button>
                                                <button onClick={() => handleOrderAction(n, 'reject')} className="flex-1 py-2 bg-white/5 text-gray-400 text-[8px] font-black uppercase rounded-lg hover:bg-white/10 transition-all">Reject</button>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NavLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
    <button onClick={onClick} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all px-4 py-2 hover:translate-y-[-1px]">
        {children}
    </button>
);

export const DesktopHeader: React.FC<NavProps> = ({ onScrollTo, onOpenChatWithUser, onOpenProfile }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  return (
    <header className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-20 px-10 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div onClick={() => onScrollTo('home')} className="cursor-pointer flex items-center gap-4">
            <img src={siteConfig.branding.logoUrl} alt="Logo" className="h-10 w-10 rounded-full shadow-lg" />
             <h1 className="font-black text-white text-base uppercase tracking-[0.2em]">{siteConfig.branding.name}</h1>
        </div>
        <nav className="flex items-center gap-2">
            <NavLink onClick={() => onScrollTo('home')}>Home</NavLink>
            <NavLink onClick={() => onScrollTo('portfolio')}>Work</NavLink>
            <NavLink onClick={() => onScrollTo('explore')}>Marketplace</NavLink>
            <NavLink onClick={() => onScrollTo('contact')}>Order</NavLink>
        </nav>
        <div className="flex items-center gap-4">
            <SignedIn>
              <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                  <RequestHub isOpen={isRequestsOpen} setIsOpen={setIsRequestsOpen} onShowUser={onOpenProfile!} />
                  <NotificationHub isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} onShowUser={onOpenProfile!} onGoToInbox={onOpenChatWithUser!} />
              </div>
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal"><button className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.4em] transition-colors">Log In</button></SignInButton>
              <button onClick={() => onScrollTo('contact')} className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-6 py-2.5 uppercase tracking-[0.3em] transition-all shadow-lg rounded-xl active:scale-95">Order Now</button>
            </SignedOut>
            <SignedIn>
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 border-[3px] border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)]" } }} />
            </SignedIn>
        </div>
    </header>
  );
};

export const MobileHeader: React.FC<NavProps> = ({ onScrollTo, onOpenChatWithUser, onOpenProfile }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);

    return (
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-[9999] h-20 px-6 bg-transparent">
            <div onClick={() => onScrollTo('home')} className="flex items-center gap-3">
                <img src={siteConfig.branding.logoUrl} alt="Logo" className="h-9 w-9 rounded-full shadow-lg" />
                <span className="font-black text-white tracking-widest text-[10px] uppercase">FEZ ZONE</span>
            </div>
            <div className="flex items-center gap-2.5">
                <SignedIn>
                    <RequestHub isOpen={isRequestsOpen} setIsOpen={setIsRequestsOpen} onShowUser={onOpenProfile!} />
                    <NotificationHub isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} onShowUser={onOpenProfile!} onGoToInbox={onOpenChatWithUser!} />
                    <UserButton />
                </SignedIn>
                <SignedOut><SignInButton mode="modal"><button className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-4 py-2 rounded-lg border border-red-600/30">Verify</button></SignInButton></SignedOut>
            </div>
        </header>
    );
};

export const MobileFooterNav: React.FC<{ onScrollTo: (target: any) => void }> = ({ onScrollTo }) => (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 bg-black/80 backdrop-blur-3xl rounded-[2rem] h-16 flex justify-around items-center shadow-2xl border border-white/10">
        <button onClick={() => onScrollTo('home')} className="p-2 text-zinc-500 hover:text-white"><HomeIcon className="w-5 h-5" /></button>
        <button onClick={() => onScrollTo('explore')} className="p-2 text-zinc-500 hover:text-white"><GlobeAltIcon className="w-5 h-5" /></button>
        <button onClick={() => onScrollTo('portfolio')} className="p-2 text-zinc-500 hover:text-white"><BriefcaseIcon className="w-5 h-5" /></button>
        <button onClick={() => onScrollTo('contact')} className="p-2 text-zinc-500 hover:text-white"><ChatBubbleIcon className="w-5 h-5" /></button>
    </nav>
);
