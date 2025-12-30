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
import { IntroPresentation } from './components/IntroPresentation';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

export default function App() {
  const { isSignedIn, isLoaded: isClerkLoaded } = useUser();
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') return !localStorage.getItem('fez_intro_seen');
    return true;
  });
  
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

  const isAnyOverlayActive = !!(showIntro || modalState || isGalleryGridOpen || singleImageViewerState || isServicesPopupOpen || selectionTarget || isYouTubeRedirectOpen || isMediaSidebarOpen || contextMenu || isLockActive);

  // --- 5-Minute Force Login Timer ---
  useEffect(() => {
    if (isSignedIn) {
        setIsLockActive(false);
        return;
    }

    const timer = setTimeout(() => {
        if (!isSignedIn && isClerkLoaded) {
            setIsLockActive(true);
        }
    }, 300000); // 5 minutes (300,000ms)

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

  const updateMeta = useCallback((title: string, desc: string, imageUrl: string) => {
    document.title = title;
    const mapping: Record<string, string> = {
        'meta[property="og:title"]': title,
        'meta[name="twitter:title"]': title,
        'meta[name="title"]': title,
        'meta[property="og:description"]': desc,
        'meta[name="description"]': desc,
        'meta[name="twitter:description"]': desc,
        'meta[property="og:image"]': imageUrl,
        'meta[property="og:image:secure_url"]': imageUrl,
        'meta[name="twitter:image"]': imageUrl,
        'meta[itemprop="image"]': imageUrl,
        'meta[property="og:url"]': window.location.href,
    };
    Object.entries(mapping).forEach(([sel, val]) => {
        const el = document.querySelector(sel);
        if (el) el.setAttribute('content', val);
    });
  }, []);

  useEffect(() => {
    if (modalState) {
        const item = modalState.items[modalState.currentIndex] as any;
        const itemImage = item.imageUrl || (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg` : siteConfig.branding.profilePicUrl);
        updateMeta(
            `${item.title || 'Selected Legend Art'} | FEZ Portfolio`, 
            item.description || siteConfig.seo.description, 
            itemImage
        );
    } else {
        updateMeta(siteConfig.seo.title, siteConfig.seo.description, "https://www.dropbox.com/scl/fi/uq92m0e5o05mvzt65pd43/Gemini_Generated_Image_hhs74dhhs74dhhs7.png?rlkey=kq52p7r4aetsyokvags5dx73x&raw=1");
    }
  }, [modalState, updateMeta]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) return;
      const foundIndex = combinedPortfolio.findIndex(item => (item as any).slug === hash);
      if (foundIndex !== -1 && !modalState) {
        const item = combinedPortfolio[foundIndex] as any;
        const itemImage = item.imageUrl || (item.videoId ? `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg` : siteConfig.branding.profilePicUrl);
        updateMeta(`${item.title || 'Selected Legend Art'} | FEZ Portfolio`, item.description || siteConfig.seo.description, itemImage);
        
        setModalState({ items: combinedPortfolio, currentIndex: foundIndex });
        setShowIntro(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [combinedPortfolio, updateMeta]);

  useEffect(() => {
    if (modalState) {
      const currentItem = modalState.items[modalState.currentIndex] as any;
      if (currentItem?.slug) window.history.replaceState(null, '', `#${currentItem.slug}`);
    } else if (window.location.hash && !isGalleryGridOpen && !singleImageViewerState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [modalState, isGalleryGridOpen, singleImageViewerState]);

  useEffect(() => {
      window.onYouTubeIframeAPIReady = () => setIsYouTubeApiReady(true);
      if (!(window.YT && window.YT.Player)) {
        const tag = document.createElement('script'); tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      } else setIsYouTubeApiReady(true);
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

  const handleScrollTo = (target: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleModalNext = useCallback(() => { setModalState(s => s ? { ...s, currentIndex: (s.currentIndex + 1) % s.items.length } : null); }, []);
  const handleModalPrev = useCallback(() => { setModalState(s => s ? { ...s, currentIndex: (s.currentIndex - 1 + s.items.length) % s.items.length } : null); }, []);

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black" onContextMenu={e => { e.preventDefault(); if(!isAnyOverlayActive) setContextMenu({ x: e.clientX, y: e.clientY }); }}>
          <AnimatePresence>
            {showIntro && <IntroPresentation onFinished={() => { localStorage.setItem('fez_intro_seen', 'true'); setShowIntro(false); }} />}
          </AnimatePresence>
          <VFXBackground /><MediaGridBackground />
          <div className={`transition-all fixed top-0 left-0 right-0 z-50 ${(isNavVisible && !showIntro) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <DesktopHeader onScrollTo={handleScrollTo} /><MobileHeader onScrollTo={handleScrollTo} />
          </div>
          <MediaSidebar isOpen={isMediaSidebarOpen} onClose={() => setIsMediaSidebarOpen(false)} activeYouTubeId={activeYouTubeId} onSelectYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
          {!isMediaSidebarOpen && !isAnyOverlayActive && (
              <button onClick={() => setIsMediaSidebarOpen(true)} className={`fixed top-24 right-0 z-40 bg-black/40 backdrop-blur-xl border-l border-t border-b border-white/10 text-white p-3 rounded-l-xl transition-all ${(isNavVisible && !showIntro) ? 'opacity-100' : 'opacity-0 translate-x-full'}`}><YouTubeIcon className="w-6 h-6 text-red-500" /></button>
          )}
          <AnimatePresence>
              {!showIntro && (
                  <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="main-content relative z-10 pb-20 md:pb-0">
                      <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
                      <Portfolio openModal={handleOpenModal} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
                      <Contact onStartOrder={setSelectionTarget} />
                      <AboutAndFooter onReplayIntro={() => setShowIntro(true)} />
                  </motion.main>
              )}
          </AnimatePresence>

          {/* Forced Authentication Overlay */}
          <AnimatePresence>
            {isLockActive && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100000] bg-black/90 flex flex-col items-center justify-center p-6"
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none"></div>
                    <div className="relative w-full max-w-[480px] bg-white rounded-[3rem] overflow-hidden shadow-3xl">
                        <div className="p-8 md:p-12 text-center bg-white">
                             <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-red-600/20">
                                <SparklesIcon className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-zinc-900 text-3xl font-black uppercase tracking-tight mb-4">Session Lock</h2>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-10 uppercase tracking-widest text-[10px]">Your browsing session has expired. Verification is required to access the Zone content.</p>
                            <div className="flex justify-center">
                                <SignIn 
                                    routing="hash"
                                    appearance={{
                                        elements: {
                                            rootBox: "w-full",
                                            card: "shadow-none border-none p-0",
                                            header: "hidden",
                                            footer: "hidden",
                                            formButtonPrimary: "bg-red-600 hover:bg-red-700 h-16 rounded-2xl font-black uppercase tracking-[0.4em] text-[11px] shadow-2xl transition-all",
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="mt-8 text-white/40 text-[9px] font-black uppercase tracking-[0.6em]">Fuad Editing Zone • Artist Hub Secure</p>
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
          <div className={`transition-all fixed bottom-0 left-0 right-0 z-40 ${(isNavVisible && !showIntro) ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <MobileFooterNav onScrollTo={handleScrollTo} />
          </div>
      </div>
    </ParallaxProvider>
  );
}