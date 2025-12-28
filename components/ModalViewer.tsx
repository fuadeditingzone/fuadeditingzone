
import React, { useState, useEffect } from 'react';
import type { GraphicWork, VideoWork, ModalItem } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { 
    CloseIcon, ZoomInIcon, ZoomOutIcon, PlayIcon, 
    SearchIcon, MicrophoneIcon, Bars3Icon, UserCircleIcon, 
    HomeIcon, ReelsIcon, PlaylistIcon, YouTubeIcon,
    ThreeDotsIcon, CheckCircleIcon, InstagramIcon, HeartHoverIcon,
    CommentIcon, ShareIcon, BookmarkIcon, CheckCircleIcon as CheckIcon,
    EyeIcon, ChevronLeftIcon, ChevronRightIcon
} from './Icons';
import { siteConfig } from '../config';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalViewerProps {
  state: { items: ModalItem[]; currentIndex: number };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const InstagramMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = siteConfig.branding.author.toLowerCase().replace(/\s+/g, '_');

    if (isMobile) {
        return (
            <div className="w-full max-w-[320px] sm:max-w-[360px] bg-black rounded-[2.5rem] overflow-hidden border-[6px] md:border-[8px] border-[#1a1a1a] shadow-2xl flex flex-col aspect-[9/19.5] max-h-[85vh] self-center">
                <div className="h-6 flex justify-between items-center px-6 pt-1">
                    <span className="text-[10px] font-bold text-white">12:00</span>
                    <div className="flex gap-1.5 items-center">
                        <i className="fa-solid fa-signal text-[8px]"></i>
                        <i className="fa-solid fa-wifi text-[8px]"></i>
                        <i className="fa-solid fa-battery-full text-[10px]"></i>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                    <span className="font-serif text-xl font-bold tracking-tight text-white">Instagram</span>
                    <div className="flex items-center gap-4 text-white">
                        <i className="fa-regular fa-heart text-xl"></i>
                        <i className="fa-regular fa-comment-dots text-xl"></i>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                    <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10">
                                <img src={channelPic} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                                <div className="flex items-center gap-1">
                                    <span className="text-[12px] font-bold text-white">{channelName}</span>
                                    <CheckCircleIcon className="w-3 h-3 text-blue-500" />
                                </div>
                                <span className="text-[9px] text-gray-400">Sylhet, Bangladesh</span>
                            </div>
                        </div>
                        <ThreeDotsIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="aspect-square w-full bg-[#121212] flex items-center justify-center">
                        <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="p-3 space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <i className="fa-solid fa-heart text-red-600 text-xl"></i>
                                <i className="fa-regular fa-comment text-xl text-white"></i>
                                <i className="fa-regular fa-paper-plane text-xl text-white"></i>
                            </div>
                            <i className="fa-regular fa-bookmark text-xl text-white"></i>
                        </div>
                        <div className="text-[12px] font-bold text-white">12,402 likes</div>
                        <div className="text-[12px] leading-tight">
                            <span className="font-bold text-white mr-2">{channelName}</span>
                            <span className="text-gray-200">New cinematic manipulation piece. Bringing art to life at FEZ Zone! 🎨🔥</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div className="w-full max-w-5xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 max-h-[90vh]">
                <div className="flex flex-1 min-h-0">
                    <div className="w-20 lg:w-60 flex flex-col p-4 border-r border-white/10 gap-8">
                        <div className="px-2 py-4 mb-4">
                            <span className="hidden lg:block font-serif text-2xl font-bold text-white">Instagram</span>
                            <InstagramIcon className="lg:hidden w-7 h-7 text-white" />
                        </div>
                        <nav className="flex flex-col gap-2 opacity-40">
                             <div className="flex items-center gap-4 p-3"><i className="fa-solid fa-house text-xl text-white"></i><span className="hidden lg:block">Home</span></div>
                             <div className="flex items-center gap-4 p-3"><i className="fa-solid fa-magnifying-glass text-xl"></i><span className="hidden lg:block">Search</span></div>
                        </nav>
                    </div>
                    <div className="flex-1 bg-black p-4 md:p-10 overflow-y-auto custom-scrollbar flex justify-center">
                        <div className="w-full max-w-md border border-white/10 rounded-lg overflow-hidden bg-black h-fit">
                            <div className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full overflow-hidden p-[1.5px] bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600">
                                        <img src={channelPic} alt="" className="w-full h-full rounded-full border border-black object-cover" />
                                    </div>
                                    <span className="text-sm font-bold text-white">{channelName}</span>
                                </div>
                                <ThreeDotsIcon className="w-4 h-4 text-white" />
                            </div>
                            <div className="aspect-square bg-white/5 flex items-center justify-center">
                                <img src={imageUrl} alt="" className="w-full h-full object-contain" />
                            </div>
                            <div className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <i className="fa-solid fa-heart text-red-600 text-2xl"></i>
                                        <i className="fa-regular fa-comment text-2xl text-white"></i>
                                        <i className="fa-regular fa-paper-plane text-2xl text-white"></i>
                                    </div>
                                    <i className="fa-regular fa-bookmark text-2xl text-white"></i>
                                </div>
                                <div className="text-sm font-bold text-white">12,402 likes</div>
                                <div className="text-sm">
                                    <span className="font-bold text-white mr-2">{channelName}</span>
                                    <span className="text-gray-200">The evolution of digital composite. Visualizing the impossible at FEZ Zone. ✨</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

const YouTubeMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = siteConfig.branding.author;

    if (isMobile) {
        return (
            <div className="w-full max-w-[320px] sm:max-w-[360px] bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden border-[6px] md:border-[8px] border-[#1a1a1a] shadow-2xl flex flex-col aspect-[9/19.5] max-h-[85vh] self-center">
                <div className="h-6 md:h-8 flex justify-between items-center px-6 pt-1 md:pt-2">
                    <span className="text-[10px] font-bold text-white">9:41</span>
                    <div className="w-10 h-3 bg-black rounded-full"></div>
                </div>
                <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f0f]">
                    <YouTubeIcon className="w-7 h-7 text-red-600" />
                    <div className="flex items-center gap-4 text-white opacity-60">
                         <SearchIcon className="w-5 h-5" />
                         <div className="w-6 h-6 rounded-full bg-gray-800"></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#0f0f0f] custom-scrollbar">
                    <div className="w-full">
                        <div className="aspect-video w-full bg-black">
                            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4 flex gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                <img src={channelPic} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-white leading-tight">Professional YouTube Thumbnail Breakdown | Selected Legend</h3>
                                <p className="mt-1 text-xs text-gray-400 font-medium">{channelName} • 1.2M views • 2h</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="h-14 border-t border-white/10 flex justify-around items-center px-2 opacity-50">
                    <HomeIcon className="w-6 h-6 text-white" />
                    <ReelsIcon className="w-6 h-6" />
                    <UserCircleIcon className="w-6 h-6" />
                </div>
            </div>
        );
    } else {
        return (
            <div className="w-full max-w-5xl mx-auto bg-[#0f0f0f] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 max-h-[90vh]">
                <div className="h-14 flex items-center justify-between px-4 bg-[#0f0f0f] flex-shrink-0 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <Bars3Icon className="w-6 h-6 text-white" />
                        <YouTubeIcon className="w-8 h-8 text-red-600" />
                        <span className="font-bold text-xl tracking-tighter text-white">YouTube</span>
                    </div>
                    <div className="flex-1 max-w-xl mx-8 bg-white/5 border border-white/10 rounded-full h-10"></div>
                    <div className="flex items-center gap-4"><UserCircleIcon className="w-8 h-8 text-white opacity-40" /></div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-3">
                            <div className="aspect-video w-full rounded-xl overflow-hidden relative shadow-lg">
                                <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1 rounded">10:45</span>
                            </div>
                            <div className="flex gap-3">
                                <img src={channelPic} alt="" className="w-full h-full rounded-full w-9 h-9 object-cover" />
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold text-white">Elite Design Mastery • Fuad Editing Zone</h3>
                                    <p className="text-xs text-gray-500">{channelName} • 1.2M views</p>
                                </div>
                            </div>
                        </div>
                        {[1, 2].map(i => <div key={i} className="aspect-video bg-white/5 rounded-xl opacity-20"></div>)}
                    </div>
                </div>
            </div>
        );
    }
};

export const ModalViewer: React.FC<ModalViewerProps> = ({ state, onClose, onNext, onPrev }) => {
    const { items, currentIndex } = state;
    const currentItem = items[currentIndex];
    const [isZoomed, setIsZoomed] = useState(false);
    const [useMockup, setUseMockup] = useState(true);
    const [showShareToast, setShowShareToast] = useState(false);
    
    useEffect(() => {
        setIsZoomed(false);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onClose]);

    const isImage = (item: ModalItem): item is GraphicWork => 'imageUrl' in item;
    const isVideo = (item: ModalItem): item is VideoWork => ('url' in item || 'videoId' in item);
    
    const isYouTubeThumbnail = isImage(currentItem) && currentItem.category === 'YouTube Thumbnails';
    const isInstagramMockup = isImage(currentItem) && currentItem.category === 'Photo Manipulation';

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const slug = (currentItem as any).slug || `${isImage(currentItem) ? 'g' : 'v'}-${currentItem.id}`;
        const shareUrl = `${window.location.origin}${window.location.pathname}#${slug}`;
        if (navigator.share) {
            try { await navigator.share({ title: 'FEZ Portfolio Piece', url: shareUrl }); } catch (err) {}
        } else {
            navigator.clipboard.writeText(shareUrl);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[70] flex items-center justify-center animate-fade-in p-4 md:p-12 overflow-hidden" onClick={onClose}>
            {isImage(currentItem) && (
                <div className="absolute inset-0 bg-cover bg-center filter blur-3xl brightness-50 opacity-40" style={{ backgroundImage: `url(${currentItem.imageUrl})` }} />
            )}

            <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                {isImage(currentItem) ? (
                    (useMockup && isYouTubeThumbnail) ? <YouTubeMockup imageUrl={currentItem.imageUrl} /> :
                    (useMockup && isInstagramMockup) ? <InstagramMockup imageUrl={currentItem.imageUrl} /> :
                    <div className={`w-full h-full flex items-center justify-center ${isZoomed ? 'overflow-auto' : 'overflow-hidden'}`}>
                        <img src={currentItem.imageUrl} alt="Portfolio Work" className={`rounded-lg drop-shadow-2xl transition-all ${isZoomed ? 'max-w-none' : 'max-w-full max-h-full object-contain'}`} />
                    </div>
                ) : isVideo(currentItem) ? (
                    <div className="w-full max-w-5xl aspect-video bg-black rounded-lg shadow-2xl overflow-hidden">
                        {currentItem.url ? <video src={currentItem.url} controls autoPlay className="w-full h-full" /> : 
                        <iframe src={`https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1`} title="VFX" frameBorder="0" allowFullScreen className="w-full h-full"></iframe>}
                    </div>
                ) : null}
            </div>

            <div className="absolute top-4 right-4 flex gap-2 z-[100]">
                 {(isYouTubeThumbnail || isInstagramMockup) && (
                    <button onClick={() => setUseMockup(!useMockup)} className={`text-white/70 hover:text-white transition-colors p-2.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm flex items-center gap-2 px-4 ${!useMockup ? 'bg-red-600 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]' : ''}`}>
                        <EyeIcon className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">{useMockup ? 'View Raw' : 'Mockup Active'}</span>
                    </button>
                 )}
                 <button onClick={handleShare} className="text-white/70 hover:text-white transition-colors p-2.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm"><ShareIcon className="h-6 w-6" /></button>
                 <button onClick={onClose} className="text-white/70 hover:text-white transition-colors p-2.5 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm"><CloseIcon className="h-6 w-6" /></button>
            </div>

            <AnimatePresence>
                {showShareToast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl z-[120]">
                        Link Copied
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 md:p-3 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm"><ChevronLeftIcon className="w-8 h-8" /></button>
            <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-2 md:p-3 rounded-full bg-black/50 border border-white/10 backdrop-blur-sm"><ChevronRightIcon className="w-8 h-8" /></button>
        </div>
    );
};

// FIX: Added GalleryGridModal to provide the missing export for index-based browsing.
export const GalleryGridModal: React.FC<{
  items: ModalItem[];
  onClose: () => void;
  onItemClick: (index: number) => void;
}> = ({ items, onClose, onItemClick }) => {
    return (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-fade-in" onClick={onClose}>
            <div className="p-6 flex justify-between items-center border-b border-white/10 bg-black/50 backdrop-blur-md">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Works Gallery</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400 transition-colors">
                    <CloseIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {items.map((item, index) => (
                        <div 
                            key={index} 
                            onClick={() => onItemClick(index)}
                            className="aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-600 transition-all group"
                        >
                            {'imageUrl' in item ? (
                                <img src={item.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <div className="w-full h-full relative">
                                    <img src={item.thumbnailUrl || `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <PlayIcon className="w-8 h-8 text-white/80" />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
