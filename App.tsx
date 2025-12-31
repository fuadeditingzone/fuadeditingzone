import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignIn } from '@clerk/clerk-react';

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
import { YouTubeIcon, SparklesIcon } from './components/Icons';
import { ParallaxProvider } from './contexts/ParallaxContext';
import { MediaGridBackground } from './components/MediaGridBackground';
import { ServicesListPopup } from './components/ServicesListPopup';
import { VideoPipPlayer } from './components/VideoPipPlayer';
import { ServiceSelectionModal } from './components/ServiceSelectionModal';
import { YouTubeRedirectPopup } from './components/YouTubeRedirectPopup';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { FloatingMessenger } from './components/FloatingMessenger';

export default function App() {
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
  
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [isGalleryGridOpen, setIsGalleryGridOpen] = useState(false);
  const [singleImageViewerState, setSingleImageViewerState] = useState<{ items: GraphicWork[]; currentIndex: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isMediaSidebarOpen, setIsMediaSidebarOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [selectionTarget, setSelectionTarget] = useState<'whatsapp' | 'email' | null>(null);
  const [isYouTubeRedirectOpen, setIsYouTubeRedirectOpen] = useState(false);
  const [isNavVisible, setIsNavVisible] = useState(true);
  const [isLockActive, setIsLockActive] = useState(false);
  const idleTimeoutRef = useRef<number | null>(null);
  
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0].videoId || 'oAEDU-nycsE');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  const isAnyOverlayActive = !!(modalState || isGalleryGridOpen || singleImageViewerState || isServicesPopupOpen || selectionTarget || isYouTubeRedirectOpen || isMediaSidebarOpen || contextMenu || isLockActive);

  // --- POPUP INTERRUPTION PREVENTION: Global Scroll Lock ---
  useEffect(() => {
    if (isAnyOverlayActive) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.touchAction = 'auto';
    }
  }, [isAnyOverlayActive]);

  // Load YouTube IFrame API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      window.onYouTubeIframeAPIReady = () => setIsYouTubeApiReady(true);
    } else {
      setIsYouTubeApiReady(true);
    }
  }, []);

  // --- 5-Minute Access Lock logic ---
  useEffect(() => {
    if (isSignedIn) {
        setIsLockActive(false);
        return;
    }
    const timer = setTimeout(() => {
        if (!isSignedIn && isClerkLoaded) setIsLockActive(true);
    }, 300000); 
    return () => clearTimeout(timer);
  }, [isSignedIn, isClerkLoaded]);

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

  const combinedPortfolio = useMemo(() => {
    const graphics = siteConfig.content.portfolio.graphicWorks.map(w => ({ ...w, slug: `g-${w.id}` }));
    const vfx = siteConfig.content.portfolio.vfxEdits.map(v => ({ ...v, slug: `v-${v.id}` }));
    const anime = siteConfig.content.portfolio.animeEdits.map(a => ({ ...a, slug: `a-${a.id}` }));
    return [...graphics, ...vfx, ...anime];
  }, []);

  const handleOpenModal = (items: (GraphicWork | VideoWork)[], startIndex: number) => {
      if (Array.isArray(items) && items.length > 0) {
          const itemsWithSlugs = items.map(item => {
            if ((item as any).slug) return item;
            const prefix = 'imageUrl' in item ? 'g' : ('videoId' in item ? 'a' : 'v');
            return { ...item, slug: `${prefix}-${item.id}` };
          });
          setModalState({ items: itemsWithSlugs, currentIndex: startIndex });
      }
  };

  const handleScrollTo = (target: string) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleModalNext = useCallback(() => { setModalState(s => s ? { ...s, currentIndex: (s.currentIndex + 1) % s.items.length } : null); }, []);
  const handleModalPrev = useCallback(() => { setModalState(s => s ? { ...s, currentIndex: (s.currentIndex - 1 + s.items.length) % s.items.length } : null); }, []);

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black" onContextMenu={e => { e.preventDefault(); if(!isAnyOverlayActive) setContextMenu({ x: e.clientX, y: e.clientY }); }}>
          <VFXBackground /><MediaGridBackground />
          <div className={`transition-all fixed top-0 left-0 right-0 z-50 ${(isNavVisible) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <DesktopHeader onScrollTo={handleScrollTo} /><MobileHeader onScrollTo={handleScrollTo} />
          </div>
          <MediaSidebar isOpen={isMediaSidebarOpen} onClose={() => setIsMediaSidebarOpen(false)} activeYouTubeId={activeYouTubeId} onSelectYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
          
          <AnimatePresence>
            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="main-content relative z-10 pb-20 md:pb-0">
                <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
                <Portfolio openModal={handleOpenModal} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
                <CommunityChat />
                <Contact onStartOrder={setSelectionTarget} />
                <AboutAndFooter />
            </motion.main>
          </AnimatePresence>

          <FloatingMessenger />

          <AnimatePresence>
            {isLockActive && (
                <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[1000000] bg-black/95 flex flex-col items-center justify-center p-6"
                >
                    <div className="relative w-full max-w-[520px] bg-white rounded-[4rem] overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)]">
                        <div className="p-12 md:p-20 text-center">
                             <div className="w-24 h-24 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-red-600/20 shadow-inner">
                                <SparklesIcon className="w-12 h-12 text-red-600" />
                            </div>
                            <h2 className="text-zinc-900 text-4xl font-black uppercase tracking-tighter mb-6 leading-none">Access Locked</h2>
                            <p className="text-zinc-500 text-sm font-bold mb-12 uppercase tracking-[0.4em] text-[11px]">Verification required to continue exploring the Zone.</p>
                            <SignIn routing="hash" />
                        </div>
                    </div>
                </motion.div>
            )}
          </AnimatePresence>

          {modalState && <ModalViewer state={modalState} onClose={() => setModalState(null)} onNext={handleModalNext} onPrev={handleModalPrev} />}
          {isGalleryGridOpen && <GalleryGridModal items={combinedPortfolio} onClose={() => setIsGalleryGridOpen(false)} onItemClick={index => { setIsGalleryGridOpen(false); handleOpenModal(combinedPortfolio, index); }} />}
          {isServicesPopupOpen && <ServicesListPopup onClose={() => setIsServicesPopupOpen(false)} />}
          {selectionTarget && <ServiceSelectionModal platform={selectionTarget} onClose={() => setSelectionTarget(null)} />}
          {isYouTubeRedirectOpen && <YouTubeRedirectPopup onClose={() => setIsYouTubeRedirectOpen(false)} onConfirm={() => { setIsYouTubeRedirectOpen(false); handleScrollTo('video-editing'); }} />}
          {pipVideo && <VideoPipPlayer video={pipVideo} onClose={() => setPipVideo(null)} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />}
          {contextMenu && <ContextMenu x={contextMenu.x} y={contextMenu.y} onClose={() => setContextMenu(null)} onGalleryOpen={() => { setContextMenu(null); setIsGalleryGridOpen(true); }} />}
          <PwaInstallPrompt />
          <div className={`transition-all fixed bottom-0 left-0 right-0 z-40 ${(isNavVisible) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <MobileFooterNav onScrollTo={handleScrollTo} />
          </div>
      </div>
    </ParallaxProvider>
  );
}