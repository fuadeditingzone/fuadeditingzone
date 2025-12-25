
import React, { useState, useEffect } from 'react';
import type { GraphicWork, VideoWork, ModalItem } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { CloseIcon, ZoomInIcon, ZoomOutIcon, PlayIcon } from './Icons';

interface ModalViewerProps {
  state: { items: ModalItem[]; currentIndex: number };
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ModalViewer: React.FC<ModalViewerProps> = ({ state, onClose, onNext, onPrev }) => {
    const { items, currentIndex } = state;
    const currentItem = items[currentIndex];
    const [isZoomed, setIsZoomed] = useState(false);
    
    useEffect(() => {
        // Reset zoom state when the image changes
        setIsZoomed(false);
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, onClose]);

    const isImage = (item: ModalItem): item is GraphicWork => 'imageUrl' in item;
    const isVideo = (item: ModalItem): item is VideoWork => ('url' in item || 'videoId' in item);

    const videoUrl = isVideo(currentItem) 
        ? (currentItem.url ? currentItem.url : `https://www.youtube.com/embed/${currentItem.videoId}?autoplay=1&rel=0`)
        : '';

    return (
        <div 
            className="fixed inset-0 bg-black z-[70] flex items-center justify-center animate-fade-in p-4"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            {isImage(currentItem) && (
                <div 
                    className="absolute inset-0 w-full h-full bg-cover bg-center filter blur-2xl brightness-50 scale-110 transition-all duration-300"
                    style={{ backgroundImage: `url(${currentItem.imageUrl})` }}
                />
            )}

            <div className="relative w-full h-full" onClick={e => e.stopPropagation()}>
                {isImage(currentItem) ? (
                    <div className={`w-full h-full flex items-center justify-center ${isZoomed ? 'overflow-auto' : 'overflow-hidden p-4'}`}>
                        <img 
                            src={currentItem.imageUrl} 
                            alt="Portfolio work" 
                            className={`rounded-lg drop-shadow-2xl transition-all duration-300 ${isZoomed ? 'flex-shrink-0' : 'max-w-full max-h-full object-contain'}`}
                        />
                    </div>
                ) : isVideo(currentItem) ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-full max-w-5xl aspect-video bg-black rounded-lg">
                            {currentItem.url ? (
                                <video 
                                    src={currentItem.url} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full rounded-lg"
                                />
                            ) : (
                                <iframe
                                    src={videoUrl}
                                    title="Portfolio Video"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full rounded-lg"
                                ></iframe>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2 z-[100]">
                 {isImage(currentItem) && (
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                        aria-label={isZoomed ? "Zoom out" : "Zoom in"}
                        className="text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10"
                    >
                        {isZoomed ? <ZoomOutIcon className="h-8 w-8" /> : <ZoomInIcon className="h-8 w-8" />}
                    </button>
                )}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    aria-label="Close viewer"
                    className="text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10"
                >
                    <CloseIcon className="h-8 w-8" />
                </button>
            </div>

            <button
                onClick={(e) => { e.stopPropagation(); onPrev(); }}
                aria-label="Previous item"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-[100] border border-white/10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
            
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                aria-label="Next item"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white z-[100] border border-white/10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
        </div>
    );
};


interface GalleryGridModalProps {
    items: ModalItem[];
    onClose: () => void;
    onItemClick: (index: number) => void;
}

export const GalleryGridModal: React.FC<GalleryGridModalProps> = ({ items, onClose, onItemClick }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const getThumbnail = (item: ModalItem) => {
        if ('imageUrl' in item) return item.imageUrl;
        if ('thumbnailUrl' in item) return item.thumbnailUrl;
        if ('videoId' in item) return `https://i.ytimg.com/vi/${item.videoId}/hqdefault.jpg`;
        return ''; // Fallback
    };

    return (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[70] flex items-center justify-center animate-fade-in p-4 sm:p-8"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-gray-900 rounded-xl w-full h-full max-w-7xl flex flex-col"
                style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-3xl font-bold font-teko text-white tracking-widest uppercase">Works Gallery</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close gallery"
                        className="text-white/70 hover:text-white transition-colors p-2 rounded-full bg-black/50 hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-white border border-white/10"
                    >
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-red-600">
                    {/* Masonry Grid */}
                    <div className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                        {items.map((item, index) => (
                            <button 
                                key={index} 
                                onClick={() => onItemClick(index)}
                                className="group relative break-inside-avoid overflow-hidden rounded-lg shadow-lg block w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 border border-white/10"
                            >
                                <LazyImage 
                                    src={getThumbnail(item) || ''} 
                                    alt={`Work ${index}`} 
                                    className="w-full h-auto object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
                                    loadIndex={index}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    {('url' in item || 'videoId' in item) && (
                                        <PlayIcon className="w-10 h-10 text-white drop-shadow-lg" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
