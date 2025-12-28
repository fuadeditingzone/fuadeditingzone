import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicWork, VideoWork } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { siteConfig } from '../config';
import { PlayIcon, VolumeOnIcon, VolumeOffIcon, HandThumbUpIcon, GlobeAltIcon, SparklesIcon, CloseIcon } from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { InteractiveCard } from './InteractiveCard';
import { useParallax } from '../contexts/ParallaxContext';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Add YT Player types to global window scope for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface PortfolioProps {
    openModal: (items: (GraphicWork | VideoWork)[], startIndex: number) => void;
    isYouTubeApiReady: boolean;
    playingVfxVideo: VideoWork | null;
    setPlayingVfxVideo: (video: VideoWork | null) => void;
    pipVideo: VideoWork | null;
    setPipVideo: (video: VideoWork | null) => void;
    activeYouTubeId: string;
    setActiveYouTubeId: (id: string) => void;
    isYtPlaying: boolean;
    setIsYtPlaying: (playing: boolean) => void;
    onPortfolioPlay?: () => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
}

const { graphicWorks, animeEdits, vfxEdits } = siteConfig.content.portfolio;

const VfxVideoPlayer: React.FC<{
    video: VideoWork;
    currentlyPlaying: VideoWork | null;
    pipVideo: VideoWork | null;
    onPlayRequest: (video: VideoWork | null) => void;
    setPipVideo: (video: VideoWork | null) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
}> = ({ video, currentlyPlaying, pipVideo, onPlayRequest, setPipVideo, currentTime, setCurrentTime }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [containerRef, isVisible] = useIntersectionObserver({ threshold: 0.5 });
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasActuallyPlayed, setHasActuallyPlayed] = useState(false);

    const isPlaying = currentlyPlaying?.id === video.id;
    const isThisVideoInPip = pipVideo?.id === video.id;

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        
        if (isPlaying && !isThisVideoInPip) {
            if (currentTime > 0 && Math.abs(videoEl.currentTime - currentTime) > 1) {
                videoEl.currentTime = currentTime;
            }
            videoEl.play().catch(() => {});
            setHasActuallyPlayed(true);
        } else {
            videoEl.pause();
            if (!isThisVideoInPip && videoEl.currentTime !== 0) {
                videoEl.currentTime = 0;
            }
            if (!currentlyPlaying) setHasActuallyPlayed(false); 
        }
    }, [isPlaying, isThisVideoInPip, currentlyPlaying]);

    useEffect(() => {
        if (!isPlaying || isThisVideoInPip) return;
        const interval = setInterval(() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
        }, 1000);
        return () => clearInterval(interval);
    }, [isPlaying, isThisVideoInPip]);

    useEffect(() => {
        if (isPlaying && hasActuallyPlayed && !isVisible && !isThisVideoInPip) {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
            setPipVideo(video);
        }
        if (isThisVideoInPip && isVisible) {
            setPipVideo(null);
        }
    }, [isPlaying, hasActuallyPlayed, isVisible, isThisVideoInPip, video, setPipVideo]);
    
    const handlePlayRequest = () => {
        onPlayRequest(isPlaying ? null : video);
    };

    return (
        <div ref={containerRef}>
            <InteractiveCard className={`relative group w-full aspect-square bg-gray-900 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 select-none ${isPlaying ? 'shadow-2xl z-10' : 'opacity-90 hover:opacity-100'} ${isThisVideoInPip ? 'opacity-30 pointer-events-none' : ''}`}>
                <div 
                  className={`w-full h-full transition-transform duration-500 ${isPlaying ? 'scale-105' : ''}`}
                  onClick={handlePlayRequest}
                >
                    <video
                        ref={videoRef}
                        src={video.url}
                        loop
                        muted={isMuted}
                        playsInline
                        className="w-full h-full object-cover"
                        onCanPlay={() => setIsLoading(false)}
                    />
                
                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 flex items-center justify-center select-none ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                         {!isPlaying && !isLoading && <PlayIcon className="w-8 h-8 md:w-12 md:h-12 text-white/80" />}
                    </div>

                    {isPlaying && (
                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 p-2 bg-black/50 backdrop-blur-md rounded-full select-none" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                            {isMuted ? <VolumeOffIcon className="w-3 h-3 md:w-4 md:h-4 text-white" /> : <VolumeOnIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                        </div>
                    )}
                </div>
            </InteractiveCard>
        </div>
    );
};

