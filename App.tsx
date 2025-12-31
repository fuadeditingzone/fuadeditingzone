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

// Enhanced SEO Utility for Rich Social Previews
const updateSEO = (title: string, desc: string, image?: string, url?: string) => {
  const finalTitle = `${title} | Fuad Editing Zone`;
  document.title = finalTitle;
  
  // Standard Meta
  document.querySelector('meta[name="description"]')?.setAttribute('content', desc);
  
  // Open Graph (Facebook/Instagram/Discord)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', finalTitle);
  document.querySelector('meta[property="og:description"]')?.setAttribute('content', desc);
  document.querySelector('meta[property="og:type"]')?.setAttribute('content', url?.includes('/work/') || url?.includes('/post/') ? 'article' : 'website');
  
  // Twitter
  document.querySelector('meta[property="twitter:title"]')?.setAttribute('content', finalTitle);
  document.querySelector('meta[property="twitter:description"]')?.setAttribute('content', desc);
  
  if (image) {
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', image);
    document.querySelector('meta[property="twitter:image"]')?.setAttribute('content', image);
    document.querySelector('meta[name="twitter:card"]')?.setAttribute('content', 'summary_large_image');
  }
  
  if (url) {
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
  }
};

export default function App() {
  const { isSignedIn, user } = useUser();
  const [route, setRoute] = useState<'home' | 'marketplace' | 'community'>(
    window.location.pathname === '/marketplace' ? 'marketplace' : 
    window.location.pathname === '/community' ? 'community' : 'home'
  );
  
  const [isYouTubeApiReady, setIsYouTubeApiReady] = useState(false);
  const [modalState, setModalState] = useState<{ items: ModalItem[]; currentIndex: number } | null>(null);
  const [targetUserId, setTargetUserId] = useState<string | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  
  const [isServicesPopupOpen, setIsServicesPopupOpen] = useState(false);
  const [isYouTubeRedirectOpen, setIsYouTubeRedirectOpen] = useState(false);
  const [activeYouTubeId, setActiveYouTubeId] = useState<string>(siteConfig.content.portfolio.animeEdits[0].videoId || 'oAEDU-nycsE');
  const [isYtPlaying, setIsYtPlaying] = useState(false);
  const [playingVfxVideo, setPlayingVfxVideo] = useState<VideoWork | null>(null);
  const [pipVideo, setPipVideo] = useState<VideoWork | null>(null);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Handle Deep Linking / Initial Routes with Preview logic
  useEffect(() => {
    const handleInitialLink = async () => {
      const path = window.location.pathname;
      
      if (path.startsWith('/work/')) {
        const id = path.split('/')[2];
        const allWorks = [
          ...siteConfig.content.portfolio.graphicWorks,
          ...siteConfig.content.portfolio.vfxEdits
        ];
        const index = allWorks.findIndex(w => String(w.id) === id);
        if (index !== -1) setModalState({ items: allWorks, currentIndex: index });
      } else if (path.startsWith('/post/')) {
        const id = path.split('/')[2];
        const postSnap = await get(ref(db, `explore_posts/${id}`));
        if (postSnap.exists()) {
          const post = { id, ...postSnap.val() };
          setModalState({ items: [post], currentIndex: 0 });
        }
      }
    };
    handleInitialLink();
  }, []);

  // Sync Global SEO when modal or route changes
  useEffect(() => {
    if (modalState) {
      const item = modalState.items[modalState.currentIndex] as any;
      const title = item.title || 'Exclusive Masterpiece';
      const desc = item.description || item.caption || "Official work from Fuad Editing Zone portfolio.";
      const img = item.imageUrl || item.thumbnailUrl || (item.mediaUrl && item.mediaType === 'image' ? item.mediaUrl : siteConfig.branding.profilePicUrl);
      const url = window.location.origin + (item.userId ? `/post/${item.id}` : `/work/${item.id}`);
      updateSEO(title, desc, img, url);
    } else {
      if (route === 'home') updateSEO(siteConfig.seo.title, siteConfig.seo.description, siteConfig.branding.profilePicUrl, window.location.origin);
      else if (route === 'marketplace') updateSEO("Marketplace", "Discover premium visual assets.", siteConfig.branding.logoUrl, window.location.origin + "/marketplace");
      else if (route === 'community') updateSEO("Community Hub", "Join the professional design network.", siteConfig.branding.logoUrl, window.location.origin + "/community");
    }
  }, [modalState, route]);

  const handleSetModal = (items: ModalItem[], index: number) => {
    const item = items[index] as any;
    const path = item.userId ? `/post/${item.id}` : `/work/${item.id}`;
    window.history.pushState(null, '', path);
    setModalState({ items, currentIndex: index });
  };

  const handleCloseModal = () => {
    const base = route === 'home' ? '/' : `/${route}`;
    window.history.pushState(null, '', base);
    setModalState(null);
  };

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (!path.includes('/work/') && !path.includes('/post/')) setModalState(null);
      setRoute(path === '/marketplace' ? 'marketplace' : path === '/community' ? 'community' : 'home');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: 'home' | 'marketplace' | 'community') => {
    setRoute(path);
    window.history.pushState(null, '', path === 'home' ? '/' : `/${path}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenProfile = (userId: string) => {
    setViewingProfileId(userId);
  };

  const handleOpenChatWithUser = (userId: string) => {
    setTargetUserId(userId);
    setViewingProfileId(null);
    navigateTo('community');
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

  const normalizedModalItems = useMemo(() => {
    if (!modalState) return [];
    return modalState.items.map(item => {
        const post = item as any;
        if (post.mediaUrl) {
            return {
                ...post,
                imageUrl: post.mediaType === 'image' ? post.mediaUrl : undefined,
                url: post.mediaType === 'video' ? post.mediaUrl : undefined,
                category: post.targetSection || 'Marketplace Post'
            };
        }
        return item;
    });
  }, [modalState]);

  return (
    <ParallaxProvider>
      <div className="text-white bg-black overflow-x-hidden flex flex-col h-[100dvh] max-h-[100dvh]">
          <VFXBackground /><MediaGridBackground />
          <div className="fixed top-0 left-0 right-0 z-[100]">
            <DesktopHeader 
              onScrollTo={handleScrollTo} 
              onNavigateMarketplace={() => navigateTo('marketplace')}
              onNavigateCommunity={() => navigateTo('community')}
              onOpenChatWithUser={handleOpenChatWithUser} 
              onOpenProfile={handleOpenProfile} 
              activeRoute={route}
            />
            <MobileHeader 
              onScrollTo={handleScrollTo} 
              onNavigateMarketplace={() => navigateTo('marketplace')}
              onNavigateCommunity={() => navigateTo('community')}
              onOpenChatWithUser={handleOpenChatWithUser} 
              onOpenProfile={handleOpenProfile} 
            />
          </div>
          
          <main className={`relative z-10 pt-20 flex-1 flex flex-col min-h-0 ${route === 'community' ? 'h-full overflow-hidden' : ''}`}>
            {route === 'home' && (
              <div className="flex flex-col">
                <Home onOpenServices={() => setIsServicesPopupOpen(true)} onOrderNow={() => handleScrollTo('contact')} onYouTubeClick={() => setIsYouTubeRedirectOpen(true)} />
                <Portfolio openModal={handleSetModal} isYouTubeApiReady={isYouTubeApiReady} playingVfxVideo={playingVfxVideo} setPlayingVfxVideo={setPlayingVfxVideo} pipVideo={pipVideo} setPipVideo={setPipVideo} activeYouTubeId={activeYouTubeId} setActiveYouTubeId={setActiveYouTubeId} isYtPlaying={isYtPlaying} setIsYtPlaying={setIsYtPlaying} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />
                <div className="py-20 text-center">
                    <button onClick={() => navigateTo('community')} className="group relative px-12 py-6 bg-red-600/10 border border-red-600/30 rounded-3xl overflow-hidden transition-all hover:bg-red-600 hover:border-red-600">
                        <span className="relative z-10 font-black uppercase tracking-[0.4em] text-sm text-red-500 group-hover:text-white transition-colors">Join Community Hub</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                </div>
                <Contact onStartOrder={() => {}} />
                <AboutAndFooter />
              </div>
            )}
            
            {route === 'marketplace' && (
              <div className="container mx-auto px-4 py-6 md:py-10 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
                <div className="text-center mb-8 md:mb-12 flex-shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-[0.8em] text-red-600 mb-4 block">Visual Ecosystem</span>
                    <h1 className="text-white text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none">Marketplace</h1>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.4em] mt-4">Discover & Collaborate Sequentially</p>
                </div>
                <ExploreFeed onOpenProfile={handleOpenProfile} onOpenModal={handleSetModal} />
              </div>
            )}

            {route === 'community' && (
              <div className="flex-1 flex flex-col min-h-0 h-full max-h-full pb-28 md:pb-6">
                <div className="text-center mb-4 md:mb-6 flex-shrink-0 px-4 mt-2">
                    <span className="text-[9px] font-black uppercase tracking-[0.6em] text-red-600 mb-1 block">Network Infrastructure</span>
                    <h1 className="text-white text-3xl md:text-5xl font-black uppercase tracking-tighter leading-none">Community Hub</h1>
                </div>
                <CommunityChat onShowProfile={handleOpenProfile} initialTargetUserId={targetUserId} />
              </div>
            )}
          </main>

          <ProfileModal 
            isOpen={!!viewingProfileId} 
            onClose={() => setViewingProfileId(null)} 
            viewingUserId={viewingProfileId} 
            onOpenModal={handleSetModal}
            onMessageUser={handleOpenChatWithUser}
          />
          {modalState && (
            <ModalViewer 
              state={{ ...modalState, items: normalizedModalItems }} 
              onClose={handleCloseModal} 
              onNext={(idx) => handleSetModal(modalState.items, idx)} 
              onPrev={(idx) => handleSetModal(modalState.items, idx)} 
            />
          )}
          {isServicesPopupOpen && <ServicesListPopup onClose={() => setIsServicesPopupOpen(false)} />}
          {isYouTubeRedirectOpen && <YouTubeRedirectPopup onClose={() => setIsYouTubeRedirectOpen(false)} onConfirm={() => { setIsYouTubeRedirectOpen(false); handleScrollTo('portfolio'); }} />}
          {pipVideo && <VideoPipPlayer video={pipVideo} onClose={() => setPipVideo(null)} currentTime={videoCurrentTime} setCurrentTime={setVideoCurrentTime} />}
          <PwaInstallPrompt />
          <MobileFooterNav onScrollTo={handleScrollTo} onNavigateMarketplace={() => navigateTo('marketplace')} onNavigateCommunity={() => navigateTo('community')} activeRoute={route} />
      </div>
    </ParallaxProvider>
  );
}