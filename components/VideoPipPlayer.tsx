import React, { useState, useRef, useEffect } from 'react';
import type { VideoWork } from '../hooks/types';
import { useDraggable } from '../hooks/useDraggable';
import { CloseIcon, PlayIcon, PauseIcon, VolumeOnIcon, VolumeOffIcon } from './Icons';

interface VideoPipPlayerProps {
  video: VideoWork;
  onClose: () => void;
}

export const VideoPipPlayer: React.FC<VideoPipPlayerProps> = ({ video, onClose }) => {
    const handleRef = useRef<HTMLDivElement>(null);
    const { ref: dragRef, style: dragStyle, isDragging } = useDraggable(handleRef);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        const videoEl = videoRef.current;
        if (!videoEl) return;
        if (videoEl.paused) {
            videoEl.play();
        } else {
            videoEl.pause();
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(prev => !prev);
    };

    useEffect(() => {
        const videoEl = videoRef.current;
        if (videoEl) {
            const updatePlayingState = () => setIsPlaying(!videoEl.paused);
            videoEl.addEventListener('play', updatePlayingState);
            videoEl.addEventListener('pause', updatePlayingState);
            return () => {
                videoEl.removeEventListener('play', updatePlayingState);
                videoEl.removeEventListener('pause', updatePlayingState);
            };
        }
    }, []);

    return (
        <div 
            ref={dragRef}
            style={dragStyle}
            className={`fixed bottom-4 right-4 z-[90] w-64 md:w-80 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black transition-all duration-300 ${isDragging ? 'scale-105 shadow-red-500/30' : ''} animate-popup-scale-in`}
        >
            <div className="relative w-full h-full group">
                <video 
                    ref={videoRef}
                    src={video.url} 
                    autoPlay 
                    loop 
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                />
                
                {/* Controls Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between">
                    <div ref={handleRef} className="p-2 text-white text-xs cursor-move flex-grow">
                        <p className="truncate bg-black/50 px-2 py-1 rounded">Now Playing...</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 p-2 bg-gradient-to-t from-black/70 to-transparent">
                        <button onClick={togglePlay} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleMute} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                            {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeOnIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                
                {/* Always visible close button */}
                <button onClick={onClose} className="absolute top-2 right-2 text-white p-1.5 rounded-full bg-black/60 hover:bg-red-600 transition-colors">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
