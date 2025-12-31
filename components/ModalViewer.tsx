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
  onNext: (idx: number) => void;
  onPrev: (idx: number) => void;
}

const InstagramMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = "fuadeditingzone";

    return (
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
    );
};

const YouTubeMockup: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    const channelPic = siteConfig.branding.profilePicUrl;
    const channelName = "fuadeditingzone";

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
    
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const isImage = (item: ModalItem): item is GraphicWork => 'imageUrl' in item;
    const isVideo = (item: ModalItem): item is VideoWork => ('url' in item || 'videoId' in item);
    const isYTThumbnail = isImage(currentItem) && currentItem.category === 'YouTube Thumbnails';
    const isManipulation = isImage(currentItem) && currentItem.category === 'Photo Manipulation';

    const handleShare = () => {
        const url = `${window.location.origin}/portfolio/${currentItem.id}`;
        navigator.clipboard.writeText(url);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col animate-fade-in overflow-hidden" onClick={onClose}>
            {isImage(currentItem) && (
                <div className="absolute inset-0 bg-cover bg-center filter blur-3xl brightness-[0.2] opacity-40 scale-110 pointer-events-none" style={{ backgroundImage: `url(${currentItem.imageUrl})` }} />
            )}

            <div className="relative z-[100] flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent flex-shrink-0">
                <div className="flex items-center gap-3">
                    <img src={siteConfig.branding.logoUrl} className="w-10 h-10 rounded-full border border-white/20" alt="FEZ" />
                    <span className="text-white font-black text-xs uppercase tracking-widest">{isImage(currentItem) ? currentItem.category : 'Cinematic Video'}</span>
                </div>
                <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    {(isYTThumbnail || isManipulation) && (
                        <button onClick={() => setUseMockup(!useMockup)} className={`text-white p-3 rounded-full border transition-all ${!useMockup ? 'bg-red-600 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}>
                            <EyeIcon className="h-6 w-6" />
                        </button>
                    )}
                    <button onClick={onClose} className="text-white p-3 rounded-full bg-white/5 border border-white/10 hover:bg-red-600 transition-all">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            <div className="flex-1 relative w-full flex items-center justify-center p-4 md:p-12 overflow-hidden" onClick={onClose}>
                <div className="relative w-full h-full flex items-center justify-center" onClick={e => e.stopPropagation()}>
                    {isImage(currentItem) ? (
                        (useMockup && isYTThumbnail) ? <YouTubeMockup imageUrl={currentItem.imageUrl} /> :
                        (useMockup && isManipulation) ? <InstagramMockup imageUrl={currentItem.imageUrl} /> :
                        <img src={currentItem.imageUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-white/5" />
                    ) : isVideo(currentItem) ? (
                        <div className="w-full max-w-5xl aspect-video bg-black rounded-xl shadow-2xl overflow-hidden border border-white/10">
                            {currentItem.url ? <video src={currentItem.url} controls autoPlay className="w-full h-full" /> : 
                            <iframe src={`https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1`} className="w-full h-full border-0" allowFullScreen></iframe>}
                        </div>
                    ) : null}

                    <button onClick={(e) => { e.stopPropagation(); onPrev((currentIndex - 1 + items.length) % items.length); }} className="absolute left-4 md:-left-20 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 rounded-full transition-all">
                        <ChevronLeftIcon className="w-12 h-12" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onNext((currentIndex + 1) % items.length); }} className="absolute right-4 md:-right-20 top-1/2 -translate-y-1/2 text-white/30 hover:text-white p-4 rounded-full transition-all">
                        <ChevronRightIcon className="w-12 h-12" />
                    </button>
                </div>
            </div>

            <div className="relative z-[100] bg-black/90 backdrop-blur-3xl border-t border-white/10 p-8 flex-shrink-0" onClick={e => e.stopPropagation()}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-2 flex-1">
                         <h3 className="text-white font-black text-2xl uppercase tracking-tighter">{currentItem.title || 'Untitled Masterpiece'}</h3>
                         <p className="text-gray-400 text-sm font-medium leading-relaxed italic">{currentItem.description || 'Exclusive creative project by Fuad Ahmed.'}</p>
                    </div>
                    <button onClick={handleShare} className="btn-angular bg-red-600 text-white font-black py-4 px-10 uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Share Project</button>
                </div>
            </div>
            <AnimatePresence>
                {showShareToast && (
                    <motion.div initial={{opacity:0, y: 50}} animate={{opacity:1, y:0}} exit={{opacity:0, y:50}} className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl z-[120]">Link Copied</motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export const GalleryGridModal: React.FC<any> = ({ items, onClose, onItemClick }) => (
    <div className="fixed inset-0 bg-black/98 z-[9999] flex flex-col animate-fade-in" onClick={onClose}>
        <div className="p-8 flex justify-between items-center border-b border-white/10 bg-black">
            <h2 className="text-2xl font-black text-white uppercase tracking-widest">Master Gallery</h2>
            <button onClick={onClose} className="p-3 rounded-full hover:bg-red-600 text-white transition-all"><CloseIcon className="w-8 h-8" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" onClick={e => e.stopPropagation()}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {items.map((item: any, index: number) => (
                    <div key={index} onClick={() => onItemClick(index)} className="aspect-square bg-white/5 rounded-2xl overflow-hidden cursor-pointer hover:ring-4 hover:ring-red-600 transition-all group">
                        <img src={item.imageUrl || item.thumbnailUrl || `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`} className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);