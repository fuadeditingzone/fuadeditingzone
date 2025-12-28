import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicWork, VideoWork } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { siteConfig } from '../config';
import { 
    PlayIcon, VolumeOnIcon, VolumeOffIcon, HandThumbUpIcon, 
    GlobeAltIcon, SparklesIcon, CloseIcon, CheckCircleIcon,
    ShareIcon, DownloadIcon, ThreeDotsIcon
} from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { InteractiveCard } from './InteractiveCard';
import { useParallax } from '../contexts/ParallaxContext';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

// Add YT Player types to global window scope for TypeScript
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    gapi: any;
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
    const { videos: youtubeVideos, stats, loading, formatNumber } = useYouTubeChannelStats();
    
    // --- Video Metadata State ---
    const [currentVideoStats, setCurrentVideoStats] = useState<{ id: string; title: string; views: string; likes: number; formattedLikes: string } | null>(null);
    const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
    const [likeCountOverrides, setLikeCountOverrides] = useState<Record<string, number>>({});

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

    // Re-render Google Subscribe Button when the view changes
    useEffect(() => {
        if (window.gapi && window.gapi.ytsubscribe) {
            window.gapi.ytsubscribe.go();
        }
    }, [isYtVisible, activeYouTubeId]);

    // Handle Floating Logic
    useEffect(() => {
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
        return [...graphicWorks, ...finalSelection.map(v => ({ id: v.id, imageUrl: v.thumbnail, category: 'YouTube Thumbnails' as const }))];
    }, [youtubeVideos]);

    useEffect(() => {
        if (!activeYouTubeId) return;
        const fetchVideoStats = async () => {
            try {
                const apiKey = siteConfig.api.youtubeApiKey;
                const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${activeYouTubeId}&key=${apiKey}`);
                const data = await response.json();
                if (data.items && data.items.length > 0) {
                    const item = data.items[0];
                    const s = item.statistics;
                    const sn = item.snippet;
                    setCurrentVideoStats({
                        id: activeYouTubeId,
                        title: sn.title,
                        views: new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(parseInt(s.viewCount)),
                        likes: parseInt(s.likeCount),
                        formattedLikes: new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(parseInt(s.likeCount))
                    });
                }
            } catch (error) {
                console.error("Failed to fetch video stats", error);
            }
        };
        fetchVideoStats();
    }, [activeYouTubeId]);

    const handleLikeClick = () => {
        if (!currentVideoStats) return;
        
        const isCurrentlyLiked = userLikes[activeYouTubeId];
        const newLikedState = !isCurrentlyLiked;
        
        // Update local state
        setUserLikes(prev => ({ ...prev, [activeYouTubeId]: newLikedState }));
        setLikeCountOverrides(prev => ({
            ...prev,
            [activeYouTubeId]: (prev[activeYouTubeId] || currentVideoStats.likes) + (newLikedState ? 1 : -1)
        }));

        // In a real app, you'd trigger an OAuth popup here. 
        // For the "Live" feel, we simulate it and if they click again, we open the YT link.
        if (newLikedState) {
            const timer = setTimeout(() => {
                // Open YouTube for the actual permanent like
                window.open(`https://www.youtube.com/watch?v=${activeYouTubeId}`, '_blank');
            }, 800);
            return () => clearTimeout(timer);
        }
    };

    const handleVfxPlayRequest = (video: VideoWork | null) => {
        if (video && pipVideo && video.id === pipVideo.id) {
            setPipVideo(null);
        }
        setPlayingVfxVideo(video);
        if (video && onPortfolioPlay) onPortfolioPlay();
    };

    const YoutubeEditsSection = useMemo(() => {
        const middleIndex = Math.ceil(animeEdits.length / 2);
        const leftAnimeEdits = animeEdits.slice(0, middleIndex);
        const rightAnimeEdits = animeEdits.slice(middleIndex);

        const ThumbnailButton = ({ video }: { video: VideoWork }) => (
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
                        <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-contain transition-transform duration-500 group-hover/thumb:scale-110" />
                        {activeYouTubeId === video.videoId && isYtPlaying && (
                            <div className="absolute inset-0 bg-red-600/10 flex items-center justify-center">
                                <div className="flex gap-1 items-center">
                                    <div className="w-0.5 h-3 bg-white animate-[bounce_1s_infinite]"></div>
                                    <div className="w-0.5 h-4 bg-white animate-[bounce_1.2s_infinite]"></div>
                                    <div className="w-0.5 h-2 bg-white animate-[bounce_0.8s_infinite]"></div>
                                </div>
                            </div>
                        )}
                    </div>
                </button>
            ) : null
        );

        return (
            <div className="lg:flex lg:gap-12 lg:items-start max-w-[1700px] mx-auto animate-fade-in" ref={ytContainerRef}>
                <div className="hidden lg:flex flex-col gap-6 w-[300px] flex-shrink-0 h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 px-4 pt-2">
                        {leftAnimeEdits.map((video) => <ThumbnailButton key={video.id} video={video} />)}
                </div>

                <div className="flex-1 space-y-6 md:space-y-4">
                    <div className="relative aspect-video w-full mx-auto rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-[#0f0f0f] border border-white/10">
                        <motion.div 
                            layout
                            data-floating={isFloating}
                            className={`w-full h-full relative z-30 transition-shadow duration-500 ${isFloating ? 'fixed bottom-6 right-6 w-64 md:w-80 shadow-red-600/20 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.4)] z-[200] rounded-xl border border-white/20' : ''}`}
                        >
                            <div id="youtube-portfolio-player-inner" className="w-full h-full bg-black"></div>
                            {isFloating && (
                                <button onClick={() => setIsYtPlaying(false)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full border border-white/10 z-10"><CloseIcon className="w-3.5 h-3.5" /></button>
                            )}
                        </motion.div>

                        {isFloating && (
                            <div className="absolute inset-0 z-10 bg-black flex flex-col items-center justify-center text-center p-6 transition-all duration-500 overflow-hidden">
                                <img src={`https://i.ytimg.com/vi/${activeYouTubeId}/hqdefault.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-40 scale-110" />
                                <div className="relative z-20 space-y-4">
                                    <div className="flex items-center justify-center gap-2 text-white">
                                        <SparklesIcon className="w-4 h-4 text-red-500 animate-spin-slow" />
                                        <h4 className="font-bold text-[10px] md:text-sm uppercase tracking-[0.2em]">Cinematic Playback Active</h4>
                                    </div>
                                    <button onClick={() => document.getElementById('video-editing')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white/5 hover:bg-red-600 border border-white/10 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all">Back to Center</button>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {/* ENHANCED YOUTUBE ACTION BAR */}
                    <div className="bg-[#0f0f0f] p-4 md:p-6 border-t border-white/5 space-y-5 select-none animate-fade-in">
                        <div className="flex items-center gap-3">
                            {isYtPlaying && <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_15px_rgba(220,38,38,1)] flex-shrink-0"></div>}
                            <h3 className="text-white font-bold text-base md:text-2xl break-words tracking-tight leading-tight line-clamp-2">
                                {currentVideoStats ? currentVideoStats.title : 'Syncing cinematic data...'}
                            </h3>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                                <a href={`https://www.youtube.com/channel/${siteConfig.api.channelId}`} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/10 ring-2 ring-red-600/20 group-hover:ring-red-600 transition-all">
                                        <img src={stats.channelProfilePic || siteConfig.branding.profilePicUrl} alt={stats.channelTitle} className="w-full h-full object-cover object-top" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-red-600 rounded-full p-0.5 border border-black"><CheckCircleIcon className="w-2.5 h-2.5 text-white" /></div>
                                </a>
                                <div className="flex flex-col min-w-0 pr-4">
                                    <a href={`https://www.youtube.com/channel/${siteConfig.api.channelId}`} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm md:text-base leading-none truncate hover:opacity-80 transition-opacity">{stats.channelTitle || siteConfig.branding.name}</a>
                                    <span className="text-gray-400 text-[10px] md:text-xs font-medium mt-1">{loading ? '...' : formatNumber(stats.subscribers)} subscribers</span>
                                </div>
                                <div className="flex items-center h-9 ml-2">
                                    <div className="g-ytsubscribe" data-channelid={siteConfig.api.channelId} data-layout="default" data-count="default" data-theme="dark"></div>
                                </div>
                            </div>

                            {/* MODERN PILL ACTION BUTTONS */}
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                                {/* Like / Dislike Pill */}
                                <div className="flex items-center bg-white/10 rounded-full h-9 md:h-10 overflow-hidden border border-white/5">
                                    <button 
                                        onClick={handleLikeClick}
                                        className={`flex items-center gap-2 px-3 md:px-4 h-full hover:bg-white/10 transition-all active:scale-95 group ${userLikes[activeYouTubeId] ? 'text-white' : 'text-gray-200'}`}
                                    >
                                        <motion.div
                                            animate={userLikes[activeYouTubeId] ? { scale: [1, 1.4, 1], rotate: [0, -15, 0] } : {}}
                                            transition={{ duration: 0.4 }}
                                        >
                                            <HandThumbUpIcon className={`w-4 h-4 md:w-5 md:h-5 ${userLikes[activeYouTubeId] ? 'fill-white text-white' : 'group-hover:text-white'}`} />
                                        </motion.div>
                                        <span className="text-[11px] md:text-sm font-bold">
                                            {currentVideoStats ? formatNumber(likeCountOverrides[activeYouTubeId] || currentVideoStats.likes) : '...'}
                                        </span>
                                    </button>
                                    <div className="w-[1px] h-6 bg-white/10"></div>
                                    <button className="px-3 md:px-4 h-full hover:bg-white/10 transition-all text-gray-200 group">
                                        <HandThumbUpIcon className="w-4 h-4 md:w-5 md:h-5 rotate-180 group-hover:text-white" />
                                    </button>
                                </div>

                                {/* Share Button */}
                                <button 
                                    onClick={() => window.open(`https://www.youtube.com/watch?v=${activeYouTubeId}`, '_blank')}
                                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 md:px-4 h-9 md:h-10 rounded-full border border-white/5 transition-all active:scale-95 group"
                                >
                                    <ShareIcon className="w-4 h-4 md:w-5 md:h-5 text-white" />
                                    <span className="text-[11px] md:text-sm font-bold text-white">Share</span>
                                </button>

                                {/* Remix / More */}
                                <button className="flex items-center justify-center bg-white/10 hover:bg-white/20 w-9 md:w-10 h-9 md:h-10 rounded-full border border-white/5 transition-all">
                                    <ThreeDotsIcon className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4 max-w-5xl mx-auto pt-2 px-1">
                        {animeEdits.map((video) => <ThumbnailButton key={video.id} video={video} />)}
                    </div>
                </div>

                <div className="hidden lg:flex flex-col gap-6 w-[300px] flex-shrink-0 h-[650px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600/50 px-4 pt-2">
                        {rightAnimeEdits.map((video) => <ThumbnailButton key={video.id} video={video} />)}
                </div>
            </div>
        );
    }, [animeEdits, activeYouTubeId, isYtPlaying, currentVideoStats, isFloating, setIsYtPlaying, onPortfolioPlay, ytContainerRef, isYouTubeApiReady, currentTime, setCurrentTime, stats, loading, formatNumber, userLikes, likeCountOverrides]);

    const GraphicDesignContent = useMemo(() => {
        const categories: GraphicWork['category'][] = ['Photo Manipulation', 'YouTube Thumbnails', 'Banner Designs'];
        return (
            <div className="space-y-16 animate-fade-in">
                {categories.map(category => {
                    const works = dynamicGraphicWorks.filter(w => w.category === category);
                    if (works.length === 0) return null;
                    return (
                        <div key={category} className="space-y-6">
                            <h3 className="text-2xl font-bold text-gray-300">{category}</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
                                {works.map((work, idx) => {
                                    const origIdx = dynamicGraphicWorks.findIndex(item => item.id === work.id);
                                    return (
                                        <div key={`${work.id}-${idx}`} onClick={() => openModal(dynamicGraphicWorks, origIdx)}>
                                            <InteractiveCard className="relative group rounded-xl sm:rounded-2xl overflow-hidden bg-black cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/10 aspect-[4/3]">
                                                <div className="w-full h-full transition-transform duration-300 group-hover:scale-105">
                                                  <img src={work.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover filter blur-lg brightness-50 scale-110" aria-hidden="true" />
                                                  <LazyImage src={work.imageUrl} alt={work.category} className="relative w-full h-full object-contain" />
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
                    <VfxVideoPlayer key={video.id} video={video} currentlyPlaying={playingVfxVideo} pipVideo={pipVideo} onPlayRequest={handleVfxPlayRequest} setPipVideo={setPipVideo} currentTime={currentTime} setCurrentTime={setCurrentTime} />
                ))}
            </div>
        );
    }, [vfxEdits, playingVfxVideo, pipVideo, handleVfxPlayRequest, setPipVideo, currentTime, setCurrentTime]);
    
    return (
        <section id="portfolio" className="select-none" style={parallaxStyle}>
            <div className="max-w-[1800px] mx-auto space-y-16 md:space-y-32 py-12 md:py-16 px-2 sm:px-6 lg:px-8">
                <div className="relative">
                    <div className="absolute -inset-y-2 md:-inset-y-4 -inset-x-0 sm:-inset-6 md:-inset-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl" style={{ transform: window.innerWidth > 768 ? 'perspective(2000px) rotateY(-1deg)' : 'none' }}></div>
                    <div className="relative p-3 md:p-8">
                        <div className="text-center mb-6 md:mb-8"><h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Graphic Design</h2></div>
                        {GraphicDesignContent}
                    </div>
                </div>
                <div id="video-editing" className="pt-8 md:pt-16 relative space-y-16 md:space-y-24">
                    <div className="absolute -inset-y-2 md:-inset-y-4 -inset-x-0 sm:-inset-6 md:-inset-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl md:rounded-3xl" style={{ transform: window.innerWidth > 768 ? 'perspective(2000px) rotateY(1deg)' : 'none' }}></div>
                    <div className="relative p-3 md:p-8">
                        <div className="text-center mb-10 md:mb-16"><h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">YouTube Edits</h2></div>
                        {YoutubeEditsSection}
                    </div>
                    <div className="relative p-3 md:p-8">
                        <div className="text-center mb-10 md:mb-16"><h2 className="text-2xl md:text-4xl font-bold text-white uppercase tracking-tight">Cinematic VFX</h2></div>
                        {CinematicVfxSection}
                    </div>
                </div>
            </div>
        </section>
    );
};