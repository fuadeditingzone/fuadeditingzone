import React, { useState, useRef, useEffect } from 'react';
import type { VideoWork } from '../hooks/types';
import { useDraggable } from '../hooks/useDraggable';
import { CloseIcon, PlayIcon, PauseIcon, VolumeOnIcon, VolumeOffIcon } from './Icons';

interface VideoPipPlayerProps {
  video: VideoWork;
  onClose: () => void;
  currentTime: number;
  setCurrentTime: (time: number) => void;
}

export const VideoPipPlayer: React.FC<VideoPipPlayerProps> = ({ video, onClose, currentTime, setCurrentTime }) => {
    const handleRef = useRef<HTMLDivElement>(null);
    const { ref: dragRef, style: dragStyle, isDragging } = useDraggable(handleRef);
    const videoRef = useRef<HTMLVideoElement>(null);
    const ytPlayerRef = useRef<any>(null);

    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);

    const isYouTube = !!video.videoId;

    // --- YouTube API Logic ---
    useEffect(() => {
        if (!isYouTube || !window.YT) return;

        const timer = setTimeout(() => {
            const container = document.getElementById('pip-youtube-player');
            if (!container) return;

            ytPlayerRef.current = new window.YT.Player('pip-youtube-player', {
                videoId: video.videoId,
                playerVars: {
                    autoplay: 1,
                    mute: isMuted ? 1 : 0,
                    rel: 0,
                    modestbranding: 1,
                    enablejsapi: 1,
                    start: Math.floor(currentTime) // Seek on load
                },
                events: {
                    onReady: (event: any) => {
                        event.target.playVideo();
                    },
                    onStateChange: (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) setIsPlaying(true);
                        else setIsPlaying(false);
                    }
                }
            });
        }, 100);

        return () => {
            clearTimeout(timer);
            if (ytPlayerRef.current) {
                ytPlayerRef.current.destroy();
                ytPlayerRef.current = null;
            }
        };
    }, [video.videoId, isYouTube]);

    // Periodically sync time back to global state
    useEffect(() => {
        if (!isPlaying) return;
        const interval = setInterval(() => {
            if (isYouTube) {
                if (ytPlayerRef.current && ytPlayerRef.current.getCurrentTime) {
                    setCurrentTime(ytPlayerRef.current.getCurrentTime());
                }
            } else {
                if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                }
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, isYouTube]);

    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isYouTube) {
            if (ytPlayerRef.current) {
                const state = ytPlayerRef.current.getPlayerState();
                if (state === window.YT.PlayerState.PLAYING) ytPlayerRef.current.pauseVideo();
                else ytPlayerRef.current.playVideo();
            }
        } else {
            const videoEl = videoRef.current;
            if (!videoEl) return;
            if (videoEl.paused) videoEl.play();
            else videoEl.pause();
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(prev => !prev);
    };

    useEffect(() => {
        if (isYouTube) {
            if (ytPlayerRef.current && ytPlayerRef.current.mute) {
                if (isMuted) ytPlayerRef.current.mute();
                else ytPlayerRef.current.unMute();
            }
            return;
        }
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
    }, [isYouTube, isMuted]);

    // Apply startup time for local videos
    useEffect(() => {
        if (!isYouTube && videoRef.current && currentTime > 0) {
            videoRef.current.currentTime = currentTime;
        }
    }, [isYouTube]);

    return (
        <div 
            ref={dragRef}
            style={dragStyle}
            className={`fixed bottom-4 right-4 z-[90] w-64 md:w-80 aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/20 bg-black transition-all duration-300 ${isDragging ? 'scale-105 shadow-red-500/30' : ''} animate-popup-scale-in`}
        >
            <div className="relative w-full h-full group">
                {isYouTube ? (
                    <div id="pip-youtube-player" className="w-full h-full pointer-events-auto"></div>
                ) : (
                    <video 
                        key={video.url}
                        ref={videoRef}
                        src={video.url} 
                        autoPlay
                        loop 
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                    />
                )}
                
                {/* Controls Overlay */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between pointer-events-none">
                    <div ref={handleRef} className="p-2 text-white text-xs cursor-move flex-grow pointer-events-auto">
                        <p className="truncate bg-black/50 px-2 py-1 rounded">PiP: {isYouTube ? 'YouTube Video' : 'VFX Edit'}</p>
                    </div>

                    <div className="flex items-center justify-center gap-4 p-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-auto">
                        <button onClick={togglePlay} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                            {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={toggleMute} className="text-white p-2 rounded-full hover:bg-white/20 transition-colors">
                            {isMuted ? <VolumeOffIcon className="w-5 h-5" /> : <VolumeOnIcon className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                
                <button onClick={onClose} className="absolute top-2 right-2 text-white p-1.5 rounded-full bg-black/60 hover:bg-red-600 transition-colors z-10">
                    <CloseIcon className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};