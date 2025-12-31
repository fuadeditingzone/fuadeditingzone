import React, { useState, useEffect } from 'react';
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

const RequestHub: React.FC = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [requests, setRequests] = useState<{received: any[], sent: any[]}>({received: [], sent: []});

    useEffect(() => {
        if (!user) return;
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';

        const reqRef = ref(db, `social/${user.id}/requests`);
        return onValue(reqRef, (snap) => {
            const data = snap.val() || {};
            const receivedIds = Object.keys(data.received || {});
            const sentIds = Object.keys(data.sent || {});
            
            // Resolve basic info for these IDs
            onValue(ref(db, 'users'), (userSnap) => {
                const allUsers = userSnap.val() || {};
                setRequests({
                    received: receivedIds.map(id => ({ id, ...allUsers[id] })),
                    sent: sentIds.map(id => ({ id, ...allUsers[id] }))
                });
            });
        });
    }, [user, isOpen]);

    const handleAction = async (targetId: string, action: 'accept' | 'reject' | 'cancel') => {
        if (!user) return;
        if (action === 'accept') {
            await remove(ref(db, `social/${user.id}/requests/received/${targetId}`));
            await remove(ref(db, `social/${targetId}/requests/sent/${user.id}`));
            await set(ref(db, `social/${user.id}/friends/${targetId}`), true);
            await set(ref(db, `social/${targetId}/friends/${user.id}`), true);
            // Notify
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
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-blue-500 transition-colors">
                <i className="fa-solid fa-user-plus text-lg"></i>
                {requests.received.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed md:absolute right-0 top-[70px] md:top-full mt-4 w-screen md:w-[350px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]">
                        <div className="p-5 border-b border-white/5 bg-black/40 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Signal Requests</span>
                            <button onClick={() => setIsOpen(false)}><CloseIcon className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-4 space-y-6">
                            <div>
                                <h4 className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-4">Received Signals ({requests.received.length})</h4>
                                {requests.received.length === 0 ? (
                                    <p className="text-[10px] text-gray-500 italic py-4 text-center uppercase font-bold">No incoming signals</p>
                                ) : (
                                    requests.received.map(r => (
                                        <div key={r.id} className="flex items-center gap-4 mb-4 bg-white/5 p-3 rounded-2xl border border-white/5">
                                            <img src={r.avatar} className="w-10 h-10 rounded-xl object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[11px] font-black text-white uppercase truncate">{r.name}</p>
                                                <p className="text-[9px] text-gray-500">@{r.username}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction(r.id, 'accept')} className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"><CheckCircleIcon className="w-4 h-4" /></button>
                                                <button onClick={() => handleAction(r.id, 'reject')} className="bg-white/10 text-gray-400 p-2 rounded-lg hover:bg-white/20 transition-colors"><CloseIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="border-t border-white/5 pt-4">
                                <h4 className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-4">Transmitted Signals ({requests.sent.length})</h4>
                                {requests.sent.map(s => (
                                    <div key={s.id} className="flex items-center gap-4 mb-4 opacity-70">
                                        <img src={s.avatar} className="w-8 h-8 rounded-lg object-cover" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-white uppercase truncate">{s.name}</p>
                                        </div>
                                        <button onClick={() => handleAction(s.id, 'cancel')} className="text-[8px] font-black text-red-500 uppercase hover:underline">Revoke</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NotificationHub: React.FC = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        if (isOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';

        const notifyRef = ref(db, `notifications/${user.id}`);
        return onValue(notifyRef, (snap) => {
            const data = snap.val() || {};
            const list = Object.entries(data)
                .map(([id, info]: [string, any]) => ({ id, ...info }))
                .sort((a, b) => b.timestamp - a.timestamp);
            setNotifications(list);
        });
    }, [user, isOpen]);

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
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-bell text-lg"></i>
                {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed md:absolute right-0 top-[70px] md:top-full mt-4 w-screen md:w-[350px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[200]">
                        <div className="p-5 border-b border-white/5 bg-black/40 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Feed Synchronization</span>
                            <button onClick={clearAll} className="text-[8px] font-black text-gray-500 uppercase hover:text-red-500">Clear</button>
                        </div>
                        <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-2">
                            {notifications.length === 0 ? (
                                <div className="p-12 text-center opacity-20 flex flex-col items-center gap-4">
                                    <SparklesIcon className="w-10 h-10" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">No activity synchronized</p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-4 border-b border-white/5 transition-all cursor-pointer flex items-start gap-4 ${!n.read ? 'bg-red-600/5' : 'hover:bg-white/5 opacity-60'}`}>
                                        <img src={n.fromAvatar} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-gray-200 leading-tight">
                                                <span className="font-black text-white uppercase">{n.fromName}</span>
                                                {n.type === 'follow' && ' synchronized with your grid.'}
                                                {n.type === 'friend_request' && ' initiated a social handshake.'}
                                                {n.type === 'request_accepted' && ' accepted your social handshake.'}
                                            </p>
                                            <p className="text-[8px] text-gray-600 font-bold uppercase mt-1">{new Date(n.timestamp).toLocaleTimeString()}</p>
                                        </div>
                                        {!n.read && <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>}
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
              <NavLink onClick={() => onScrollTo('portfolio')}>Gallery</NavLink>
              <NavLink onClick={() => onScrollTo('video-editing')}>VFX</NavLink>
              <NavLink onClick={() => onScrollTo('about')}>Bio</NavLink>
              <NavLink onClick={() => onScrollTo('contact')}>Store</NavLink>
          </nav>
          <div className="flex items-center gap-6">
              <SignedIn>
                <div className="flex items-center gap-4 border-r border-white/10 pr-6">
                    <RequestHub />
                    <NotificationHub />
                </div>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal"><button className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.4em] transition-all">Verify Identity</button></SignInButton>
                <button onClick={() => onScrollTo('contact')} className="btn-angular bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-6 py-2.5 uppercase tracking-[0.3em] transition-all shadow-lg">Order Now</button>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center gap-3">
                    <button onClick={() => setIsProfileOpen(true)} className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center hover:bg-red-600/20 transition-all border border-white/10"><i className="fa-solid fa-gear text-sm text-gray-400"></i></button>
                    <UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 border-[3px] border-red-600 shadow-lg" } }} />
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
    return (
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-20 px-6 select-none bg-black/60 backdrop-blur-xl border-b border-white/5">
            <div onClick={() => { setIsSpinning(true); onScrollTo('home'); setTimeout(() => setIsSpinning(false), 2000); }} className="flex items-center gap-3">
                <img src={siteConfig.branding.logoUrl} alt="Logo" className={`h-9 w-9 rounded-full ${isSpinning ? 'logo-3d-spin' : ''}`} />
                <span className="font-black text-white tracking-widest text-[10px] uppercase">FEZ ZONE</span>
            </div>
            <div className="flex items-center gap-4">
                <SignedIn>
                    <div className="flex items-center gap-3">
                        <RequestHub />
                        <NotificationHub />
                        <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-red-600" } }} />
                    </div>
                </SignedIn>
                <SignedOut><SignInButton mode="modal"><button className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-4 py-2 rounded-lg border border-red-600/30">Verify</button></SignInButton></SignedOut>
            </div>
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
            <FooterNavLink icon={<HomeIcon className="w-5 h-5" />} label="Sync" onClick={() => onScrollTo('home')} />
            <FooterNavLink icon={<BriefcaseIcon className="w-5 h-5" />} label="Graphics" onClick={() => onScrollTo('portfolio')} />
            <FooterNavLink icon={<VfxIcon className="w-5 h-5" />} label="VFX" onClick={() => onScrollTo('video-editing')} />
            <FooterNavLink icon={<ChatBubbleIcon className="w-5 h-5" />} label="Trade" onClick={() => onScrollTo('contact')} />
            <FooterNavLink icon={<UserCircleIcon className="w-5 h-5" />} label="Identity" onClick={() => onScrollTo('about')} />
        </nav>
    );
};