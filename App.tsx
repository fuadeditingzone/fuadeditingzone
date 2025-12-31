import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignIn } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, limitToLast, query, get, update, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
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
import { ExploreFeed } from './components/ExploreFeed';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

export default function App() {
  const { isSignedIn, user } = useUser();
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [profileInitialTab, setProfileInitialTab] = useState<'identity' | 'credentials' | 'networks' | 'posts'>('identity');
  const [profileAutoOpenUpload, setProfileAutoOpenUpload] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [isYouTubeRedirectOpen, setIsYouTubeRedirectOpen] = useState(false);
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0].videoId || 'oAEDU-nycsE');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const isAnyOverlayActive = !!(modalState || isServicesPopupOpen || isYouTubeRedirectOpen || isCommunityChatOpen || viewingProfileId);

  useEffect(() => {
    if (isAnyOverlayActive) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
  }, [isAnyOverlayActive]);

  // Routing Handler for /@username and /marketplace
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
      } else if (path === '/marketplace') {
          handleScrollTo('explore');
      }
    };
    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  const handleOpenProfile = (userId: string, tab: any = 'identity', openUpload = false) => {
    // If we get a username instead of an ID (mentions), we must resolve it
    if (!userId.includes('user_')) {
        get(ref(db, 'users')).then(snap => {
            const users = snap.val();
            const found = Object.values(users || {}).find((u: any) => u.username === userId) as any;
            if (found) {
                setViewingProfileId(found.id);
                window.history.pushState(null, '', `/@${found.username}`);
            }
        });
    } else {
        setViewingProfileId(userId);
        setProfileInitialTab(tab);
        setProfileAutoOpenUpload(openUpload);
        get(ref(db, `users/${userId}/username`)).then((snap) => {
          const uname = snap.val();
          if (uname) window.history.pushState(null, '', `/@${uname}`);
        });
    }
  };

  const handleCloseProfile = () => {
    setViewingProfileId(null);
    setProfileAutoOpenUpload(false);
    window.history.pushState(null, '', '/');
  };

  const handleOpenModal = (items: ModalItem[], index: number) => {
    setModalState({ items, currentIndex: index });
    const item = items[index];
    window.history.pushState(null, '', `/portfolio/${item.id}`);
  };

  const handleCloseModal = () => {
    setModalState(null);
    if (!viewingProfileId) window.history.pushState(null, '', '/');
  };

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
    const el = document.getElementById(target);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    if (target === 'explore') window.history.pushState(null, '', '/marketplace');
  };

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black">
          <VFXBackground /><MediaGridBackground />
          <div className={`transition-all fixed top-0 left-0 right-0 z-50`}>
            <DesktopHeader onScrollTo={handleScrollTo} onOpenChatWithUser={(id) => { setTargetUserId(id); setIsCommunityChatOpen(true); }} onOpenProfile={handleOpenProfile} />
            <MobileHeader onScrollTo={handleScrollTo} onOpenChatWithUser={(id) => { setTargetUserId(id); setIsCommunityChatOpen(true); }} onOpenProfile={handleOpenProfile} />
          </div>
          
          <main className="main-content relative z-10 pb-20 md:pb-0">
              <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
              
              <section id="explore" className="py-20 bg-black/50 backdrop-blur-sm relative border-y border-white/5">
                  <div className="container mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-[10px] font-black uppercase tracking-[0.8em] text-red-600 mb-4 block">Visual Marketplace</span>
                        <h2 className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">The Market</h2>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Discover, Connect & Mention</p>
                    </div>
                    <ExploreFeed onOpenProfile={handleOpenProfile} />
                  </div>
              </section>

              <Portfolio openModal={handleOpenModal} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
              <CommunityChat onShowProfile={handleOpenProfile} />
              <Contact onStartOrder={() => {}} />
              <AboutAndFooter />
          </main>

          <AnimatePresence>
            {isCommunityChatOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[900000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4" onClick={() => setIsCommunityChatOpen(false)}>
                    <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl h-[85vh] bg-[#050505] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <CommunityChat isModalMode={true} initialTargetUserId={targetUserId} onShowProfile={handleOpenProfile} />
                        <button onClick={() => setIsCommunityChatOpen(false)} className="absolute top-6 right-6 z-[50] p-3 rounded-full bg-white/5 hover:bg-red-600 transition-all"><CloseIcon className="w-6 h-6" /></button>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>

          <ProfileModal 
            isOpen={!!viewingProfileId} 
            onClose={handleCloseProfile} 
            viewingUserId={viewingProfileId} 
            initialTab={profileInitialTab} 
            forceOpenUpload={profileAutoOpenUpload}
          />
          {modalState && <ModalViewer state={modalState} onClose={handleCloseModal} onNext={(idx) => handleOpenModal(modalState.items, idx)} onPrev={(idx) => handleOpenModal(modalState.items, idx)} />}
          {isServicesPopupOpen && <ServicesListPopup onClose={() => setIsServicesPopupOpen(false)} />}
          {isYouTubeRedirectOpen && <YouTubeRedirectPopup onClose={() => setIsYouTubeRedirectOpen(false)} onConfirm={() => { setIsYouTubeRedirectOpen(false); handleScrollTo('portfolio'); }} />}
          {pipVideo && <VideoPipPlayer video={pipVideo} onClose={() => setPipVideo(null)} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />}
          <PwaInstallPrompt />
          <div className={`transition-all fixed bottom-0 left-0 right-0 z-40`}>
            <MobileFooterNav onScrollTo={handleScrollTo} />
          </div>
      </div>
    </ParallaxProvider>
  );
}