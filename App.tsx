import React, { useState, useEffect, useCallback, useMemo } from 'react';

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
import { SpecialServicesPopup } from './components/SpecialServicesPopup';
import { MediaSidebar } from './components/MediaSidebar';
import { YouTubeIcon } from './components/Icons';
import { ParallaxProvider } from './contexts/ParallaxContext';
import { MediaGridBackground } from './components/MediaGridBackground';
import { ServicesListPopup } from './components/ServicesListPopup';
import { VideoPipPlayer } from './components/VideoPipPlayer';
import { ServiceSelectionModal } from './components/ServiceSelectionModal';

export default function App() {
  // --- UI State ---
  const [isSpecialServicesOpen, setIsSpecialServicesOpen] = useState(false);
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [isGalleryGridOpen, setIsGalleryGridOpen] = useState(false);
  const [singleImageViewerState, setSingleImageViewerState] = useState<{ items: GraphicWork[]; currentIndex: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [activeVfxSubTab, setActiveVfxSubTab] = useState<VfxSubTab>('anime');
  const [isMediaSidebarOpen, setIsMediaSidebarOpen] = useState(false);
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [selectionTarget, setSelectionTarget] = useState<'whatsapp' | 'email' | null>(null);
  
  // --- Global Video State ---
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0]?.videoId || '');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [isPortfolioMediaActive, setIsPortfolioMediaActive] = useState(false);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Initial Logic on Mount
  useEffect(() => {
    const hasSeenSpecial = localStorage.getItem('hasSeenSpecialServices') === 'true';
    if (!hasSeenSpecial) {
        setIsSpecialServicesOpen(true);
    }
  }, []);

  // Combined Portfolio for Gallery
  const combinedPortfolio = useMemo(() => {
    return [
        ...siteConfig.content.portfolio.graphicWorks,
        ...siteConfig.content.portfolio.vfxEdits,
        ...siteConfig.content.portfolio.animeEdits
    ];
  }, []);

  const anyModalOpen = modalState || isGalleryGridOpen || !!singleImageViewerState || isSpecialServicesOpen || isServicesPopupOpen || !!selectionTarget;

  const handleSpecialServicesClosed = () => {
      setIsSpecialServicesOpen(false);
      localStorage.setItem('hasSeenSpecialServices', 'true');
  };

  const handleGlobalClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, a, iframe, .interactive-3d-card, [role="dialog"]');
    if (isInteractive) return;
  };

  useEffect(() => {
      // Synchronize PiP if sidebar changes active video while PiP is active
      if (pipVideo?.id === 'yt-pip' && pipVideo.videoId !== activeYouTubeId) {
          setPipVideo({ id: 'yt-pip', videoId: activeYouTubeId });
          setVideoCurrentTime(0); // Reset time when video identity changes
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

  const handleScrollTo = (section: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => {
    const element = document.getElementById(section);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if(anyModalOpen) return;
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

  return (
    <ParallaxProvider>
      <div 
        className="text-white min-h-screen" 
        onContextMenu={handleContextMenu} 
        onClick={handleGlobalClick}
      >
          <VFXBackground />
          <MediaGridBackground />
          {isSpecialServicesOpen && <SpecialServicesPopup onClose={handleSpecialServicesClosed} />}
          
          <DesktopHeader onScrollTo={handleScrollTo} />
          <MobileHeader onScrollTo={handleScrollTo} />
          
          {/* Media Sidebar & Toggle */}
          <MediaSidebar 
            isOpen={isMediaSidebarOpen} 
            onClose={() => setIsMediaSidebarOpen(false)} 
            activeYouTubeId={activeYouTubeId}
            onSelectYouTubeId={setActiveYouTubeId}
            isYtPlaying={isYtPlaying}
            setIsYtPlaying={setIsYtPlaying}
          />
          {!isMediaSidebarOpen && !anyModalOpen && (
              <button
                  onClick={() => setIsMediaSidebarOpen(true)}
                  className="fixed top-24 right-0 z-40 bg-black/40 backdrop-blur-xl border-l border-t border-b border-white/10 text-white p-3 rounded-l-xl shadow-2xl hover:bg-red-600/50 hover:pl-5 transition-all duration-300 group"
                  aria-label="Open YouTube Sidebar"
              >
                  <YouTubeIcon className="w-6 h-6 text-red-500 group-hover:text-white transition-all" />
              </button>
          )}

          <main className="main-content relative z-10 pb-20 md:pb-0">
              <Home 
                onOpenServices={() => setIsServicesPopupOpen(true)} 
                onOrderNow={() => handleScrollTo('contact')}
              />
              <Portfolio 
                  openModal={handleOpenModal}
                  activeVfxSubTab={activeVfxSubTab}
                  setActiveVfxSubTab={setActiveVfxSubTab}
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
          </main>

          {/* Modals & Popups */}
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

          {pipVideo && (
              <VideoPipPlayer
                  video={pipVideo}
                  onClose={() => {
                      // Manual dismissal stops the video entirely to prevent re-opening
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
          
          {/* Mobile Footer Nav */}
          <MobileFooterNav onScrollTo={handleScrollTo} />
      </div>
    </ParallaxProvider>
  );
}