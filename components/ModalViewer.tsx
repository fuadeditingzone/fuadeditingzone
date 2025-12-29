import React, { useState, useEffect } from 'react';
import type { GraphicWork, VideoWork, ModalItem } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { 
    CloseIcon, ZoomInIcon, ZoomOutIcon, PlayIcon, 
    SearchIcon, MicrophoneIcon, Bars3Icon, UserCircleIcon, 
    HomeIcon, ReelsIcon, PlaylistIcon, YouTubeIcon,
    ThreeDotsIcon, CheckCircleIcon, InstagramIcon, HeartHoverIcon,
    CommentIcon, ShareIcon, BookmarkIcon, CheckCircleIcon as CheckIcon,
    EyeIcon, ChevronLeftIcon, ChevronRightIcon, DownloadIcon
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
    const channelName = "fuadeditingzone";

    if (isMobile) {
        return (
            <div className="w-full max-w-[320px] bg-black rounded-[2.5rem] overflow-hidden border-[6px] border-[#1a1a1a] shadow-2xl flex flex-col aspect-[9/19.5] max-h-[70vh]">
                <div className="h-6 flex justify-between items-center px-6 pt-1">
                    <span className="text-[10px] font-bold text-white">12:00</span>
                    <div className="flex gap-1.5 items-center"><i className="fa-solid fa-signal text-[8px]"></i><i className="fa-solid fa-wifi text-[8px]"></i></div>
                </div>
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                    <span className="font-serif text-xl font-bold text-white">Instagram</span>
                    <div className="flex items-center gap-4 text-white"><i className="fa-regular fa-heart text-xl"></i></div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black">
                    <div className="flex items-center justify-between px-3 py-2.5">
                        <div className="flex items-center gap-2">
                            <img src={channelPic} className="w-8 h-8 rounded-full object-cover" alt="" />
                            <div className="flex flex-col"><span className="text-[12px] font-bold text-white">{channelName}</span></div>
                        </div>
                    </div>
                    <div className="aspect-square w-full bg-[#121212]"><img src={imageUrl} className="w-full h-full object-contain" alt="" /></div>
                    <div className="p-3"><div className="text-[12px] font-bold text-white mb-1">12,402 likes</div><span className="font-bold text-white mr-2">{channelName}</span><span className="text-gray-200 text-xs">Cinematic manipulation piece. 🎨🔥</span></div>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full max-w-5xl mx-auto bg-black rounded-xl overflow-hidden shadow-2xl flex border border-white/10 max-h-[75vh]">
            <div className="w-60 flex flex-col p-4 border-r border-white/10 bg-[#050505]">
                <span className="font-serif text-2xl font-bold text-white px-2 py-4">Instagram</span>
                <nav className="mt-8 space-y-4 opacity-40 px-2">
                    <div className="flex items-center gap-4"><i className="fa-solid fa-house"></i><span>Home</span></div>
                    <div className="flex items-center gap-4"><i className="fa-solid fa-magnifying-glass"></i><span>Search</span></div>
                </nav>
            </div>
            <div className="flex-1 bg-black p-10 flex justify-center overflow-y-auto">
                <div className="w-full max-w-md border border-white/10 rounded-lg overflow-hidden bg-black h-fit shadow-2xl">
                    <div className="p-3 flex items-center justify-between border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <img src={channelPic} className="w-9 h-9 rounded-full object-cover p-[1px] bg-red-600" alt="" />
                            <span className="text-sm font-bold text-white">{channelName}</span>
                        </div>
                        <ThreeDotsIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="aspect-square bg-white/5"><img src={imageUrl} className="w-full h-full object-contain" alt="" /></div>
                    <div className="p-4 space-y-2">
                        <div className="flex gap-4 text-white text-2xl"><i className="fa-solid fa-heart text-red-600"></i><i className="fa-regular fa-comment"></i></div>
                        <div className="text-sm font-bold text-white">12,402 likes</div>
                        <p className="text-sm text-gray-200 leading-snug"><span className="font-bold">{channelName}</span> Visualizing the impossible at FEZ Zone. ✨</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const YouTubeMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = "fuadeditingzone";

    if (isMobile) {
        return (
            <div className="w-full max-w-[320px] bg-[#0f0f0f] rounded-[2.5rem] overflow-hidden border-[6px] border-[#1a1a1a] shadow-2xl flex flex-col aspect-[9/19.5] max-h-[70vh]">
                <div className="h-6 flex justify-between items-center px-6 pt-1"><span className="text-[10px] font-bold text-white">9:41</span><div className="w-10 h-3 bg-black rounded-full"></div></div>
                <div className="px-4 py-2"><YouTubeIcon className="w-7 h-7 text-red-600" /></div>
                <div className="flex-1 overflow-y-auto bg-[#0f0f0f]">
                    <div className="aspect-video w-full bg-black"><img src={imageUrl} className="w-full h-full object-cover" alt="" /></div>
                    <div className="p-4 flex gap-3">
                        <img src={channelPic} className="w-10 h-10 rounded-full object-cover" alt="" />
                        <div><h3 className="text-sm font-bold text-white leading-tight">Elite Design Breakdown | {channelName}</h3><p className="text-xs text-gray-400 mt-1">1.2M views • 2h</p></div>
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="w-full max-w-5xl mx-auto bg-[#0f0f0f] rounded-xl overflow-hidden shadow-2xl flex flex-col border border-white/10 max-h-[75vh]">
            <div className="h-14 flex items-center px-4 bg-[#0f0f0f] border-b border-white/5 gap-4">
                <Bars3Icon className="w-6 h-6 text-white" /><YouTubeIcon className="w-8 h-8 text-red-600" /><span className="font-bold text-xl text-white">YouTube</span>
                <div className="flex-1 max-w-xl mx-8 bg-white/5 border border-white/10 rounded-full h-10"></div>
            </div>
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="space-y-4">
                    <div className="aspect-video w-full max-w-2xl rounded-xl overflow-hidden shadow-2xl relative group">
                        <img src={imageUrl} className="w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><PlayIcon className="w-16 h-16 text-white/80" /></div>
                    </div>
                    <div className="flex gap-4">
                        <img src={channelPic} className="w-12 h-12 rounded-full object-cover" alt="" />
                        <div><h3 className="text-xl font-bold text-white">Professional Portfolio Design Series</h3><p className="text-gray-400 font-medium">{channelName} • 1.2M views</p></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const ModalViewer: React.FC<ModalViewerProps> = ({ state, onClose, onNext, onPrev }) => {
    const { items, currentIndex } = state;
    const currentItem = items[currentIndex];
    const [useMockup, setUseMockup] = useState(true);
    const [showShareToast, setShowShareToast] = useState(false);
    const [downloading, setDownloading] = useState(false);
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    // Reset mockup state when changing items
    useEffect(() => {
        setUseMockup(true);
    }, [currentIndex]);

    const isImage = (item: ModalItem): item is GraphicWork => 'imageUrl' in item;
    const isVideo = (item: ModalItem): item is VideoWork => ('url' in item || 'videoId' in item);
    const isYTThumbnail = isImage(currentItem) && currentItem.category === 'YouTube Thumbnails';
    const isManipulation = isImage(currentItem) && currentItem.category === 'Photo Manipulation';

    const handleShare = async (e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const slug = (currentItem as any).slug || `${isImage(currentItem) ? 'g' : 'v'}-${currentItem.id}`;
        const shareUrl = `${window.location.origin}${window.location.pathname}#${slug}`;
        
        const shareData = {
            title: `${currentItem.title || 'Selected Legend Art'} | Fuad Editing Zone`,
            text: `Check out this amazing work by Selected Legend: ${currentItem.description || 'Premium VFX & Design work.'}`,
            url: shareUrl
        };

        if (navigator.share) {
            try { 
                await navigator.share(shareData); 
            } catch (err) {
                // User might have cancelled or browser blocked
            }
        } else {
            navigator.clipboard.writeText(shareUrl);
            setShowShareToast(true);
            setTimeout(() => setShowShareToast(false), 2000);
        }
    };

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (downloading) return;
        
        let fileUrl = '';
        let fileName = 'FEZ_FuadEditingZone_Work.jpg';

        if (isImage(currentItem)) {
            fileUrl = currentItem.imageUrl;
            fileName = `FEZ_FuadEditingZone_${(currentItem.title || 'Art').replace(/\s+/g, '_')}.jpg`;
            
            try {
                setDownloading(true);
                // 1. Fetch original image
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                
                // 2. Create image and canvas for watermarking
                const img = new Image();
                img.crossOrigin = "anonymous";
                const imgUrl = URL.createObjectURL(blob);
                
                await new Promise((resolve, reject) => {
                    img.onload = resolve;
                    img.onerror = reject;
                    img.src = imgUrl;
                });

                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error("Could not get canvas context");

                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 3. Load and draw logo watermark
                const logo = new Image();
                logo.crossOrigin = "anonymous";
                await new Promise((resolve, reject) => {
                    logo.onload = resolve;
                    logo.onerror = reject;
                    logo.src = siteConfig.branding.logoUrl;
                });

                // Calculate logo size (e.g., 10% of image height)
                const logoHeight = Math.floor(img.height * 0.1);
                const logoWidth = Math.floor(logo.width * (logoHeight / logo.height));
                const padding = Math.floor(img.height * 0.05);

                ctx.globalAlpha = 0.4; // 40% transparency
                ctx.drawImage(
                    logo, 
                    padding, 
                    img.height - logoHeight - padding, 
                    logoWidth, 
                    logoHeight
                );

                // 4. Trigger download
                canvas.toBlob((finalBlob) => {
                    if (finalBlob) {
                        const finalUrl = URL.createObjectURL(finalBlob);
                        const link = document.createElement('a');
                        link.href = finalUrl;
                        link.download = fileName;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(finalUrl);
                    }
                    URL.revokeObjectURL(imgUrl);
                }, 'image/jpeg', 0.95);

            } catch (err) {
                console.error("Download failed, falling back", err);
                window.open(fileUrl, '_blank');
            } finally {
                setDownloading(false);
            }
            return;
        } else if (isVideo(currentItem) && currentItem.url) {
            fileUrl = currentItem.url;
            fileName = `FEZ_FuadEditingZone_${(currentItem.title || 'VFX').replace(/\s+/g, '_')}.mp4`;
        } else {
            window.open(`https://www.youtube.com/watch?v=${currentItem.videoId}`, '_blank');
            return;
        }

        try {
            setDownloading(true);
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(fileUrl, '_blank');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-[70] flex flex-col animate-fade-in overflow-hidden" onClick={onClose}>
            {isImage(currentItem) && (
                <div className="absolute inset-0 bg-cover bg-center filter blur-3xl brightness-[0.2] opacity-40 scale-110 pointer-events-none" style={{ backgroundImage: `url(${currentItem.imageUrl})` }} />
            )}

            {/* Top Bar Navigation & Controls */}
            <div className="relative z-[100] flex justify-between items-center p-4 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-3">
                    <img src={siteConfig.branding.logoUrl} className="w-8 h-8 rounded-full border border-white/20" alt="FEZ" />
                    <div className="hidden sm:block">
                        <span className="text-white font-black text-xs uppercase tracking-widest">{isImage(currentItem) ? currentItem.category : 'Cinematic Video'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {(isYTThumbnail || isManipulation) && (
                        <button 
                            onClick={() => setUseMockup(!useMockup)} 
                            className={`text-white transition-all p-2 rounded-full border ${!useMockup ? 'bg-red-600 border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                        >
                            <EyeIcon className="h-5 w-5" />
                        </button>
                    )}
                    <button 
                        onClick={handleDownload} 
                        className={`text-white/70 hover:text-white p-2 rounded-full bg-white/5 border border-white/10 transition-all ${downloading ? 'animate-pulse' : ''}`}
                    >
                        <DownloadIcon className="h-5 w-5" />
                    </button>
                    <button onClick={onClose} className="text-white/70 hover:text-white p-2 rounded-full bg-white/5 border border-white/10 transition-all">
                        <CloseIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Main Content Viewer */}
            <div className="flex-1 relative w-full flex items-center justify-center p-2 sm:p-4 md:p-8" onClick={onClose}>
                <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    {isImage(currentItem) ? (
                        (useMockup && isYTThumbnail) ? <YouTubeMockup imageUrl={currentItem.imageUrl} /> :
                        (useMockup && isManipulation) ? <InstagramMockup imageUrl={currentItem.imageUrl} /> :
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full h-full flex items-center justify-center"
                        >
                            <img 
                                src={currentItem.imageUrl} 
                                alt={currentItem.title || "Portfolio Work"} 
                                className="max-w-full max-h-full object-contain rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/5" 
                            />
                        </motion.div>
                    ) : isVideo(currentItem) ? (
                        <div className="w-full max-w-5xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden border border-white/10">
                            {currentItem.url ? <video src={currentItem.url} controls autoPlay className="w-full h-full" /> : 
                            <iframe src={`https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1`} title="VFX Reel" frameBorder="0" allowFullScreen className="w-full h-full"></iframe>}
                        </div>
                    ) : null}

                    {/* Nav Buttons */}
                    <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 rounded-full transition-all group">
                        <ChevronLeftIcon className="w-10 h-10 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 rounded-full transition-all group">
                        <ChevronRightIcon className="w-10 h-10 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Bottom Info & Share Bar */}
            <div className="relative z-[100] bg-black/90 backdrop-blur-3xl border-t border-white/10 p-4 md:p-6" onClick={e => e.stopPropagation()}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                             <h3 className="text-white font-black text-lg md:text-xl uppercase tracking-tight truncate">
                                {currentItem.title || 'Untitled Masterpiece'}
                             </h3>
                             <span className="bg-red-600/10 text-red-500 border border-red-500/20 text-[8px] px-1.5 py-0.5 rounded font-black uppercase tracking-widest whitespace-nowrap">
                                {isImage(currentItem) ? currentItem.category : 'VFX Edit'}
                             </span>
                        </div>
                        <p className="text-gray-400 text-[10px] md:text-xs font-medium leading-relaxed max-w-2xl line-clamp-2 sm:line-clamp-1">
                            {currentItem.description || 'Exclusive creative project by Fuad Ahmed at Fuad Editing Zone.'}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button 
                            onClick={() => handleShare()}
                            className="flex-1 sm:flex-none btn-angular bg-red-600 hover:bg-red-700 text-white font-black py-3 px-8 flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 group"
                        >
                            <ShareIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span className="uppercase tracking-[0.2em] text-[10px] md:text-xs">Share Project</span>
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {showShareToast && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl z-[120]">
                        Link copied to clipboard
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const GalleryGridModal: React.FC<{
  items: ModalItem[];
  onClose: () => void;
  onItemClick: (index: number) => void;
}> = ({ items, onClose, onItemClick }) => {
    return (
        <div className="fixed inset-0 bg-black/98 z-[100] flex flex-col animate-fade-in" onClick={onClose}>
            <div className="p-6 flex justify-between items-center border-b border-white/5 bg-black">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">Master Gallery</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-gray-400"><CloseIcon className="w-6 h-6" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar" onClick={e => e.stopPropagation()}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {items.map((item, index) => (
                        <div key={index} onClick={() => onItemClick(index)} className="aspect-square bg-white/5 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-600 transition-all group">
                            {'imageUrl' in item ? (
                                <img src={item.imageUrl} alt={item.title || "Portfolio Art"} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                            ) : (
                                <div className="w-full h-full relative">
                                    <img src={item.thumbnailUrl || `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} alt={item.title || "Video Work"} className="w-full h-full object-cover group-hover:scale-110 transition-all" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40"><PlayIcon className="w-8 h-8 text-white/80" /></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};