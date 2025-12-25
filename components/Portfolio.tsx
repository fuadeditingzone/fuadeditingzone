import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { GraphicWork, VideoWork, VfxSubTab } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { siteConfig } from '../config';
import { PlayIcon, VolumeOnIcon, VolumeOffIcon, HandThumbUpIcon, GlobeAltIcon } from './Icons';
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
    activeVfxSubTab: VfxSubTab;
    setActiveVfxSubTab: (subTab: VfxSubTab) => void;
    isYouTubeApiReady: boolean;
    playingVfxVideo: VideoWork | null;
    setPlayingVfxVideo: (video: VideoWork | null) => void;
    pipVideo: VideoWork | null;
    setPipVideo: (video: VideoWork | null) => void;
    activeYouTubeId: string;
    setActiveYouTubeId: (id: string) => void;
    isYtPlaying: boolean;
    setIsYtPlaying: (playing: boolean) => void;
    forcePaused?: boolean;
    onPortfolioPlay?: () => void;
}

const { graphicWorks, animeEdits, vfxEdits } = siteConfig.content.portfolio;

const VfxVideoPlayer: React.FC<{
    video: VideoWork;
    currentlyPlaying: VideoWork | null;
    pipVideo: VideoWork | null;
    onPlayRequest: (video: VideoWork | null) => void;
    setPipVideo: (video: VideoWork | null) => void;
    forcePaused?: boolean;
}> = ({ video, currentlyPlaying, pipVideo, onPlayRequest, setPipVideo, forcePaused }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [containerRef, isVisible] = useIntersectionObserver({ threshold: 0.5 });
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [hasActuallyPlayed, setHasActuallyPlayed] = useState(false);

    const isPlaying = currentlyPlaying?.id === video.id && !forcePaused;
    const isThisVideoInPip = pipVideo?.id === video.id;

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        
        if (isPlaying && !isThisVideoInPip) {
            videoEl.play().catch(() => {});
            setHasActuallyPlayed(true);
        } else {
            videoEl.pause();
            if (videoEl.currentTime !== 0) videoEl.currentTime = 0;
        }
    }, [isPlaying, isThisVideoInPip]);

    // Picture-in-Picture Logic for local/dropbox videos
    useEffect(() => {
        // Only trigger PiP if it was actively playing (hasActuallyPlayed) and scrolls out of view
        if (isPlaying && hasActuallyPlayed && !isVisible && !isThisVideoInPip) {
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
    activeVfxSubTab, 
    setActiveVfxSubTab, 
    isYouTubeApiReady,
    playingVfxVideo,
    setPlayingVfxVideo,
    pipVideo,
    setPipVideo,
    activeYouTubeId,
    setActiveYouTubeId,
    isYtPlaying,
    setIsYtPlaying,
    forcePaused,
    onPortfolioPlay
}) => {
    const [ytContainerRef, isYtVisible] = useIntersectionObserver({ threshold: 0.1 });
    const { videos: youtubeVideos } = useYouTubeChannelStats();
    const [currentVideoStats, setCurrentVideoStats] = useState<{ title: string; views: string; likes: string } | null>(null);
    const { y } = useParallax();
    const playerRef = useRef<any>(null);

    // Initial player setup
    useEffect(() => {
        if (!isYouTubeApiReady || !activeYouTubeId || activeVfxSubTab !== 'anime') return;

        const container = document.getElementById('youtube-portfolio-player');
        if (!container) return;

        if (playerRef.current) {
            playerRef.current.destroy();
        }

        playerRef.current = new window.YT.Player('youtube-portfolio-player', {
            videoId: activeYouTubeId,
            playerVars: {
                autoplay: isYtPlaying ? 1 : 0, // Keep state if switching tabs but already playing
                modestbranding: 1,
                rel: 0,
                showinfo: 0
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
    }, [isYouTubeApiReady, activeYouTubeId, activeVfxSubTab]);

    // YouTube PiP Logic
    useEffect(() => {
        // If YouTube is actively playing and we scroll away from section
        if (!isYtVisible && isYtPlaying && activeYouTubeId && !forcePaused) {
            // Only set if not already in PiP for something else
            if (!pipVideo || pipVideo.id !== 'yt-pip' || pipVideo.videoId !== activeYouTubeId) {
                setPipVideo({ id: 'yt-pip', videoId: activeYouTubeId });
            }
        } 
        // If YouTube section comes back into view, close the PiP
        else if (isYtVisible && pipVideo?.id === 'yt-pip') {
            setPipVideo(null);
        }
    }, [isYtVisible, activeYouTubeId, isYtPlaying, pipVideo, setPipVideo, forcePaused]);

    const parallaxStyle = {
      transform: `translateY(${y * -5}px)`,
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

    useEffect(() => { setPlayingVfxVideo(null); }, [activeVfxSubTab, setPlayingVfxVideo]);

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
                                                  {/* Blurred Background */}
                                                  <img 
                                                      src={work.imageUrl} 
                                                      alt="" 
                                                      className="absolute inset-0 w-full h-full object-cover filter blur-lg brightness-50 scale-110"
                                                      aria-hidden="true"
                                                  />
                                                  {/* Main Image */}
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
    
    const handleVfxPlayRequest = (video: VideoWork | null) => {
        if (video && pipVideo && video.id === pipVideo.id) {
            setPipVideo(null);
        }
        setPlayingVfxVideo(video);
        if (video && onPortfolioPlay) {
            onPortfolioPlay();
        }
    };

    const VfxContent = useMemo(() => (
        <div className="space-y-12 animate-fade-in">
             <div className="flex justify-center select-none">
                <div className="inline-flex items-center justify-center gap-4">
                    <button
                        onClick={() => setActiveVfxSubTab('anime')}
                        className={`btn-angular btn-3d px-8 py-3 text-sm font-bold transition-all duration-300 ${activeVfxSubTab === 'anime' ? 'bg-red-600 text-white shadow-lg' : 'bg-transparent text-gray-300 hover:bg-white/20 hover:text-white'}`}
                    >
                        YouTube Edits
                    </button>
                    <button
                        onClick={() => setActiveVfxSubTab('vfxEdits')}
                        className={`btn-angular btn-3d px-8 py-3 text-sm font-bold transition-all duration-300 ${activeVfxSubTab === 'vfxEdits' ? 'bg-red-600 text-white shadow-lg' : 'bg-transparent text-gray-300 hover:bg-white/20 hover:text-white'}`}
                    >
                        Cinematic VFX
                    </button>
                </div>
            </div>

            {activeVfxSubTab === 'anime' ? (
                <div className="space-y-6" ref={ytContainerRef}>
                    <InteractiveCard className={`w-full max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-[#0f0f0f] border border-white/10 transition-opacity duration-500 ${pipVideo?.id === 'yt-pip' ? 'opacity-30 pointer-events-none' : ''}`}>
                         <div className="aspect-video w-full">
                            {(!forcePaused && pipVideo?.id !== 'yt-pip') ? (
                                <div id="youtube-portfolio-player" className="w-full h-full"></div>
                            ) : (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                    <div className="text-gray-500 text-xs uppercase tracking-widest animate-pulse">
                                        {forcePaused ? 'Paused for Intro Media' : 'PiP Mode Active'}
                                    </div>
                                </div>
                            )}
                         </div>
                         
                         <div className="bg-[#0f0f0f] p-4 md:p-6 border-t border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center min-h-[80px] select-none">
                            <h3 className="text-white font-semibold text-lg md:text-xl break-words">
                                {currentVideoStats ? currentVideoStats.title : 'Loading video stats...'}
                            </h3>
                            
                            {currentVideoStats && (
                                <div className="flex items-center gap-6 flex-shrink-0 animate-fade-in mt-2 md:mt-0">
                                    <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                        <GlobeAltIcon className="w-4 h-4" />
                                        <span className="font-bold text-sm">{currentVideoStats.views}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Views</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                                        <HandThumbUpIcon className="w-4 h-4 text-red-500" />
                                        <span className="font-bold text-sm">{currentVideoStats.likes}</span>
                                        <span className="text-xs text-gray-500 uppercase tracking-wide">Likes</span>
                                    </div>
                                </div>
                            )}
                         </div>
                    </InteractiveCard>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-6xl mx-auto pt-4">
                        {animeEdits.map((video) => (
                            video.videoId ? (
                                <button
                                    key={video.id}
                                    onClick={() => {
                                        setActiveYouTubeId(video.videoId!);
                                        setIsYtPlaying(true); // Autoplay on thumbnail selection
                                        if (onPortfolioPlay) onPortfolioPlay();
                                    }}
                                    className={`relative aspect-video rounded-xl overflow-hidden transition-all duration-300 border border-transparent select-none ${activeYouTubeId === video.videoId ? 'opacity-100 scale-105 z-10 shadow-xl border-white/20' : 'opacity-60 hover:opacity-100'}`}
                                >
                                    <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} alt="" className="w-full h-full object-cover" />
                                </button>
                            ) : null
                        ))}
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-8">
                   {vfxEdits.map((video) => (
                        <VfxVideoPlayer 
                            key={video.id} 
                            video={video}
                            currentlyPlaying={playingVfxVideo}
                            pipVideo={pipVideo}
                            onPlayRequest={handleVfxPlayRequest}
                            setPipVideo={setPipVideo}
                            forcePaused={forcePaused}
                        />
                    ))}
                </div>
            )}
        </div>
    ), [activeVfxSubTab, playingVfxVideo, pipVideo, activeYouTubeId, isYtPlaying, currentVideoStats, animeEdits, vfxEdits, setActiveVfxSubTab, setPipVideo, setActiveYouTubeId, setIsYtPlaying, forcePaused, onPortfolioPlay, ytContainerRef, isYouTubeApiReady]);
    
    return (
        <section id="portfolio" className="select-none" style={parallaxStyle}>
            <div className="max-w-7xl mx-auto space-y-32 py-16 px-4 sm:px-6 lg:px-8">
                <div className="relative">
                    <div 
                        className="absolute -inset-y-4 -inset-x-0 sm:-inset-6 md:-inset-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl"
                        style={{
                            transform: 'perspective(2000px) rotateY(-1deg)',
                        }}
                    ></div>
                    <div className="relative p-6 md:p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-white">Graphic Design</h2>
                        </div>
                        {GraphicDesignContent}
                    </div>
                </div>

                <div id="video-editing" className="pt-16 relative">
                    <div 
                        className="absolute -inset-y-4 -inset-x-0 sm:-inset-6 md:-inset-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl"
                        style={{
                            transform: 'perspective(2000px) rotateY(1deg)',
                        }}
                    ></div>
                    <div className="relative p-6 md:p-8">
                        <div className="text-center mb-16">
                             <h2 className="text-3xl md:text-4xl font-bold text-white">Video Editing</h2>
                        </div>
                        {VfxContent}
                    </div>
                </div>
            </div>
        </section>
    );
};