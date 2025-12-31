
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignIn } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, limitToLast, query, onChildAdded } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

import type { GraphicWork, VideoWork, VfxSubTab, ModalItem } from './hooks/types';
import { siteConfig } from './config';

import { DesktopHeader, MobileHeader, MobileFooterNav } from './components/Sidebar';
import { Home } from './components/Home';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
import { AboutAndFooter } from './components/AboutAndFooter';
import { CommunityChat } from './components/CommunityChat';
import { ModalViewer, GalleryGridModal } from './components/ModalViewer';
import { ContextMenu } from './components/ContextMenu';
import { VFXBackground } from './components/VFXBackground';
import { MediaSidebar } from './components/MediaSidebar';
// Added CloseIcon to imports
import { YouTubeIcon, SparklesIcon, CheckCircleIcon, ChatBubbleIcon, CloseIcon } from './components/Icons';
import { ParallaxProvider } from './contexts/ParallaxContext';
import { MediaGridBackground } from './components/MediaGridBackground';
import { ServicesListPopup } from './components/ServicesListPopup';
import { VideoPipPlayer } from './components/VideoPipPlayer';
import { ServiceSelectionModal } from './components/ServiceSelectionModal';
import { YouTubeRedirectPopup } from './components/YouTubeRedirectPopup';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};
if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

const MessageToaster: React.FC<{ userId: string; onOpenChat: () => void }> = ({ userId, onOpenChat }) => {
    const [toast, setToast] = useState<any>(null);
    const lastMessageRef = useRef<number>(Date.now());

    useEffect(() => {
        const inboxRef = query(ref(db, `inbox/${userId}`), limitToLast(1));
        return onValue(inboxRef, (snap) => {
            const data = snap.val();
            if (data) {
                const [senderId, info]: [string, any] = Object.entries(data)[0];
                if (info.timestamp > lastMessageRef.current) {
                    onValue(ref(db, `users/${senderId}`), (uSnap) => {
                        const u = uSnap.val();
                        setToast({ senderName: u.name, senderAvatar: u.avatar, text: info.lastMessage });
                    }, { onlyOnce: true });
                    setTimeout(() => setToast(null), 5000);
                }
            }
        });
    }, [userId]);

    return (
        <AnimatePresence>
            {toast && (
                <motion.div initial={{ opacity: 0, y: -100, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={onOpenChat} className="fixed top-24 right-4 md:right-8 z-[1000000] w-full max-w-[340px] cursor-pointer">
                    <div className="bg-black/80 backdrop-blur-3xl border border-red-600/30 rounded-[2rem] p-5 shadow-[0_30px_60px_rgba(220,38,38,0.2)] flex gap-4 items-center">
                        <img src={toast.senderAvatar} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-red-600/20" alt="" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-black text-white uppercase tracking-tight truncate leading-tight">{toast.senderName}</p>
                            <p className="text-[10px] text-gray-400 font-medium leading-tight mt-1 line-clamp-2">{toast.text}</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center flex-shrink-0"><ChatBubbleIcon className="w-5 h-5 text-red-600" /></div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function App() {
  const { isSignedIn, user, isLoaded: isClerkLoaded } = useUser();
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [isGalleryGridOpen, setIsGalleryGridOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState(false);
  const [isYouTubeRedirectOpen, setIsYouTubeRedirectOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const idleTimeoutRef = useRef<number | null>(null);
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0].videoId || 'oAEDU-nycsE');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const isAnyOverlayActive = !!(modalState || isGalleryGridOpen || isServicesPopupOpen || isYouTubeRedirectOpen || contextMenu || isCommunityChatOpen);

  useEffect(() => {
    // FIX: Using type casting to access YT property on window object
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      // FIX: Using type casting to set onYouTubeIframeAPIReady callback
      (window as any).onYouTubeIframeAPIReady = () => setIsYouTubeApiReady(true);
    } else { setIsYouTubeApiReady(true); }
  }, []);

  const handleInactivity = useCallback(() => {
    setIsNavVisible(true);
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    if (!isAnyOverlayActive) idleTimeoutRef.current = window.setTimeout(() => { setIsNavVisible(false); }, 40000); 
  }, [isAnyOverlayActive]);

  useEffect(() => {
    const events = ['mousemove', 'scroll', 'touchstart', 'mousedown', 'keydown'];
    events.forEach(evt => window.addEventListener(evt, handleInactivity));
    handleInactivity();
    return () => {
      events.forEach(evt => window.removeEventListener(evt, handleInactivity));
      if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    };
  }, [handleInactivity]);

  const handleOpenModal = (items: (GraphicWork | VideoWork)[], startIndex: number) => {
      setModalState({ items, currentIndex: startIndex });
  };

  const handleScrollTo = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black" onContextMenu={e => { e.preventDefault(); if(!isAnyOverlayActive) setContextMenu({ x: e.clientX, y: e.clientY }); }}>
          <VFXBackground /><MediaGridBackground />
          <div className={`transition-all fixed top-0 left-0 right-0 z-50 ${(isNavVisible) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <DesktopHeader onScrollTo={handleScrollTo} /><MobileHeader onScrollTo={handleScrollTo} />
          </div>
          
          {isSignedIn && user && <MessageToaster userId={user.id} onOpenChat={() => setIsCommunityChatOpen(true)} />}

          <AnimatePresence>
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="main-content relative z-10 pb-20 md:pb-0">
                <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
                <Portfolio openModal={handleOpenModal} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
                <CommunityChat />
                <Contact onStartOrder={() => {}} />
                <AboutAndFooter />
            </motion.main>
          </AnimatePresence>

          <AnimatePresence>
            {isCommunityChatOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[900000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4" onClick={() => setIsCommunityChatOpen(false)}>
                    <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden" onClick={e => e.stopPropagation()}>
                        <CommunityChat isModalMode={true} />
                        <button onClick={() => setIsCommunityChatOpen(false)} className="absolute top-8 right-8 z-[50] p-3 rounded-full bg-white/5 hover:bg-red-600 transition-all border border-white/10"><CloseIcon className="w-6 h-6" /></button>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          {modalState && <ModalViewer state={modalState} onClose={() => setModalState(null)} onNext={() => setModalState(s => s ? {...s, currentIndex: (s.currentIndex+1)%s.items.length} : null)} onPrev={() => setModalState(s => s ? {...s, currentIndex: (s.currentIndex-1+s.items.length)%s.items.length} : null)} />}
          {isServicesPopupOpen && <ServicesListPopup onClose={() => setIsServicesPopupOpen(false)} />}
          {isYouTubeRedirectOpen && <YouTubeRedirectPopup onClose={() => setIsYouTubeRedirectOpen(false)} onConfirm={() => { setIsYouTubeRedirectOpen(false); handleScrollTo('video-editing'); }} />}
          {pipVideo && <VideoPipPlayer video={pipVideo} onClose={() => setPipVideo(null)} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />}
          {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} onGalleryOpen={() => setIsGalleryGridOpen(true)} />}
          <PwaInstallPrompt />
          <div className={`transition-all fixed bottom-0 left-0 right-0 z-40 ${(isNavVisible) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <MobileFooterNav onScrollTo={handleScrollTo} />
          </div>
      </div>
    </ParallaxProvider>
  );
}
