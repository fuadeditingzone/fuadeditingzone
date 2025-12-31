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
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};
if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

const MessageToaster: React.FC<{ userId: string; onOpenChat: (senderId: string) => void }> = ({ userId, onOpenChat }) => {
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
                        setToast({ senderId, senderName: u.name, senderAvatar: u.avatar, text: info.lastMessage });
                    }, { onlyOnce: true });
                    setTimeout(() => setToast(null), 8000);
                }
            }
        });
    }, [userId]);

    return (
        <AnimatePresence>
            {toast && (
                <motion.div initial={{ opacity: 0, y: -120, scale: 0.8, x: 20 }} animate={{ opacity: 1, y: 0, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.7, y: -20 }} onClick={() => onOpenChat(toast.senderId)} className="fixed top-24 right-4 md:right-10 z-[1000000] w-[calc(100%-2rem)] max-w-[380px] cursor-pointer">
                    <div className="bg-black/90 backdrop-blur-3xl border border-red-600/30 rounded-[2.5rem] p-6 shadow-[0_40px_80px_rgba(0,0,0,1)] flex gap-5 items-center relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600"></div>
                        <img src={toast.senderAvatar} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/5 shadow-2xl" alt="" />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <p className="text-[12px] font-black text-white uppercase tracking-tight truncate leading-tight">{toast.senderName}</p>
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium leading-tight line-clamp-2 italic">"{toast.text}"</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 transition-colors"><ChatBubbleIcon className="w-5 h-5 text-red-600 group-hover:text-white" /></div>
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
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
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
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
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

  const handleOpenChat = (userId: string) => {
      setTargetUserId(userId);
      setIsCommunityChatOpen(true);
  };

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black" onContextMenu={e => { e.preventDefault(); if(!isAnyOverlayActive) setContextMenu({ x: e.clientX, y: e.clientY }); }}>
          <VFXBackground /><MediaGridBackground />
          <div className={`transition-all fixed top-0 left-0 right-0 z-50 ${(isNavVisible) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <DesktopHeader onScrollTo={handleScrollTo} onOpenChatWithUser={handleOpenChat} /><MobileHeader onScrollTo={handleScrollTo} onOpenChatWithUser={handleOpenChat} />
          </div>
          
          {isSignedIn && user && <MessageToaster userId={user.id} onOpenChat={handleOpenChat} />}

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
                    <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,1)]" onClick={e => e.stopPropagation()}>
                        <CommunityChat isModalMode={true} initialTargetUserId={targetUserId} />
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