export const Portfolio: React.FC<PortfolioProps> = ({ 
    openModal, 
    isYouTubeApiReady,
    playingVfxVideo,
    setPlayingVfxVideo,
    pipVideo,
    setPipVideo,
    activeYouTubeId,
    setActiveYouTubeId,
    isYtPlaying,
    setIsYtPlaying,
    onPortfolioPlay,
    currentTime,
    setCurrentTime
}) => {
    const [ytContainerRef, isYtVisible] = useIntersectionObserver({ threshold: 0.1 });
    const { videos: youtubeVideos } = useYouTubeChannelStats();
    const [currentVideoStats, setCurrentVideoStats] = useState<{ title: string; views: string; likes: string } | null>(null);
    const { y } = useParallax();
    const playerRef = useRef<any>(null);
    const [isFloating, setIsFloating] = useState(false);

    // YouTube Iframe API Initialization
    useEffect(() => {
        if (!isYouTubeApiReady || !activeYouTubeId) return;

        const container = document.getElementById('youtube-portfolio-player-inner');
        if (!container) return;

        if (playerRef.current) {
            playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player('youtube-portfolio-player-inner', {
            videoId: activeYouTubeId,
            playerVars: {
                autoplay: isYtPlaying ? 1 : 0,
                modestbranding: 1,
                rel: 0,
                showinfo: 0,
                start: Math.floor(currentTime) 
            },
            events: {
                onStateChange: (event: any) => {
                    if (event.data === window.YT.PlayerState.PLAYING) {
                        setIsYtPlaying(true);
                        if (onPortfolioPlay) onPortfolioPlay();
                    } else if (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) {
                        setIsYtPlaying(false);
                    }
                }
            }
        });

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [isYouTubeApiReady, activeYouTubeId]);

    // Handle Floating Logic via IntersectionObserver + Scroll behavior
    useEffect(() => {
        // Floating only happens if video is playing and not visible
        const shouldFloat = !isYtVisible && isYtPlaying && activeYouTubeId !== '';
        setIsFloating(shouldFloat);
    }, [isYtVisible, isYtPlaying, activeYouTubeId]);

    // Sync current time
    useEffect(() => {
        if (!isYtPlaying) return;
        const interval = setInterval(() => {
            if (playerRef.current && playerRef.current.getCurrentTime) {
                setCurrentTime(playerRef.current.getCurrentTime());
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [isYtPlaying]);

    // Apply Parallax unless something is floating to avoid fixed position glitches in transformed parents
    const parallaxStyle = {
      transform: isFloating ? 'none' : `translateY(${y * -5}px)`,
      transition: 'transform 0.1s ease-out',
      willChange: 'transform' as const
    };

    const dynamicGraphicWorks = useMemo(() => {
        const excludedKeywords = ["maldita", "salaar", "alight motion", "love me with", "one kiss", "naruto from telegram", "lungiman", "#shorts", "an amv edit with all styles", "empathy"];
        const includedKeywords = ["gangnam style", "tadow", "death is no more"];
        
        let filteredVideos = youtubeVideos.filter(v => v.durationSeconds > 60);
        
        filteredVideos = filteredVideos.filter(v => {
             const titleLower = v.title.toLowerCase();
             return !excludedKeywords.some(k => titleLower.includes(k));
        });
        
        filteredVideos.sort((a, b) => (b.rawViewCount || 0) - (a.rawViewCount || 0));

        const priorityList: typeof filteredVideos = [];
        const regularList: typeof filteredVideos = [];
        filteredVideos.forEach(v => {
            const titleLower = v.title.toLowerCase();
            if (includedKeywords.some(k => titleLower.includes(k))) priorityList.push(v);
            else regularList.push(v);
        });
        
        const finalSelection = [...priorityList, ...regularList].slice(0, 20);
        
        const thumbnailWorks: GraphicWork[] = finalSelection.map(v => ({
            id: v.id,
            imageUrl: v.thumbnail,
            category: 'YouTube Thumbnails'
        }));
        
        return [...graphicWorks, ...thumbnailWorks];

    }, [youtubeVideos]);

    useEffect(() => {
        if (!activeYouTubeId) return;
        setCurrentVideoStats(null);
        const fetchVideoStats = async () => {
            try {
                const apiKey = siteConfig.api.youtubeApiKey;
                const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${activeYouTubeId}&key=${apiKey}`);
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const item = data.items[0];
                    const stats = item.statistics;
                    const snippet = item.snippet;
                    setCurrentVideoStats({
                        title: snippet.title,
                        views: new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(parseInt(stats.viewCount)),
                        likes: new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(parseInt(stats.likeCount))
                    });
                }
            } catch (error) {
                console.error("Failed to fetch video stats", error);
                setCurrentVideoStats(null);
            }
        };
        fetchVideoStats();
    }, [activeYouTubeId]);

    const handleVfxPlayRequest = (video: VideoWork | null) => {
        if (video && pipVideo && video.id === pipVideo.id) {
            setPipVideo(null);
        }
        setPlayingVfxVideo(video);
        if (video && onPortfolioPlay) {
            onPortfolioPlay();
        }
    };

    const YoutubeEditsSection = useMemo(() => {
        const middleIndex = Math.ceil(animeEdits.length / 2);
        const leftAnimeEdits = animeEdits.slice(0, middleIndex);
        const rightAnimeEdits = animeEdits.slice(middleIndex);

        const ThumbnailButton = ({ video, index }: { video: VideoWork; index: number; key?: React.Key }) => (
            video.videoId ? (
                <button
                    onClick={() => {
                        setActiveYouTubeId(video.videoId!);
                        setIsYtPlaying(true); 
                        setCurrentTime(0); 
                        if (onPortfolioPlay) onPortfolioPlay();
                    }}
                    className={`relative w-full aspect-video rounded-xl transition-all duration-300 border border-transparent select-none group/thumb bg-black/40 p-0.5 ${activeYouTubeId === video.videoId ? 'opacity-100 scale-105 z-10 shadow-xl border-white/20 ring-2 ring-red-600' : 'opacity-40 hover:opacity-100'}`}
                >
                    <div className="w-full h-full rounded-[10px] overflow-hidden relative">
                        <img 
                            src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} 
                            alt="" 
                            className="w-full h-full object-contain transition-transform duration-500 group-hover/thumb:scale-110" 
                        />
                        {activeYouTubeId === video.videoId && isYtPlaying && (
                            <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-0.5 h-3 bg-white animate-[bounce_1s_infinite]"></div>
                                        <div className="w-0.5 h-4 bg-white animate-[bounce_1.2s_infinite]"></div>
                                        <div className="w-0.5 h-2 bg-white animate-[bounce_0.8s_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-colors"></div>
                    </div>
                </button>
            ) : null
        );

        return (
            <div className="lg:flex lg:gap-12 lg:items-start max-w-[1700px] mx-auto animate-fade-in" ref={ytContainerRef}>
                {/* Desktop Left Sidebar */}
                <div className="hidden lg:flex flex-col gap-6 w-[300px] flex-shrink-0 h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 px-4 pt-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-1 px-1">Playlist A</div>
                        {leftAnimeEdits.map((video, idx) => <ThumbnailButton key={video.id} video={video} index={idx} />)}
                </div>

                {/* Main Player Center */}
                <div className="flex-1 space-y-6 md:space-y-8">
                    <div className="relative aspect-video w-full mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-[#0f0f0f] border border-white/10">
                        {/* THE ACTUAL PLAYER - This container is the one that floats */}
                        <motion.div 
                            layout
                            data-floating={isFloating}
                            className={`w-full h-full relative z-30 transition-shadow duration-500 ${isFloating ? 'fixed bottom-6 right-6 w-64 md:w-80 shadow-red-600/20 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.4)] z-[200] rounded-xl border border-white/20' : ''}`}
                            initial={false}
                        >
                            <div id="youtube-portfolio-player-inner" className="w-full h-full bg-black"></div>
                            
                            {/* Floating Controls Overlay */}
                            <AnimatePresence>
                                {isFloating && (
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute top-2 right-2 flex gap-2 z-10"
                                    >
                                        <button 
                                            onClick={() => setIsYtPlaying(false)}
                                            className="p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors border border-white/10"
                                        >
                                            <CloseIcon className="w-3.5 h-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>

                        {/* HOLE REPLACEMENT - Blurred Preview */}
                        {isFloating && (
                            <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center text-center p-6 transition-all duration-500 overflow-hidden">
                                <img 
                                    src={`https://i.ytimg.com/vi/${activeYouTubeId}/hqdefault.jpg`} 
                                    alt="" 
                                    className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110"
                                />
                                <div className="relative z-20 space-y-4">
                                    <div className="flex items-end gap-1.5 h-12 justify-center">
                                        <div className="w-1.5 bg-red-600 rounded-full animate-[pulse_1s_infinite_0.1s]" style={{ height: '40%' }}></div>
                                        <div className="w-1.5 bg-red-600 rounded-full animate-[pulse_1s_infinite_0.3s]" style={{ height: '70%' }}></div>
                                        <div className="w-1.5 bg-red-600 rounded-full animate-[pulse_1s_infinite_0.2s]" style={{ height: '100%' }}></div>
                                        <div className="w-1.5 bg-red-600 rounded-full animate-[pulse_1s_infinite_0.4s]" style={{ height: '60%' }}></div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-center gap-2 text-white">
                                            <SparklesIcon className="w-4 h-4 text-red-500 animate-spin-slow" />
                                            <h4 className="font-bold text-[10px] md:text-sm uppercase tracking-[0.2em]">Cinematic Playback Active</h4>
                                        </div>
                                        <p className="text-gray-400 text-[8px] md:text-[10px] font-medium uppercase tracking-widest opacity-80">Check the floating window</p>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            const element = document.getElementById('video-editing');
                                            element?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="bg-white/5 hover:bg-red-600 border border-white/10 hover:border-red-600 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                                    >
                                        Scroll Back to Center
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* Metadata Section */}
                    <div className="bg-[#0f0f0f] p-4 md:p-10 border-t border-white/5 flex flex-col md:flex-row gap-4 md:gap-6 justify-between items-start md:items-center min-h-[90px] md:min-h-[120px] select-none">
                            <div className="flex items-center gap-3 md:gap-5 w-full md:w-auto">
                                {isYtPlaying && <div className="w-2 h-2 md:w-3 md:h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)] flex-shrink-0"></div>}
                                <h3 className="text-white font-bold text-lg md:text-4xl break-words tracking-tight leading-tight line-clamp-2">
                                    {currentVideoStats ? currentVideoStats.title : 'Syncing cinematic data...'}
                                </h3>
                            </div>
                            
                            {currentVideoStats && (
                                <div className="flex items-center gap-4 md:gap-8 flex-shrink-0 animate-fade-in mt-2 md:mt-0 w-full md:w-auto overflow-hidden">
                                    <div className="flex-1 md:flex-none flex items-center gap-2 md:gap-3 text-gray-300 bg-white/5 px-4 md:px-8 py-2 md:py-4 rounded-full border border-white/10">
                                        <GlobeAltIcon className="w-4 h-4 md:w-6 md:h-6" />
                                        <span className="font-bold text-xs md:text-lg">{currentVideoStats.views}</span>
                                        <span className="text-[7px] md:text-xs text-gray-500 uppercase tracking-widest">Views</span>
                                    </div>
                                    <div className="flex-1 md:flex-none flex items-center gap-2 md:gap-3 text-gray-300 bg-white/5 px-4 md:px-8 py-2 md:py-4 rounded-full border border-white/10">
                                        <HandThumbUpIcon className="w-4 h-4 md:w-6 md:h-6 text-red-500" />
                                        <span className="font-bold text-xs md:text-lg">{currentVideoStats.likes}</span>
                                        <span className="text-[7px] md:text-xs text-gray-500 uppercase tracking-widest">Likes</span>
                                    </div>
                                </div>
                            )}
                    </div>

                    <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 max-w-5xl mx-auto pt-2 px-1">
                        {animeEdits.map((video, idx) => <ThumbnailButton key={video.id} video={video} index={idx} />)}
                    </div>
                </div>

                {/* Desktop Right Sidebar */}
                <div className="hidden lg:flex flex-col gap-6 w-[300px] flex-shrink-0 h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 px-4 pt-2">
                        <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-black mb-1 px-1 text-right">Playlist B</div>
                        {rightAnimeEdits.map((video, idx) => <ThumbnailButton key={video.id} video={video} index={idx} />)}
                </div>
            </div>
        );
    }, [animeEdits, activeYouTubeId, isYtPlaying, currentVideoStats, isFloating, setIsYtPlaying, onPortfolioPlay, ytContainerRef, isYouTubeApiReady, currentTime, setCurrentTime]);

    const GraphicDesignContent = useMemo(() => {
        const categories: GraphicWork['category'][] = ['Photo Manipulation', 'YouTube Thumbnails', 'Banner Designs'];
        
        return (
            <div className="space-y-16 animate-fade-in">
                {categories.map(category => {
                    const worksForCategory = dynamicGraphicWorks.filter(w => w.category === category);
                    if (worksForCategory.length === 0) return null;

                    return (
                        <div key={category} className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-300">{category}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                                {worksForCategory.map((work, index) => {
                                    const originalIndex = dynamicGraphicWorks.findIndex(item => item.id === work.id);
                                    return (
                                        <div
                                            key={`${work.id}-${index}`}
                                            onClick={() => openModal(dynamicGraphicWorks, originalIndex)}
                                        >
                                            <InteractiveCard className="relative group rounded-xl sm:rounded-2xl overflow-hidden bg-black cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/10 aspect-[4/3]">
                                                <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                                                  <img 
                                                      src={work.imageUrl} 
                                                      alt="" 
                                                      className="absolute inset-0 w-full h-full object-cover filter blur-lg brightness-50 scale-110"
                                                      aria-hidden="true"
                                                  />
                                                  <LazyImage
                                                      src={work.imageUrl}
                                                      alt={work.category}
                                                      className="relative w-full h-full object-contain"
                                                  />
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </InteractiveCard>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }, [dynamicGraphicWorks, openModal]);

    const CinematicVfxSection = useMemo(() => {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-8 px-1 animate-fade-in">
                {vfxEdits.map((video) => (
                    <VfxVideoPlayer 
                        key={video.id} 
                        video={video}
                        currentlyPlaying={playingVfxVideo}
                        pipVideo={pipVideo}
                        onPlayRequest={handleVfxPlayRequest}
                        setPipVideo={setPipVideo}
                        currentTime={currentTime}
                        setCurrentTime={setCurrentTime}
                    />
                ))}
            </div>
        );
    }, [vfxEdits, playingVfxVideo, pipVideo, handleVfxPlayRequest, setPipVideo, currentTime, setCurrentTime]);
    
    return (
        <section id="portfolio" className="select-none" style={parallaxStyle}>
            <div className="max-w-[1800px] mx-auto space-y-16 md:space-y-32 py-12 md:py-16 px-2 sm:px-6 lg:px-8">
                {/* Graphic Design Section */}
                <div className="relative">
                    <div 
                        className="absolute -inset-y-2 md:-inset-y-4 -inset-x-0 sm:-inset-6 md:-inset-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl"
                        style={{
                            transform: window.innerWidth > 768 ? 'perspective(2000px) rotateY(-1deg)' : 'none',
                        }}
                    ></div>
                    <div className="relative p-3 md:p-8">
                        <div className="text-center mb-6 md:mb-8">
                            <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Graphic Design</h2>
                        </div>
                        {GraphicDesignContent}
                    </div>
                </div>

                {/* Video Editing Section - Vertically stacked */}
                <div id="video-editing" className="pt-8 md:pt-16 relative space-y-16 md:space-y-24">
                    <div 
                        className="absolute -inset-y-2 md:-inset-y-4 -inset-x-0 sm:-inset-6 md:-inset-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl"
                        style={{
                            transform: window.innerWidth > 768 ? 'perspective(2000px) rotateY(1deg)' : 'none',
                        }}
                    ></div>
                    
                    {/* YouTube Edits Sub-Section */}
                    <div className="relative p-3 md:p-8">
                        <div className="text-center mb-10 md:mb-16">
                             <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">YouTube Edits</h2>
                        </div>
                        {YoutubeEditsSection}
                    </div>

                    {/* Cinematic VFX Sub-Section */}
                    <div className="relative p-3 md:p-8">
                        <div className="text-center mb-10 md:mb-16">
                             <h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Cinematic VFX</h2>
                        </div>
                        {CinematicVfxSection}
                    </div>
                </div>
            </div>
        </section>
    );
};