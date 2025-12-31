import React, { useState, useEffect, useCallback } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser
} from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, set, remove, push, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { HomeIcon, BriefcaseIcon, VfxIcon, UserCircleIcon, ChatBubbleIcon, SparklesIcon, CloseIcon, CheckCircleIcon } from './Icons';
import { ProfileModal } from './ProfileModal';
import { motion, AnimatePresence } from 'framer-motion';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};
if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

interface NavProps {
  onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void;
}

const RequestHub: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
    const { user } = useUser();
    const [requests, setRequests] = useState<{received: any[], sent: any[]}>({received: [], sent: []});

    useEffect(() => {
        if (!user) return;
        const reqRef = ref(db, `social/${user.id}/requests`);
        return onValue(reqRef, (snap) => {
            const data = snap.val() || {};
            const receivedIds = Object.keys(data.received || {});
            const sentIds = Object.keys(data.sent || {});
            
            onValue(ref(db, 'users'), (userSnap) => {
                const allUsers = userSnap.val() || {};
                setRequests({
                    received: receivedIds.map(id => ({ id, ...allUsers[id] })),
                    sent: sentIds.map(id => ({ id, ...allUsers[id] }))
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
            await push(ref(db, `notifications/${targetId}`), {
                type: 'request_accepted',
                fromId: user.id,
                fromName: user.fullName || user.username,
                fromAvatar: user.imageUrl,
                timestamp: Date.now(),
                read: false
            });
        } else if (action === 'reject') {
            await remove(ref(db, `social/${user.id}/requests/received/${targetId}`));
            await remove(ref(db, `social/${targetId}/requests/sent/${user.id}`));
        } else if (action === 'cancel') {
            await remove(ref(db, `social/${user.id}/requests/sent/${targetId}`));
            await remove(ref(db, `social/${targetId}/requests/received/${user.id}`));
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
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-[90px] md:top-full mt-4 w-auto md:w-[380px] bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]">
                        <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Handshakes</span>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors"><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="max-h-[60vh] md:max-h-[450px] overflow-y-auto custom-scrollbar p-6 space-y-8 bg-[#080808]/50">
                            <div>
                                <h4 className="text-[9px] font-black text-red-600 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                                    <span className="w-8 h-px bg-red-600/30"></span> Incoming ({requests.received.length})
                                </h4>
                                {requests.received.length === 0 ? (
                                    <div className="py-10 text-center opacity-20">
                                        <i className="fa-solid fa-satellite-dish text-3xl mb-3"></i>
                                        <p className="text-[10px] uppercase font-black tracking-widest leading-relaxed">Awaiting external signals...</p>
                                    </div>
                                ) : (
                                    requests.received.map(r => (
                                        <div key={r.id} className="flex items-center gap-4 mb-4 bg-white/5 p-4 rounded-3xl border border-white/5 shadow-inner">
                                            <img src={r.avatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-white/5 shadow-lg" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[12px] font-black text-white uppercase truncate">{r.name}</p>
                                                <p className="text-[10px] text-gray-500 font-bold">@{r.username}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction(r.id, 'accept')} className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-700 transition-all shadow-lg active:scale-90"><CheckCircleIcon className="w-5 h-5" /></button>
                                                <button onClick={() => handleAction(r.id, 'reject')} className="bg-white/10 text-gray-400 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-all active:scale-90"><CloseIcon className="w-5 h-5" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {requests.sent.length > 0 && (
                                <div className="border-t border-white/5 pt-6">
                                    <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-[0.3em] mb-5 flex items-center gap-2">
                                        <span className="w-8 h-px bg-gray-700/50"></span> Transmitted ({requests.sent.length})
                                    </h4>
                                    {requests.sent.map(s => (
                                        <div key={s.id} className="flex items-center gap-4 mb-4 opacity-70 hover:opacity-100 transition-opacity">
                                            <img src={s.avatar} className="w-10 h-10 rounded-xl object-cover grayscale-[0.5]" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white uppercase truncate">{s.name}</p>
                                                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Signal established...</p>
                                            </div>
                                            <button onClick={() => handleAction(s.id, 'cancel')} className="text-[9px] font-black text-red-500 uppercase hover:underline tracking-widest">Revoke</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NotificationHub: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void }> = ({ isOpen, setIsOpen }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);

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

    const clearAll = async () => {
        if (!user) return;
        await remove(ref(db, `notifications/${user.id}`));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2.5 rounded-xl bg-white/5 hover:bg-red-600/10 border border-white/5 transition-all text-gray-400 hover:text-red-500">
                <i className="fa-solid fa-bell text-[16px]"></i>
                {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full animate-pulse border-2 border-black"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-[90px] md:top-full mt-4 w-auto md:w-[380px] bg-[#0a0a0a] border border-white/10 rounded-[2rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden z-[9999]">
                        <div className="p-6 border-b border-white/5 bg-black/40 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Live Activity Hub</span>
                            <button onClick={clearAll} className="text-[9px] font-black text-gray-500 uppercase hover:text-red-500 tracking-widest transition-colors">Clear Feed</button>
                        </div>
                        <div className="max-h-[60vh] md:max-h-[450px] overflow-y-auto custom-scrollbar p-3 bg-[#080808]/50">
                            {notifications.length === 0 ? (
                                <div className="p-16 text-center opacity-10 flex flex-col items-center gap-5">
                                    <SparklesIcon className="w-12 h-12" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No activity synchronized</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-5 mb-2 rounded-3xl transition-all cursor-pointer flex items-start gap-4 border border-transparent ${!n.read ? 'bg-red-600/5 border-red-600/10' : 'hover:bg-white/5 opacity-60'}`}>
                                        <img src={n.fromAvatar} className="w-11 h-11 rounded-2xl object-cover flex-shrink-0 shadow-lg ring-2 ring-white/5" />
                                        <div className="min-w-0">
                                            <p className="text-[12px] text-gray-200 leading-tight">
                                                <span className="font-black text-white uppercase mr-1">{n.fromName}</span>
                                                {n.type === 'follow' && ' established a permanent neural sync.'}
                                                {n.type === 'friend_request' && ' initiated a neural handshake.'}
                                                {n.type === 'request_accepted' && ' accepted your neural handshake.'}
                                            </p>
                                            <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                                                <i className="fa-solid fa-clock opacity-50"></i>
                                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!n.read && <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(220,38,38,1)]"></div>}
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
    <button onClick={onClick} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all duration-300 px-4 py-2 hover:translate-y-[-1px] active:translate-y-[1px]">
        {children}
    </button>
);

export const DesktopHeader: React.FC<NavProps> = ({ onScrollTo }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);

  const openSettings = useCallback(() => {
    setIsNotificationsOpen(false);
    setIsRequestsOpen(false);
    setIsProfileOpen(true);
  }, []);

  return (
    <>
      <header className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-20 px-10 bg-black/40 backdrop-blur-md border-b border-white/5">
          <div onClick={() => { setIsSpinning(true); onScrollTo('home'); setTimeout(() => setIsSpinning(false), 2000); }} className="cursor-pointer group flex items-center gap-4">
              <div className="relative">
                  <div className="absolute -inset-1 bg-red-600/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={siteConfig.branding.logoUrl} alt="Logo" className={`h-10 w-10 rounded-full relative z-10 ${isSpinning ? 'logo-3d-spin' : ''}`} />
              </div>
               <h1 className="font-black text-white text-base uppercase tracking-[0.2em]">{siteConfig.branding.name}</h1>
          </div>
          <nav className="flex items-center gap-2">
              <NavLink onClick={() => onScrollTo('home')}>Home</NavLink>
              <NavLink onClick={() => onScrollTo('portfolio')}>Portfolio</NavLink>
              <NavLink onClick={() => onScrollTo('video-editing')}>VFX</NavLink>
              <NavLink onClick={() => onScrollTo('about')}>About</NavLink>
              <NavLink onClick={() => onScrollTo('contact')}>Hire Me</NavLink>
          </nav>
          <div className="flex items-center gap-6">
              <SignedIn>
                <div className="flex items-center gap-3 border-r border-white/10 pr-6">
                    <RequestHub isOpen={isRequestsOpen} setIsOpen={(v) => { setIsRequestsOpen(v); if(v) setIsNotificationsOpen(false); }} />
                    <NotificationHub isOpen={isNotificationsOpen} setIsOpen={(v) => { setIsNotificationsOpen(v); if(v) setIsRequestsOpen(false); }} />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal"><button className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.4em] transition-all">Log In</button></SignInButton>
                <button onClick={() => onScrollTo('contact')} className="btn-angular bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-6 py-2.5 uppercase tracking-[0.3em] transition-all shadow-lg">Start Project</button>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-4">
                    <button onClick={openSettings} className="relative p-2.5 rounded-xl bg-white/5 hover:bg-red-600/10 border border-white/5 transition-all text-gray-400 hover:text-white group" title="Agent Settings">
                        <i className="fa-solid fa-gear text-[18px] group-hover:rotate-90 transition-transform duration-500"></i>
                    </button>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 border-[3px] border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.4)]" } }} />
                </div>
              </SignedIn>
          </div>
      </header>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export const MobileHeader: React.FC<NavProps> = ({ onScrollTo }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isRequestsOpen, setIsRequestsOpen] = useState(false);

    const openSettings = useCallback(() => {
        setIsNotificationsOpen(false);
        setIsRequestsOpen(false);
        setIsProfileOpen(true);
    }, []);

    const toggleNotifications = (v: boolean) => {
        setIsNotificationsOpen(v);
        if (v) {
            setIsRequestsOpen(false);
            setIsProfileOpen(false);
        }
    };

    const toggleRequests = (v: boolean) => {
        setIsRequestsOpen(v);
        if (v) {
            setIsNotificationsOpen(false);
            setIsProfileOpen(false);
        }
    };

    return (
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-[9999] h-20 px-6 select-none bg-transparent">
            <div onClick={() => { setIsSpinning(true); onScrollTo('home'); setTimeout(() => setIsSpinning(false), 2000); }} className="flex items-center gap-3">
                <img src={siteConfig.branding.logoUrl} alt="Logo" className={`h-9 w-9 rounded-full ${isSpinning ? 'logo-3d-spin' : ''}`} />
                <span className="font-black text-white tracking-widest text-[10px] uppercase leading-none">FUAD EDITING ZONE</span>
            </div>
            <div className="flex items-center gap-2.5">
                <SignedIn>
                    <div className="flex items-center gap-2.5">
                        <RequestHub isOpen={isRequestsOpen} setIsOpen={toggleRequests} />
                        <NotificationHub isOpen={isNotificationsOpen} setIsOpen={toggleNotifications} />
                        <button onClick={openSettings} className="p-2 text-gray-400 hover:text-white transition-all active:scale-90"><i className="fa-solid fa-gear text-[16px]"></i></button>
                        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-red-600" } }} />
                    </div>
                </SignedIn>
                <SignedOut><SignInButton mode="modal"><button className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-4 py-2 rounded-lg border border-red-600/30">Verify</button></SignInButton></SignedOut>
            </div>
            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </header>
    );
};

const FooterNavLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1.5 text-gray-500 hover:text-red-500 transition-all duration-300 w-16 group">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[8px] font-black uppercase tracking-wider">{label}</span>
    </button>
);

export const MobileFooterNav: React.FC<{ onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void; }> = ({ onScrollTo }) => {
    return (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 bg-black/80 backdrop-blur-3xl rounded-[2rem] h-18 flex justify-around items-center shadow-2xl border border-white/10 p-2">
            <FooterNavLink icon={<HomeIcon className="w-5 h-5" />} label="Home" onClick={() => onScrollTo('home')} />
            <FooterNavLink icon={<BriefcaseIcon className="w-5 h-5" />} label="Gallery" onClick={() => onScrollTo('portfolio')} />
            <FooterNavLink icon={<VfxIcon className="w-5 h-5" />} label="VFX" onClick={() => onScrollTo('video-editing')} />
            <FooterNavLink icon={<ChatBubbleIcon className="w-5 h-5" />} label="Hire" onClick={() => onScrollTo('contact')} />
            <FooterNavLink icon={<UserCircleIcon className="w-5 h-5" />} label="About" onClick={() => onScrollTo('about')} />
        </nav>
    );
};
