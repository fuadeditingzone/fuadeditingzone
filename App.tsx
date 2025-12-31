
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignIn } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
// FIX: Added 'update' to the list of imports from firebase-database
import { getDatabase, ref, onValue, limitToLast, query, get, update } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { getMessaging, getToken, onMessage } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging.js';

import type { GraphicWork, VideoWork, ModalItem } from './hooks/types';
import { siteConfig } from './config';

import { DesktopHeader, MobileHeader, MobileFooterNav } from './components/Sidebar';
import { Home } from './components/Home';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
import { AboutAndFooter } from './components/AboutAndFooter';
import { CommunityChat } from './components/CommunityChat';
import { ModalViewer } from './components/ModalViewer';
import { ContextMenu } from './components/ContextMenu';
import { VFXBackground } from './components/VFXBackground';
import { ChatBubbleIcon, CloseIcon } from './components/Icons';
import { ParallaxProvider } from './contexts/ParallaxContext';
import { MediaGridBackground } from './components/MediaGridBackground';
import { ServicesListPopup } from './components/ServicesListPopup';
import { VideoPipPlayer } from './components/VideoPipPlayer';
import { YouTubeRedirectPopup } from './components/YouTubeRedirectPopup';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { ProfileModal } from './components/ProfileModal';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

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
                        if (u) setToast({ senderId, senderName: u.name, senderAvatar: u.avatar, text: info.lastMessage });
                    }, { onlyOnce: true });
                    setTimeout(() => setToast(null), 8000);
                }
            }
        });
    }, [userId]);

    return (
        <AnimatePresence>
            {toast && (
                <motion.div initial={{ opacity: 0, y: -120 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={() => onOpenChat(toast.senderId)} className="fixed top-24 right-4 z-[1000000] w-full max-w-[350px] cursor-pointer">
                    <div className="bg-black/90 backdrop-blur-3xl border border-red-600/30 rounded-2xl p-4 shadow-2xl flex gap-4 items-center">
                        <img src={toast.senderAvatar} className="w-12 h-12 rounded-xl object-cover" alt="" />
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-black text-white uppercase">{toast.senderName}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-1 italic">"{toast.text}"</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default function App() {
  const { isSignedIn, user } = useUser();
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [isGalleryGridOpen, setIsGalleryGridOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [isYouTubeRedirectOpen, setIsYouTubeRedirectOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0].videoId || 'oAEDU-nycsE');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const isAnyOverlayActive = !!(modalState || isGalleryGridOpen || isServicesPopupOpen || isYouTubeRedirectOpen || contextMenu || isCommunityChatOpen || viewingProfileId);

  // Background Scroll Locking
  useEffect(() => {
    if (isAnyOverlayActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isAnyOverlayActive]);

  // Unique Profile Link Routing Logic
  useEffect(() => {
    const handleRouting = async () => {
      const path = window.location.pathname;
      if (path.startsWith('/@')) {
        const handle = path.replace('/@', '');
        if (handle) {
          const usersSnap = await get(ref(db, 'users'));
          const userData = usersSnap.val();
          if (userData) {
            const foundUser = Object.values(userData).find((u: any) => u.username === handle) as any;
            if (foundUser) setViewingProfileId(foundUser.id);
          }
        }
      }
    };
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  const handleOpenProfile = (userId: string) => {
    setViewingProfileId(userId);
    // Fetch username for URL update
    onValue(ref(db, `users/${userId}/username`), (snap) => {
      const uname = snap.val();
      if (uname) window.history.pushState(null, '', `/@${uname}`);
    }, { onlyOnce: true });
  };

  const handleCloseProfile = () => {
    setViewingProfileId(null);
    window.history.pushState(null, '', '/');
  };

  // Push Notification Setup
  useEffect(() => {
    if (isSignedIn && user) {
      const messaging = getMessaging(app);
      getToken(messaging, { vapidKey: 'BC8L_97G_rR8e7B1-XhH7bW4K9p3H7yXv8J4l9s6M1G3r5P2Q4z6X8C0V2B4N6M8L0K2J4H6G8F' }) // Replace with your actual VAPID key
        .then((currentToken) => {
          if (currentToken) {
            get(ref(db, `users/${user.id}/fcmToken`)).then((snap) => {
              if (snap.val() !== currentToken) {
                // FIX: update is now available through imports
                update(ref(db, `users/${user.id}`), { fcmToken: currentToken });
              }
            });
          }
        });
      onMessage(messaging, (payload) => {
        console.log('Foreground Message received. ', payload);
      });
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      (window as any).onYouTubeIframeAPIReady = () => setIsYouTubeApiReady(true);
    } else { setIsYouTubeApiReady(true); }
  }, []);

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
            <DesktopHeader onScrollTo={handleScrollTo} onOpenChatWithUser={handleOpenChat} onOpenProfile={handleOpenProfile} />
            <MobileHeader onScrollTo={handleScrollTo} onOpenChatWithUser={handleOpenChat} onOpenProfile={handleOpenProfile} />
          </div>
          
          {isSignedIn && user && <MessageToaster userId={user.id} onOpenChat={handleOpenChat} />}

          <main className="main-content relative z-10 pb-20 md:pb-0">
              <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
              <Portfolio openModal={(items, idx) => setModalState({items, currentIndex: idx})} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
              <CommunityChat />
              <Contact onStartOrder={() => {}} />
              <AboutAndFooter />
          </main>

          <AnimatePresence>
            {isCommunityChatOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[900000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4" onClick={() => setIsCommunityChatOpen(false)}>
                    <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <CommunityChat isModalMode={true} initialTargetUserId={targetUserId} />
                        <button onClick={() => setIsCommunityChatOpen(false)} className="absolute top-6 right-6 z-[50] p-3 rounded-full bg-white/5 hover:bg-red-600 transition-all"><CloseIcon className="w-6 h-6" /></button>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          <ProfileModal isOpen={!!viewingProfileId} onClose={handleCloseProfile} viewingUserId={viewingProfileId} />

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
