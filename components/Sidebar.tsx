import React, { useState, useEffect } from 'react';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser
} from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { HomeIcon, BriefcaseIcon, VfxIcon, UserCircleIcon, ChatBubbleIcon, SparklesIcon, CloseIcon } from './Icons';
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

const NotificationHub: React.FC = () => {
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);
    const [unread, setUnread] = useState<any[]>([]);

    useEffect(() => {
        if (!user) return;
        const inboxRef = ref(db, `inbox/${user.id}`);
        return onValue(inboxRef, (snap) => {
            const data = snap.val() || {};
            const list = Object.entries(data)
                .map(([senderId, info]: [string, any]) => ({ senderId, ...info }))
                .filter(i => i.unreadCount > 0)
                .sort((a, b) => b.timestamp - a.timestamp);
            setUnread(list);
        });
    }, [user]);

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-bell text-lg"></i>
                {unread.length > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-red-600 rounded-full"></span>}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-4 w-72 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[100]">
                        <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Notification Hub</span>
                            <button onClick={() => setIsOpen(false)}><CloseIcon className="w-4 h-4 text-gray-500" /></button>
                        </div>
                        <div className="max-h-64 overflow-y-auto custom-scrollbar">
                            {unread.length === 0 ? (
                                <div className="p-8 text-center"><p className="text-[9px] text-gray-600 font-bold uppercase">All caught up</p></div>
                            ) : (
                                unread.map((item, idx) => (
                                    <div key={idx} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                                        <p className="text-[10px] font-black text-white uppercase mb-1">New Message Received</p>
                                        <p className="text-[11px] text-gray-400 line-clamp-1">{item.lastMessage || 'Signal acquired.'}</p>
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
      <header className="hidden md:flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-16 px-10 bg-transparent">
          <div onClick={() => { setIsSpinning(true); onScrollTo('home'); setTimeout(() => setIsSpinning(false), 2000); }} className="cursor-pointer group flex items-center gap-4">
              <div className="relative">
                  <div className="absolute -inset-1 bg-red-600/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img src={siteConfig.branding.logoUrl} alt="Logo" className={`h-9 w-9 rounded-full relative z-10 ${isSpinning ? 'logo-3d-spin' : ''}`} />
              </div>
               <h1 className="font-black text-white text-base uppercase tracking-[0.2em]">{siteConfig.branding.name}</h1>
          </div>
          <nav className="flex items-center gap-4">
              <NavLink onClick={() => onScrollTo('home')}>Home</NavLink>
              <NavLink onClick={() => onScrollTo('portfolio')}>Graphics</NavLink>
              <NavLink onClick={() => onScrollTo('video-editing')}>Video Editing</NavLink>
              <NavLink onClick={() => onScrollTo('about')}>About</NavLink>
              <NavLink onClick={() => onScrollTo('contact')}>Contact</NavLink>
          </nav>
          <div className="flex items-center gap-4">
              <SignedIn><NotificationHub /></SignedIn>
              <SignedOut>
                <SignInButton mode="modal"><button className="text-[10px] font-black text-gray-400 hover:text-white uppercase tracking-[0.4em] transition-all">Verify</button></SignInButton>
                <button onClick={() => onScrollTo('contact')} className="btn-angular bg-red-600 hover:bg-red-700 text-white text-[10px] font-black px-6 py-2 uppercase tracking-[0.3em] transition-all shadow-lg">Order Now</button>
              </SignedOut>
              <SignedIn><UserButton appearance={{ elements: { userButtonAvatarBox: "w-11 h-11 border-[3px] border-red-600 shadow-lg" } }} /></SignedIn>
          </div>
      </header>
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
};

export const MobileHeader: React.FC<NavProps> = ({ onScrollTo }) => {
    const [isSpinning, setIsSpinning] = useState(false);
    return (
        <header className="md:hidden flex items-center justify-between fixed top-0 left-0 right-0 z-50 h-16 px-6 select-none bg-transparent">
            <div onClick={() => { setIsSpinning(true); onScrollTo('home'); setTimeout(() => setIsSpinning(false), 2000); }} className="flex items-center gap-3">
                <img src={siteConfig.branding.logoUrl} alt="Logo" className={`h-8 w-8 rounded-full ${isSpinning ? 'logo-3d-spin' : ''}`} />
                <span className="font-black text-white tracking-widest text-[8px] uppercase">FEZ ZONE</span>
            </div>
            <div className="flex items-center gap-4">
                <SignedIn><NotificationHub /></SignedIn>
                <SignedOut><SignInButton mode="modal"><button className="text-[10px] font-black text-red-500 uppercase tracking-widest">Verify</button></SignInButton></SignedOut>
                <SignedIn><UserButton appearance={{ elements: { userButtonAvatarBox: "w-9 h-9 border-2 border-red-600" } }} /></SignedIn>
            </div>
        </header>
    );
};

const FooterNavLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-red-500 transition-all duration-300 w-16 group">
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
        <span className="text-[8px] font-black uppercase tracking-wider">{label}</span>
    </button>
);

export const MobileFooterNav: React.FC<{ onScrollTo: (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => void; }> = ({ onScrollTo }) => {
    return (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 z-40 bg-[#0a0a0a]/90 backdrop-blur-2xl rounded-2xl h-16 flex justify-around items-center shadow-2xl border border-white/10">
            <FooterNavLink icon={<HomeIcon className="w-5 h-5" />} label="Home" onClick={() => onScrollTo('home')} />
            <FooterNavLink icon={<BriefcaseIcon className="w-5 h-5" />} label="Design" onClick={() => onScrollTo('portfolio')} />
            <FooterNavLink icon={<VfxIcon className="w-5 h-5" />} label="VFX" onClick={() => onScrollTo('video-editing')} />
            <FooterNavLink icon={<ChatBubbleIcon className="w-5 h-5" />} label="Order" onClick={() => onScrollTo('contact')} />
            <FooterNavLink icon={<UserCircleIcon className="w-5 h-5" />} label="Profile" onClick={() => onScrollTo('about')} />
        </nav>
    );
};