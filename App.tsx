import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignIn } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, onValue, limitToLast, query, get, update, push, set } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

import type { GraphicWork, VideoWork, ModalItem } from './hooks/types';
import { siteConfig } from './config';

import { DesktopHeader, MobileHeader, MobileFooterNav } from './components/Sidebar';
import { Home } from './components/Home';
import { Portfolio } from './components/Portfolio';
import { Contact } from './components/Contact';
import { AboutAndFooter } from './components/AboutAndFooter';
import { CommunityChat } from './components/CommunityChat';
import { ModalViewer } from './components/ModalViewer';
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
  const [route, setRoute] = useState<'home' | 'marketplace'>(
    window.location.pathname === '/marketplace' ? 'marketplace' : 'home'
  );
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [isCommunityChatOpen, setIsCommunityChatOpen] = useState(false);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [isYouTubeRedirectOpen, setIsYouTubeRedirectOpen] = useState(false);
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0].videoId || 'oAEDU-nycsE');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Daily Spotlight Logic (Runs once every 24h by the first visitor)
  useEffect(() => {
    const checkDailySpotlight = async () => {
      const today = new Date().toISOString().split('T')[0];
      const spotlightRef = ref(db, `system/daily_spotlight/${today}`);
      const snap = await get(spotlightRef);
      
      if (!snap.exists()) {
        const postsSnap = await get(ref(db, 'explore_posts'));
        const postsData = postsSnap.val();
        if (postsData) {
          const yesterday = Date.now() - 86400000;
          const topPosts = Object.entries(postsData)
            .map(([id, val]: [string, any]) => ({ id, ...val }))
            .filter(p => p.timestamp > yesterday)
            .sort((a, b) => Object.keys(b.likes || {}).length - Object.keys(a.likes || {}).length)
            .slice(0, 3);
          
          if (topPosts.length > 0) {
            await set(spotlightRef, { processed: true, top: topPosts.map(p => p.id) });
            topPosts.forEach(post => {
              push(ref(db, 'notifications/global'), {
                type: 'daily_spotlight',
                text: `Daily Spotlight: @${post.userName}'s post is trending!`,
                postId: post.id,
                timestamp: Date.now()
              });
            });
          }
        }
      }
    };
    checkDailySpotlight();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname === '/marketplace' ? 'marketplace' : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: 'home' | 'marketplace') => {
    setRoute(path);
    window.history.pushState(null, '', path === 'home' ? '/' : '/marketplace');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProfile = (userId: string) => {
    setViewingProfileId(userId);
  };

  const handleScrollTo = (target: string) => {
    if (route !== 'home') {
      navigateTo('home');
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(target);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
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

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black overflow-x-hidden">
          <VFXBackground /><MediaGridBackground />
          <div className="fixed top-0 left-0 right-0 z-[100]">
            <DesktopHeader 
              onScrollTo={handleScrollTo} 
              onNavigateMarketplace={() => navigateTo('marketplace')}
              onOpenChatWithUser={(id) => { setTargetUserId(id); setIsCommunityChatOpen(true); }} 
              onOpenProfile={handleOpenProfile} 
              activeRoute={route}
            />
            <MobileHeader 
              onScrollTo={handleScrollTo} 
              onNavigateMarketplace={() => navigateTo('marketplace')}
              onOpenChatWithUser={(id) => { setTargetUserId(id); setIsCommunityChatOpen(true); }} 
              onOpenProfile={handleOpenProfile} 
            />
          </div>
          
          <main className="relative z-10 pt-20">
            {route === 'home' ? (
              <>
                <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
                <Portfolio openModal={(items, index) => setModalState({ items, currentIndex: index })} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
                <CommunityChat onShowProfile={handleOpenProfile} />
                <Contact onStartOrder={() => {}} />
                <AboutAndFooter />
              </>
            ) : (
              <div className="container mx-auto px-4 py-10 min-h-[90vh]">
                <div className="text-center mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-red-600 mb-4 block">Visual Ecosystem</span>
                    <h2 className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">Marketplace</h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Discover & Collaborate Sequentially</p>
                </div>
                <ExploreFeed onOpenProfile={handleOpenProfile} />
              </div>
            )}
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
            onClose={() => setViewingProfileId(null)} 
            viewingUserId={viewingProfileId} 
          />
          {modalState && <ModalViewer state={modalState} onClose={() => setModalState(null)} onNext={(idx) => setModalState({...modalState, currentIndex: idx})} onPrev={(idx) => setModalState({...modalState, currentIndex: idx})} />}
          {isServicesPopupOpen && <ServicesListPopup onClose={() => setIsServicesPopupOpen(false)} />}
          {isYouTubeRedirectOpen && <YouTubeRedirectPopup onClose={() => setIsYouTubeRedirectOpen(false)} onConfirm={() => { setIsYouTubeRedirectOpen(false); handleScrollTo('portfolio'); }} />}
          {pipVideo && <VideoPipPlayer video={pipVideo} onClose={() => setPipVideo(null)} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />}
          <PwaInstallPrompt />
          <MobileFooterNav onScrollTo={handleScrollTo} onNavigateMarketplace={() => navigateTo('marketplace')} activeRoute={route} />
      </div>
    </ParallaxProvider>
  );
}
