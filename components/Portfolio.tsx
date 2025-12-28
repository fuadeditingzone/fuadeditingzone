import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicWork, VideoWork } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { siteConfig } from '../config';
import { 
    PlayIcon, VolumeOnIcon, VolumeOffIcon, HandThumbUpIcon, 
    HandThumbDownIcon, GlobeAltIcon, SparklesIcon, CloseIcon, CheckCircleIcon,
    ShareIcon, DownloadIcon, ThreeDotsIcon, PhotoManipulationIcon,
    ThumbnailIcon, BannerIcon
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
        <div ref={containerRef} itemScope itemType="http://schema.org/VideoObject">
            <InteractiveCard className={`relative group w-full aspect-square bg-black rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 select-none ${isPlaying ? 'shadow-2xl z-10 border-red-600/50' : 'opacity-90 hover:opacity-100 border-white/5'} border ${isThisVideoInPip ? 'opacity-30 pointer-events-none' : ''}`}>
                <figure className="w-full h-full m-0 p-0" onClick={handlePlayRequest}>
                    <video
                        ref={videoRef}
                        src={video.url}
                        loop
                        muted={isMuted}
                        playsInline
                        itemProp="contentUrl"
                        className="w-full h-full object-contain"
                        onCanPlay={() => setIsLoading(false)}
                    />
                    <meta itemProp="name" content={video.title || "VFX Portfolio Piece"} />
                    <meta itemProp="description" content={video.description || "Cinematic VFX edit by Fuad Ahmed."} />
                    <meta itemProp="uploadDate" content="2025-01-01" />
                    <meta itemProp="thumbnailUrl" content={siteConfig.branding.profilePicUrl} />
                
                    <div className={`absolute inset-0 bg-black/20 transition-opacity duration-300 flex items-center justify-center select-none ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                         {!isPlaying && !isLoading && <PlayIcon className="w-8 h-8 md:w-12 md:h-12 text-white/80 drop-shadow-lg" />}
                    </div>

                    {isPlaying && (
                        <div className="absolute bottom-2 right-2 md:bottom-4 md:right-4 p-2 bg-black/50 backdrop-blur-md rounded-full select-none z-20" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                            {isMuted ? <VolumeOffIcon className="w-3 h-3 md:w-4 md:h-4 text-white" /> : <VolumeOnIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />}
                        </div>
                    )}
                </figure>
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
    
    const [currentVideoStats, setCurrentVideoStats] = useState<{ id: string; title: string; views: string; likes: number; dislikes: number } | null>(null);
    const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
    const [userDislikes, setUserDislikes] = useState<Record<string, boolean>>({});
    const [likeOverrides, setLikeOverrides] = useState<Record<string, number>>({});
    const [dislikeOverrides, setDislikeOverrides] = useState<Record<string, number>>({});

    const { y } = useParallax();
    const playerRef = useRef<any>(null);
    const [isFloating, setIsFloating] = useState(false);

    useEffect(() => {
        if (!isYouTubeApiReady || !activeYouTubeId) return;
        const container = document.getElementById('youtube-portfolio-player-inner');
        if (!container) return;
        if (playerRef.current) playerRef.current.destroy();

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
        return () => { if (playerRef.current) playerRef.current.destroy(); };
    }, [isYouTubeApiReady, activeYouTubeId]);

    useEffect(() => {
        if (window.gapi && window.gapi.ytsubscribe) window.gapi.ytsubscribe.go();
    }, [isYtVisible, activeYouTubeId]);

    useEffect(() => {
        setIsFloating(!isYtVisible && isYtPlaying && activeYouTubeId !== '');
    }, [isYtVisible, isYtPlaying, activeYouTubeId]);

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
        let filteredVideos = youtubeVideos.filter(v => v.durationSeconds > 60);
        filteredVideos = filteredVideos.filter(v => {
             const titleLower = v.title.toLowerCase();
             return !excludedKeywords.some(k => titleLower.includes(k));
        });
        filteredVideos.sort((a, b) => (b.rawViewCount || 0) - (a.rawViewCount || 0));
        const finalSelection = filteredVideos.slice(0, 20);
        return [...graphicWorks, ...finalSelection.map(v => ({ 
            id: v.id, 
            imageUrl: v.thumbnail, 
            category: 'YouTube Thumbnails' as const,
            title: v.title,
            description: `Professional YouTube thumbnail design for: ${v.title}`
        }))];
    }, [youtubeVideos]);

    useEffect(() => {
        if (!activeYouTubeId) return;
        const fetchStats = async () => {
            try {
                // Official YT Stats (Likes)
                const apiKey = siteConfig.api.youtubeApiKey;
                const ytRes = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${activeYouTubeId}&key=${apiKey}`);
                const ytData = await ytRes.json();
                
                // Community Dislikes (Return YouTube Dislike API)
                const rydRes = await fetch(`https://returnyoutubedislikeapi.com/votes?videoId=${activeYouTubeId}`);
                const rydData = await rydRes.json();

                if (ytData.items && ytData.items.length > 0) {
                    const item = ytData.items[0];
                    setCurrentVideoStats({
                        id: activeYouTubeId,
                        title: item.snippet.title,
                        views: new Intl.NumberFormat('en-US', { notation: "compact", maximumFractionDigits: 1 }).format(parseInt(item.statistics.viewCount)),
                        likes: parseInt(item.statistics.likeCount) || 0,
                        dislikes: rydData.dislikes || Math.floor((parseInt(item.statistics.likeCount) || 0) * 0.05) // Fallback to 5% estimate
                    });
                }
            } catch (error) {}
        };
        fetchStats();
    }, [activeYouTubeId]);

    const handleLikeClick = () => {
        if (!currentVideoStats) return;
        const isLiked = !!userLikes[activeYouTubeId];
        setUserLikes(prev => ({ ...prev, [activeYouTubeId]: !isLiked }));
        setLikeOverrides(prev => ({ ...prev, [activeYouTubeId]: (prev[activeYouTubeId] || currentVideoStats.likes) + (isLiked ? -1 : 1) }));
        if (userDislikes[activeYouTubeId]) handleDislikeClick();
    };

    const handleDislikeClick = () => {
        if (!currentVideoStats) return;
        const isDisliked = !!userDislikes[activeYouTubeId];
        setUserDislikes(prev => ({ ...prev, [activeYouTubeId]: !isDisliked }));
        setDislikeOverrides(prev => ({ ...prev, [activeYouTubeId]: (prev[activeYouTubeId] || currentVideoStats.dislikes) + (isDisliked ? -1 : 1) }));
        if (userLikes[activeYouTubeId]) handleLikeClick();
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
                        <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt={`YouTube Thumbnail for ${video.title}`} className="w-full h-full object-contain transition-transform duration-500 group-hover/thumb:scale-110" />
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
                        <motion.div layout className={`w-full h-full relative z-30 transition-shadow duration-500 ${isFloating ? 'fixed bottom-6 right-6 w-64 md:w-80 shadow-[0_20px_60px_-15px_rgba(220,38,38,0.4)] z-[200] rounded-xl border border-white/20' : ''}`}>
                            <div id="youtube-portfolio-player-inner" className="w-full h-full bg-black"></div>
                            {isFloating && <button onClick={() => setIsYtPlaying(false)} className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 text-white rounded-full border border-white/10 z-10"><CloseIcon className="w-3.5 h-3.5" /></button>}
                        </motion.div>
                    </div>
                    
                    <div className="bg-[#0f0f0f] p-4 md:p-6 border-t border-white/5 space-y-5 select-none animate-fade-in">
                        <div className="flex items-center gap-3">
                            <h3 className="text-white font-bold text-base md:text-2xl break-words tracking-tight leading-tight line-clamp-2">{currentVideoStats?.title || 'Syncing cinematic data...'}</h3>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                                <a href={`https://www.youtube.com/channel/${siteConfig.api.channelId}`} target="_blank" rel="noopener noreferrer" className="relative flex-shrink-0 group">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-white/10 ring-2 ring-red-600/20 group-hover:ring-red-600 transition-all">
                                        <img src={stats.channelProfilePic || siteConfig.branding.profilePicUrl} alt={stats.channelTitle} className="w-full h-full object-cover object-top" />
                                    </div>
                                </a>
                                <div className="flex flex-col min-w-0 pr-4">
                                    <span className="text-white font-bold text-sm md:text-base truncate">{stats.channelTitle || siteConfig.branding.name}</span>
                                    <span className="text-gray-400 text-[10px] md:text-xs font-medium mt-1">{loading ? '...' : formatNumber(stats.subscribers)} subscribers</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
                                <div className="flex bg-white/5 rounded-full border border-white/10 overflow-hidden h-9 md:h-10">
                                    <button 
                                        onClick={handleLikeClick} 
                                        className={`flex items-center gap-2 px-4 transition-all border-r border-white/10 ${userLikes[activeYouTubeId] ? 'bg-white/20 text-red-500' : 'hover:bg-white/10 text-white'}`}
                                    >
                                        <HandThumbUpIcon className="w-4 h-4" /> 
                                        <span className="text-xs font-bold">{currentVideoStats ? formatNumber(likeOverrides[activeYouTubeId] || currentVideoStats.likes) : '...'}</span>
                                    </button>
                                    <button 
                                        onClick={handleDislikeClick} 
                                        className={`flex items-center gap-2 px-4 transition-all ${userDislikes[activeYouTubeId] ? 'bg-white/20 text-red-500' : 'hover:bg-white/10 text-white'}`}
                                    >
                                        <HandThumbDownIcon className="w-4 h-4" /> 
                                        <span className="text-xs font-bold">{currentVideoStats ? formatNumber(dislikeOverrides[activeYouTubeId] || currentVideoStats.dislikes) : '...'}</span>
                                    </button>
                                </div>
                                <div className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-white text-xs font-bold">
                                    {currentVideoStats?.views || '...'} views
                                </div>
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
    }, [animeEdits, activeYouTubeId, isYtPlaying, currentVideoStats, isFloating, setIsYtPlaying, onPortfolioPlay, ytContainerRef, isYouTubeApiReady, currentTime, setCurrentTime, stats, loading, formatNumber, userLikes, userDislikes, likeOverrides, dislikeOverrides]);

    const GraphicDesignContent = useMemo(() => {
        const categories: GraphicWork['category'][] = ['Photo Manipulation', 'YouTube Thumbnails', 'Banner Designs'];
        return (
            <div className="space-y-12 md:space-y-16">
                {categories.map((cat) => {
                    const filtered = dynamicGraphicWorks.filter(w => w.category === cat);
                    const CategoryIcon = cat === 'Photo Manipulation' ? PhotoManipulationIcon : 
                                         cat === 'YouTube Thumbnails' ? ThumbnailIcon : BannerIcon;
                    
                    // Aspect ratio logic to prevent clipping
                    let gridAspect = 'aspect-video';
                    if (cat === 'Photo Manipulation') gridAspect = 'aspect-square';
                    if (cat === 'Banner Designs') gridAspect = 'aspect-[3/1] md:aspect-[3.5/1]';

                    // Specific grid columns for banners to make them larger
                    const gridClass = cat === 'Banner Designs' 
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6" 
                        : "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4";

                    return (
                        <div key={cat} className="space-y-4">
                            <div className="flex items-center gap-3 border-l-4 border-red-600 pl-4 mb-6">
                                <CategoryIcon className="w-5 h-5 text-red-500" />
                                <h3 className="text-lg md:text-xl font-black text-white uppercase tracking-wider">{cat}</h3>
                            </div>
                            <div className={gridClass}>
                                {filtered.map((work) => {
                                    const origIdx = dynamicGraphicWorks.findIndex(item => item.id === work.id);
                                    return (
                                        <div key={work.id} onClick={() => openModal(dynamicGraphicWorks, origIdx)} itemScope itemType="http://schema.org/ImageObject">
                                            <InteractiveCard className={`relative group rounded-lg overflow-hidden bg-[#0a0a0a] cursor-pointer shadow-md hover:shadow-xl transition-all duration-500 border border-white/5 ${gridAspect}`}>
                                                <figure className="w-full h-full m-0 p-0 transition-transform duration-300 group-hover:scale-105">
                                                  <LazyImage 
                                                    src={work.imageUrl} 
                                                    alt={`${work.title || work.category} - Digital Art by Fuad Ahmed`} 
                                                    className="relative w-full h-full object-contain" 
                                                  />
                                                  <figcaption className="sr-only" itemProp="caption">{work.title} - {work.category} work at Fuad Editing Zone.</figcaption>
                                                </figure>
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                                     <span className="text-[8px] font-black text-white uppercase tracking-widest bg-red-600 px-1.5 py-0.5 rounded">View</span>
                                                </div>
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

    return (
        <section id="portfolio" className="select-none" style={parallaxStyle}>
            <div className="max-w-[1800px] mx-auto space-y-12 md:space-y-24 py-8 md:py-12 px-2 sm:px-6 lg:px-8">
                <div className="relative p-2 md:p-4">
                    <header className="text-center mb-10 md:mb-14">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Graphic Design</h2>
                        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Professional Digital Composition & Visualization</p>
                        <div className="h-1 w-20 bg-red-600 mx-auto mt-4"></div>
                    </header>
                    {GraphicDesignContent}
                </div>
                <div id="video-editing" className="relative p-2 md:p-4 space-y-12 md:space-y-20">
                    <header className="text-center">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">Video Editing</h2>
                        <p className="text-gray-500 text-xs md:text-sm font-bold uppercase tracking-widest mt-2">Cinematic VFX & Professional Motion Design</p>
                        <div className="h-1 w-20 bg-red-600 mx-auto mt-4"></div>
                    </header>
                    <div><h3 className="text-xl md:text-2xl font-bold text-white uppercase mb-8 ml-4 border-l-4 border-red-600 pl-4">YouTube Edits</h3>{YoutubeEditsSection}</div>
                    <div><h3 className="text-xl md:text-2xl font-bold text-white uppercase mb-8 ml-4 border-l-4 border-red-600 pl-4">Cinematic VFX</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-8 px-1 animate-fade-in">
                            {vfxEdits.map((video) => <VfxVideoPlayer key={video.id} video={video} currentlyPlaying={playingVfxVideo} pipVideo={pipVideo} onPlayRequest={v => setPlayingVfxVideo(v)} setPipVideo={setPipVideo} currentTime={currentTime} setCurrentTime={setCurrentTime} />)}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
