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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

interface NavProps {
  onScrollTo: (section: string) => void;
  onNavigateMarketplace?: () => void;
  onOpenChatWithUser?: (userId: string) => void;
  onOpenProfile?: (userId: string) => void;
  activeRoute?: string;
}

const NotificationHub: React.FC<{ isOpen: boolean; setIsOpen: (v: boolean) => void; onShowUser: (id: string) => void; onGoToInbox: (id: string) => void }> = ({ isOpen, setIsOpen, onShowUser, onGoToInbox }) => {
    const { user } = useUser();
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        const notifyRef = ref(db, `notifications/${user.id}`);
        const globalRef = ref(db, 'notifications/global');
        
        onValue(notifyRef, (snap) => {
            const data = snap.val() || {};
            const list = Object.entries(data).map(([id, info]: [string, any]) => ({ id, ...info }));
            
            onValue(globalRef, (gSnap) => {
              const gData = gSnap.val() || {};
              const gList = Object.entries(gData).map(([id, info]: [string, any]) => ({ id, ...info, isGlobal: true }));
              setNotifications([...list, ...gList].sort((a, b) => b.timestamp - a.timestamp));
            });
        });
    }, [user]);

    const handleNotificationClick = async (n: any) => {
        if (!n.isGlobal) await update(ref(db, `notifications/${user?.id}/${n.id}`), { read: true });
        if (n.fromId && n.fromId !== 'system') onShowUser(n.fromId);
        else if (n.type === 'daily_spotlight') window.location.pathname = '/marketplace';
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2.5 rounded-xl bg-white/5 hover:bg-red-600/10 border border-white/5 transition-all text-gray-400 hover:text-red-500">
                <i className="fa-solid fa-bell text-[16px]"></i>
                {notifications.some(n => !n.read && !n.isGlobal) && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border-2 border-black animate-pulse"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed md:absolute right-4 left-4 md:left-auto md:right-0 top-20 md:top-full w-auto md:w-[320px] bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[999999]">
                        <div className="p-5 border-b border-white/5 bg-black flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Logs</span>
                            <button onClick={() => setIsOpen(false)}><CloseIcon className="w-5 h-5 text-zinc-500" /></button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar p-3 space-y-2">
                            {notifications.length === 0 ? (
                                <p className="text-[9px] uppercase font-black tracking-widest text-zinc-600 text-center py-8">Log Database Empty</p>
                            ) : (
                                notifications.map((n) => (
                                    <div key={n.id} onClick={() => handleNotificationClick(n)} className={`p-4 rounded-xl cursor-pointer transition-all border border-transparent ${!n.read && !n.isGlobal ? 'bg-red-600/5 border-red-600/10' : 'opacity-50 hover:bg-white/5'}`}>
                                        <p className={`text-[11px] ${n.type === 'daily_spotlight' ? 'text-red-500 font-black' : 'text-gray-200'}`}>{n.text}</p>
                                        <p className="text-[8px] text-zinc-600 mt-1 uppercase font-bold">{new Date(n.timestamp).toLocaleTimeString()}</p>
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

const isVerified = (username: string) => username === OWNER_HANDLE || username === ADMIN_HANDLE;

export const DesktopHeader: React.FC<NavProps> = ({ onScrollTo, onNavigateMarketplace, onOpenChatWithUser, onOpenProfile, activeRoute }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const siteBrandingName = isVerified(OWNER_HANDLE) ? (
      <div className="flex items-center gap-1">
          <span className="font-black text-white text-base uppercase tracking-[0.2em]">{siteConfig.branding.name}</span>
          <i className="fa-solid fa-circle-check text-[14px] verified-badge-owner"></i>
      </div>
  ) : <h1 className="font-black text-white text-base uppercase tracking-[0.2em]">{siteConfig.branding.name}</h1>;

  return (
    <header className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-[100] h-20 px-10 bg-black/40 backdrop-blur-md border-b border-white/5">
        <div onClick={() => onScrollTo('home')} className="cursor-pointer flex items-center gap-4">
            <img src={siteConfig.branding.logoUrl} alt="Logo" className="h-10 w-10 rounded-full shadow-lg" />
             {siteBrandingName}
        </div>
        <nav className="flex items-center gap-8">
            <button onClick={() => onScrollTo('home')} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all ${activeRoute === 'home' ? 'text-white' : 'text-gray-400 hover:text-white'}`}>Home</button>
            <button onClick={() => onScrollTo('portfolio')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all">Work</button>
            <button onClick={onNavigateMarketplace} className={`text-[10px] font-black uppercase tracking-[0.3em] transition-all border px-4 py-1.5 rounded-lg ${activeRoute === 'marketplace' ? 'text-red-500 bg-red-600/10 border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.2)]' : 'text-red-600 bg-red-600/5 border-red-600/20 hover:text-white hover:bg-red-600'}`}>Marketplace</button>
            <button onClick={() => onScrollTo('contact')} className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all">Order</button>
        </nav>
        <div className="flex items-center gap-4">
            <SignedIn>
              <NotificationHub isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} onShowUser={onOpenProfile!} onGoToInbox={onOpenChatWithUser!} />
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 border-2 border-red-600" } }} />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal"><button className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.4em]">Log In</button></SignInButton>
            </SignedOut>
        </div>
    </header>
  );
};

export const MobileHeader: React.FC<NavProps> = ({ onScrollTo, onNavigateMarketplace, onOpenChatWithUser, onOpenProfile }) => {
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    return (
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-[100] h-20 px-6 bg-black/60 backdrop-blur-xl border-b border-white/5">
            <div onClick={() => onScrollTo('home')} className="flex items-center gap-3">
                <img src={siteConfig.branding.logoUrl} alt="Logo" className="h-9 w-9 rounded-full shadow-lg" />
                <div className="flex items-center gap-1">
                    <span className="font-black text-white tracking-widest text-[10px] uppercase">FEZ ZONE</span>
                    <i className="fa-solid fa-circle-check text-[11px] verified-badge-owner"></i>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <SignedIn>
                    <NotificationHub isOpen={isNotificationsOpen} setIsOpen={setIsNotificationsOpen} onShowUser={onOpenProfile!} onGoToInbox={onOpenChatWithUser!} />
                    <UserButton />
                </SignedIn>
                <SignedOut><SignInButton mode="modal"><button className="text-[9px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-4 py-2 rounded-lg border border-red-600/30">Verify</button></SignInButton></SignedOut>
            </div>
        </header>
    );
};

export const MobileFooterNav: React.FC<{ onScrollTo: (target: any) => void; onNavigateMarketplace: () => void; activeRoute?: string }> = ({ onScrollTo, onNavigateMarketplace, activeRoute }) => (
    <nav className="md:hidden fixed bottom-6 left-6 right-6 z-[100] bg-black/80 backdrop-blur-3xl rounded-[2.5rem] h-20 flex justify-around items-center shadow-2xl border border-white/10 px-4">
        <button onClick={() => onScrollTo('home')} className={`flex flex-col items-center gap-1 transition-all ${activeRoute === 'home' ? 'text-red-500 scale-110' : 'text-zinc-500'}`}>
            <HomeIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </button>
        <button onClick={onNavigateMarketplace} className={`flex flex-col items-center gap-1 transition-all ${activeRoute === 'marketplace' ? 'text-red-500 scale-110' : 'text-zinc-500'}`}>
            <GlobeAltIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Market</span>
        </button>
        <button onClick={() => onScrollTo('portfolio')} className={`flex flex-col items-center gap-1 transition-all text-zinc-500 hover:text-white`}>
            <BriefcaseIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Work</span>
        </button>
        <button onClick={() => onScrollTo('contact')} className={`flex flex-col items-center gap-1 transition-all text-zinc-500 hover:text-white`}>
            <ChatBubbleIcon className="w-6 h-6" />
            <span className="text-[9px] font-black uppercase tracking-widest">Order</span>
        </button>
    </nav>
);