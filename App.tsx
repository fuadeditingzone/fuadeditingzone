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

  const isAnyOverlayActive = !!(showIntro || modalState || isGalleryGridOpen || singleImageViewerState || isServicesPopupOpen || selectionTarget || isYouTubeRedirectOpen || isMediaSidebarOpen || contextMenu);

  const handleInactivity = useCallback(() => {
    setIsNavVisible(true);
    if (idleTimeoutRef.current) window.clearTimeout(idleTimeoutRef.current);
    if (!isAnyOverlayActive) {
      idleTimeoutRef.current = window.setTimeout(() => { setIsNavVisible(false); }, 40000); 
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

  const combinedPortfolio = useMemo(() => {
    const graphics = siteConfig.content.portfolio.graphicWorks.map(w => ({ ...w, slug: `g-${w.id}` }));
    const vfx = siteConfig.content.portfolio.vfxEdits.map(v => ({ ...v, slug: `v-${v.id}` }));
    const anime = siteConfig.content.portfolio.animeEdits.map(a => ({ ...a, slug: `a-${a.id}` }));
    return [...graphics, ...vfx, ...anime];
  }, []);

  // --- ENHANCED SEO ENGINE (Meta Tags & JSON-LD) ---
  useEffect(() => {
    const updateMeta = (title: string, desc: string, image: string, item?: any) => {
        document.title = title;
        
        // Target all major social preview variants
        const selectors: Record<string, string> = {
            'meta[property="og:title"]': title,
            'meta[name="twitter:title"]': title,
            'meta[name="title"]': title,
            'meta[property="og:description"]': desc,
            'meta[name="description"]': desc,
            'meta[name="twitter:description"]': desc,
            'meta[property="og:image"]': image,
            'meta[name="twitter:image"]': image,
            'meta[property="og:url"]': window.location.href,
            'link[rel="canonical"]': window.location.href
        };

        // If it's a video, hint the type
        if (item && (item.videoId || item.url)) {
            selectors['meta[property="og:type"]'] = 'video.other';
        } else {
            selectors['meta[property="og:type"]'] = 'website';
        }

        Object.entries(selectors).forEach(([selector, value]) => {
            const el = document.querySelector(selector);
            if (el) {
                if (el.tagName === 'LINK') el.setAttribute('href', value);
                else el.setAttribute('content', value);
            }
        });

        // Forced high-quality dimension hints for crawlers (1200x630)
        let widthTag = document.querySelector('meta[property="og:image:width"]');
        let heightTag = document.querySelector('meta[property="og:image:height"]');
        
        if (!widthTag) {
            widthTag = document.createElement('meta');
            widthTag.setAttribute('property', 'og:image:width');
            document.head.appendChild(widthTag);
        }
        if (!heightTag) {
            heightTag = document.createElement('meta');
            heightTag.setAttribute('property', 'og:image:height');
            document.head.appendChild(heightTag);
        }
        
        widthTag.setAttribute('content', '1200');
        heightTag.setAttribute('content', '630');

        // JSON-LD Injection for Google Search Discovery
        let existingSchema = document.getElementById('fez-item-schema');
        if (existingSchema) existingSchema.remove();

        if (item) {
            const isVideo = item.videoId || item.url;
            const schemaData = isVideo ? {
                "@context": "https://schema.org",
                "@type": "VideoObject",
                "name": title,
                "description": desc,
                "thumbnailUrl": image,
                "uploadDate": new Date().toISOString(),
                "contentUrl": item.url || `https://www.youtube.com/watch?v=${item.videoId}`,
                "embedUrl": item.videoId ? `https://www.youtube.com/embed/${item.videoId}` : item.url,
                "publisher": {
                    "@type": "Organization",
                    "name": "Fuad Editing Zone",
                    "logo": { "@type": "ImageObject", "url": siteConfig.branding.logoUrl }
                }
            } : {
                "@context": "https://schema.org",
                "@type": "ImageObject",
                "contentUrl": image,
                "name": title,
                "description": desc,
                "author": "Fuad Ahmed",
                "creator": "Selected Legend"
            };

            const script = document.createElement('script');
            script.id = 'fez-item-schema';
            script.type = 'application/ld+json';
            script.text = JSON.stringify(schemaData);
            document.head.appendChild(script);
        }
    };

    if (modalState) {
        const item = modalState.items[modalState.currentIndex] as any;
        const itemTitle = item.title || 'Official Portfolio Piece';
        const itemDesc = item.description || siteConfig.seo.description;
        
        // Priority high-quality image selection
        let itemImage = siteConfig.branding.profilePicUrl;
        if (item.imageUrl) {
            itemImage = item.imageUrl;
        } else if (item.videoId) {
            // Force High Res YouTube Thumbnail for sharing
            itemImage = `https://img.youtube.com/vi/${item.videoId}/maxresdefault.jpg`;
        } else if (item.thumbnailUrl) {
            itemImage = item.thumbnailUrl;
        }

        updateMeta(`${itemTitle} | Fuad Editing Zone`, itemDesc, itemImage, item);
    } else {
        updateMeta(siteConfig.seo.title, siteConfig.seo.description, siteConfig.branding.profilePicUrl);
    }
  }, [modalState]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (!hash) {
        if (!isAnyOverlayActive) setModalState(null);
        return;
      }
      const foundIndex = combinedPortfolio.findIndex(item => (item as any).slug === hash);
      if (foundIndex !== -1 && !modalState) {
        setModalState({ items: combinedPortfolio, currentIndex: foundIndex });
        setShowIntro(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [combinedPortfolio]);

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
      if (window.YT && window.YT.Player) setIsYouTubeApiReady(true);
      else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
    }, []);

  const handleOpenModal = (items: (GraphicWork | VideoWork)[], startIndex: number) => {
      if (Array.isArray(items) && items.length > 0) {
          const itemsWithSlugs = items.map(item => {
            if ((item as any).slug) return item;
            const prefix = 'imageUrl' in item ? 'g' : ('videoId' in item ? 'a' : 'v');
            return { ...item, slug: `${prefix}-${item.id}` };
          });
          setModalState({ items: itemsWithSlugs, currentIndex: startIndex });
          setIsPortfolioMediaActive(false);
      }
  };

  const handleScrollTo = (target: 'home' | 'portfolio' | 'contact' | 'video-editing' | 'about') => {
    const element = document.getElementById(target);
    element?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleModalNext = useCallback(() => { setModalState(s => s ? { ...s, currentIndex: (s.currentIndex + 1) % s.items.length } : null); }, []);
  const handleModalPrev = useCallback(() => { setModalState(s => s ? { ...s, currentIndex: (s.currentIndex - 1 + s.items.length) % s.items.length } : null); }, []);

  return (
    <ParallaxProvider>
      <div className="text-white min-h-screen bg-black" onContextMenu={e => { e.preventDefault(); if(!isAnyOverlayActive) setContextMenu({ x: e.clientX, y: e.clientY }); }}>
          <AnimatePresence>{showIntro && <IntroPresentation onFinished={() => { localStorage.setItem('fez_intro_seen', 'true'); setShowIntro(false); }} />}</AnimatePresence>
          <VFXBackground /><MediaGridBackground />
          <div className={`transition-all fixed top-0 left-0 right-0 z-50 ${(isNavVisible && !showIntro) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
            <DesktopHeader onScrollTo={handleScrollTo} /><MobileHeader onScrollTo={handleScrollTo} />
          </div>
          <MediaSidebar isOpen={isMediaSidebarOpen} onClose={() => setIsMediaSidebarOpen(false)} activeYouTubeId={activeYouTubeId} onSelectYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
          {!isMediaSidebarOpen && !isAnyOverlayActive && (
              <button onClick={() => setIsMediaSidebarOpen(true)} className={`fixed top-24 right-0 z-40 bg-black/40 backdrop-blur-xl border-l border-t border-b border-white/10 text-white p-3 rounded-l-xl transition-all ${(isNavVisible && !showIntro) ? 'opacity-100' : 'opacity-0 translate-x-full'}`}><YouTubeIcon className="w-6 h-6 text-red-500" /></button>
          )}
          <AnimatePresence>{!showIntro && (
              <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="main-content relative z-10 pb-20 md:pb-0">
                  <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
                  <Portfolio openModal={handleOpenModal} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
                  <Contact onStartOrder={setSelectionTarget} /><AboutAndFooter />
              </motion.main>
          )}</AnimatePresence>
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