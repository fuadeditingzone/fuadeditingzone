import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
import { YouTubeIcon } from './components/Icons';
import { ParallaxProvider } from './contexts/ParallaxContext';
import { MediaGridBackground } from './components/MediaGridBackground';
import { ServicesListPopup } from './components/ServicesListPopup';
import { VideoPipPlayer } from './components/VideoPipPlayer';
import { ServiceSelectionModal } from './components/ServiceSelectionModal';
import { YouTubeRedirectPopup } from './components/YouTubeRedirectPopup';
import { IntroPresentation } from './components/IntroPresentation';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';

export default function App() {
  // --- UI State ---
  const [showIntro, setShowIntro] = useState(() => {
    // Check if user has already seen the intro
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('fez_intro_seen');
    }
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
  
  // --- Navigation Idle Visibility ---
  const [isNavVisible, setIsNavVisible] = useState(true);
  const idleTimeoutRef = useRef<number | null>(null);

  // --- Global Video State ---
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0]?.videoId || '');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [isPortfolioMediaActive, setIsPortfolioMediaActive] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Check if any UI overlay is active to prevent hiding nav
  const isAnyOverlayActive = !!(
    showIntro ||
    modalState || 
    isGalleryGridOpen || 
    singleImageViewerState || 
    isServicesPopupOpen || 
    selectionTarget || 
    isYouTubeRedirectOpen || 
    isMediaSidebarOpen ||
    contextMenu
  );

  // --- Navigation Visibility Inactivity Logic ---
  const handleInactivity = useCallback(() => {
    setIsNavVisible(true);
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    
    if (!isAnyOverlayActive) {
      idleTimeoutRef.current = window.setTimeout(() => {
        setIsNavVisible(false);
      }, 40000); 
    }
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

  // Combined Portfolio for Gallery
  const combinedPortfolio = useMemo(() => {
    return [
        ...siteConfig.content.portfolio.graphicWorks,
        ...siteConfig.content.portfolio.vfxEdits,
        ...siteConfig.content.portfolio.animeEdits
    ];
  }, []);

  const handleGlobalClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, iframe, .interactive-3d-card, [role="dialog"]');
    if (isInteractive) return;
  };

  useEffect(() => {
      if (pipVideo?.id === 'yt-pip' && pipVideo.videoId !== activeYouTubeId) {
          setPipVideo({ id: 'yt-pip', videoId: activeYouTubeId });
          setVideoCurrentTime(0);
      }
  }, [activeYouTubeId, pipVideo]);

  useEffect(() => {
      window.onYouTubeIframeAPIReady = () => setIsYouTubeApiReady(true);
  
      if (window.YT && window.YT.Player) {
        setIsYouTubeApiReady(true);
      } else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        if (firstScriptTag && firstScriptTag.parentNode) {
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
          document.head.appendChild(tag);
        }
      }
    }, []);

  const handleOpenModal = (items: (GraphicWork | VideoWork)[], startIndex: number) => {
      if (Array.isArray(items) && items.length > 0) {
          setModalState({ items, currentIndex: startIndex });
          setIsPortfolioMediaActive(false);
      }
  };

  const handleScrollTo = (target: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => {
    const element = document.getElementById(target);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if(isAnyOverlayActive) return;
    setContextMenu({ x: e.clientX, y: e.clientY });
  };
  
  const handleModalNext = useCallback(() => {
    setModalState(s => s ? { ...s, currentIndex: (s.currentIndex + 1) % s.items.length } : null);
  }, []);

  const handleModalPrev = useCallback(() => {
    setModalState(s => s ? { ...s, currentIndex: (s.currentIndex - 1 + s.items.length) % s.items.length } : null);
  }, []);

  const handleSingleImageNext = useCallback(() => {
    setSingleImageViewerState(s => s ? { ...s, currentIndex: (s.currentIndex + 1) % s.items.length } : null);
  }, []);

  const handleSingleImagePrev = useCallback(() => {
    setSingleImageViewerState(s => s ? { ...s, currentIndex: (s.currentIndex - 1 + s.items.length) % s.items.length } : null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!modalState && !singleImageViewerState) return;

        if (modalState) {
            if (e.key === 'ArrowRight') handleModalNext();
            if (e.key === 'ArrowLeft') handleModalPrev();
        }
        if (singleImageViewerState) {
            if (e.key === 'ArrowRight') handleSingleImageNext();
            if (e.key === 'ArrowLeft') handleSingleImagePrev();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState, singleImageViewerState, handleModalNext, handleModalPrev, handleSingleImageNext, handleModalPrev]);

  // Handle intro finish
  const handleIntroFinished = () => {
    localStorage.setItem('fez_intro_seen', 'true');
    setShowIntro(false);
  };

  // Transition styles
  const navTransitionClass = (isNavVisible && !showIntro)
    ? 'opacity-100 translate-y-0 duration-200 pointer-events-auto' 
    : 'opacity-0 -translate-y-2 duration-1000 pointer-events-none';

  const footerTransitionClass = (isNavVisible && !showIntro)
    ? 'opacity-100 translate-y-0 duration-200 pointer-events-auto'
    : 'opacity-0 translate-y-10 duration-1000 pointer-events-none';

  const sidebarBtnTransitionClass = (isNavVisible && !showIntro)
    ? 'opacity-100 translate-x-0 duration-200 pointer-events-auto'
    : 'opacity-0 translate-x-full duration-1000 pointer-events-none';

  return (
    <ParallaxProvider>
      <div 
        className="text-white min-h-screen bg-black" 
        onContextMenu={handleContextMenu} 
        onClick={handleGlobalClick}
      >
          <AnimatePresence>
            {showIntro && (
              <IntroPresentation onFinished={handleIntroFinished} />
            )}
          </AnimatePresence>

          <VFXBackground />
          <MediaGridBackground />

          <div className={`transition-all ease-out fixed top-0 left-0 right-0 z-50 ${navTransitionClass}`}>
            <DesktopHeader onScrollTo={handleScrollTo} />
            <MobileHeader onScrollTo={handleScrollTo} />
          </div>

          <MediaSidebar 
            isOpen={isMediaSidebarOpen} 
            onClose={() => setIsMediaSidebarOpen(false)} 
            activeYouTubeId={activeYouTubeId}
            onSelectYouTubeId={setActiveYouTubeId}
            isYtPlaying={isYtPlaying}
            setIsYtPlaying={setIsYtPlaying}
            onYouTubeClick={() => setIsYouTubeRedirectOpen(true)}
          />

          {!isMediaSidebarOpen && !isAnyOverlayActive && (
              <button
                  onClick={() => setIsMediaSidebarOpen(true)}
                  className={`fixed top-24 right-0 z-40 bg-black/40 backdrop-blur-xl border-l border-t border-b border-white/10 text-white p-3 rounded-l-xl shadow-2xl hover:bg-red-600/50 hover:pl-5 transition-all ease-out group ${sidebarBtnTransitionClass}`}
                  aria-label="Open YouTube Sidebar"
              >
                  <YouTubeIcon className="w-6 h-6 text-red-500 group-hover:text-white transition-all" />
              </button>
          )}

          <AnimatePresence>
            {!showIntro && (
              <motion.main 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="main-content relative z-10 pb-20 md:pb-0"
              >
                  <Home 
                    onOpenServices={() => setIsServicesPopupOpen(true)} 
                    onOrderNow={() => handleScrollTo('contact')}
                    onYouTubeClick={() => setIsYouTubeRedirectOpen(true)}
                  />
                  
                  <Portfolio 
                      openModal={handleOpenModal}
                      isYouTubeApiReady={isYouTubeApiReady}
                      playingVfxVideo={playingVfxVideo}
                      setPlayingVfxVideo={setPlayingVfxVideo}
                      pipVideo={pipVideo}
                      setPipVideo={setPipVideo}
                      activeYouTubeId={activeYouTubeId}
                      setActiveYouTubeId={setActiveYouTubeId}
                      isYtPlaying={isYtPlaying}
                      setIsYtPlaying={setIsYtPlaying}
                      onPortfolioPlay={() => {
                          setIsPortfolioMediaActive(true);
                      } }
                      currentTime={videoCurrentTime}
                      setCurrentTime={setVideoCurrentTime}
                  />
                  <Contact onStartOrder={setSelectionTarget} />
                  <AboutAndFooter />
              </motion.main>
            )}
          </AnimatePresence>

          {modalState && (
              <ModalViewer
                  state={modalState}
                  onClose={() => setModalState(null)}
                  onNext={handleModalNext}
                  onPrev={handleModalPrev}
              />
          )}

          {isGalleryGridOpen && (
              <GalleryGridModal 
                  items={combinedPortfolio} 
                  onClose={() => setIsGalleryGridOpen(false)}
                  onItemClick={(index) => {
                      setIsGalleryGridOpen(false);
                      handleOpenModal(combinedPortfolio, index);
                  }}
              />
          )}
          
          {singleImageViewerState && (
              <ModalViewer
                  state={singleImageViewerState}
                  onClose={() => setSingleImageViewerState(null)}
                  onNext={handleSingleImageNext}
                  onPrev={handleSingleImagePrev}
              />
          )}

          {isServicesPopupOpen && (
              <ServicesListPopup onClose={() => setIsServicesPopupOpen(false)} />
          )}

          {selectionTarget && (
                <ServiceSelectionModal 
                    platform={selectionTarget} 
                    onClose={() => setSelectionTarget(null)} 
                />
          )}

          {isYouTubeRedirectOpen && (
              <YouTubeRedirectPopup 
                  onClose={() => setIsYouTubeRedirectOpen(false)}
                  onConfirm={() => {
                      setIsYouTubeRedirectOpen(false);
                      setIsMediaSidebarOpen(false);
                      handleScrollTo('video-editing');
                  }}
              />
          )}

          {pipVideo && (
              <VideoPipPlayer
                  video={pipVideo}
                  onClose={() => {
                      setPipVideo(null);
                      setPlayingVfxVideo(null);
                      setIsYtPlaying(false);
                      setIsPortfolioMediaActive(false);
                      setVideoCurrentTime(0);
                  }}
                  currentTime={videoCurrentTime}
                  setCurrentTime={setVideoCurrentTime}
              />
          )}

          {contextMenu && (
              <ContextMenu 
                  x={contextMenu.x} 
                  y={contextMenu.y} 
                  onClose={() => setContextMenu(null)}
                  onGalleryOpen={() => {
                      setContextMenu(null);
                      setIsGalleryGridOpen(true);
                  }}
              />
          )}
          
          <PwaInstallPrompt />

          <div className={`transition-all ease-out fixed bottom-0 left-0 right-0 z-40 ${footerTransitionClass}`}>
            <MobileFooterNav onScrollTo={handleScrollTo} />
          </div>
      </div>
    </ParallaxProvider>
  );
}