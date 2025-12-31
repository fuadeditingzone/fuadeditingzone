
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicWork, VideoWork } from '../hooks/types';
import { siteConfig } from '../config';
import { 
    PlayIcon, VolumeOnIcon, VolumeOffIcon, SparklesIcon, PhotoManipulationIcon, YouTubeIcon, ChevronRightIcon
} from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { InteractiveCard } from './InteractiveCard';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const PortfolioSection: React.FC<{ 
    title: string; 
    subtitle: string; 
    icon: React.ReactNode; 
    works: any[]; 
    onItemClick: (items: any[], index: number) => void;
    id: string;
    nextSectionId?: string;
    nextSectionTitle?: string;
}> = ({ title, subtitle, icon, works, onItemClick, id, nextSectionId, nextSectionTitle }) => {
    const [ref, inView] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.95 },
        visible: { 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <div id={id} ref={ref as any} className="mb-20 md:mb-32 last:mb-0">
            <div className="flex items-center gap-4 mb-8 md:mb-10 border-l-4 border-red-600 pl-6">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                    {icon}
                </div>
                <div>
                    <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">{subtitle}</span>
                    <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter">{title}</h3>
                </div>
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
                {works.map((work, index) => (
                    <motion.div 
                        key={work.id}
                        variants={itemVariants}
                        whileHover={{ y: -5, scale: 1.01 }}
                        onClick={() => onItemClick(works, index)}
                        className="group relative aspect-square bg-[#0a0a0a] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-red-600/50 transition-all duration-500 shadow-2xl"
                    >
                        <img 
                            src={work.imageUrl || work.thumbnailUrl || `https://i.ytimg.com/vi/${work.videoId}/mqdefault.jpg`} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            alt=""
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 md:p-8">
                            <h4 className="text-white font-black uppercase tracking-widest text-base md:text-lg leading-tight mb-2 truncate">{work.title || 'Masterpiece'}</h4>
                            <div className="flex flex-wrap gap-1.5 md:gap-2">
                                {(work.tags || ['#CreativeWork']).map((tag: string) => (
                                    <span key={tag} className="text-[7px] md:text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-1.5 py-0.5 rounded border border-red-600/20">{tag}</span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
            
            {nextSectionId && (
                <div className="mt-12 md:mt-16 flex justify-center">
                    <button 
                        onClick={() => document.getElementById(nextSectionId)?.scrollIntoView({ behavior: 'smooth' })}
                        className="group flex flex-col items-center gap-3 md:gap-4 transition-all hover:scale-105"
                    >
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white">Next: {nextSectionTitle}</span>
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 group-hover:bg-red-600/10 transition-all">
                            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 rotate-90 text-zinc-500 group-hover:text-red-500" />
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
};

const VfxVideoPlayer: React.FC<{
    video: VideoWork;
    currentlyPlaying: VideoWork | null;
    pipVideo: VideoWork | null;
    onPlayRequest: (video: VideoWork | null) => void;
    setPipVideo: (video: VideoWork | null) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    variants?: any;
}> = ({ video, currentlyPlaying, pipVideo, onPlayRequest, setPipVideo, currentTime, setCurrentTime, variants }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [containerRef, isVisible] = useIntersectionObserver({ threshold: 0.5 });
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    const isPlaying = currentlyPlaying?.id === video.id;
    const isThisVideoInPip = pipVideo?.id === video.id;

    useEffect(() => {
        const videoEl = videoRef.current;
        if (!videoEl) return;
        if (isPlaying && !isThisVideoInPip) {
            videoEl.play().catch(() => {});
        } else {
            videoEl.pause();
        }
    }, [isPlaying, isThisVideoInPip]);

    return (
        <motion.div ref={containerRef as any} variants={variants}>
            <InteractiveCard className={`relative group w-full aspect-square bg-black rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ${isPlaying ? 'shadow-2xl z-10 border-red-600/50' : 'opacity-90 hover:opacity-100 border-white/5'} border ${isThisVideoInPip ? 'opacity-30 pointer-events-none' : ''}`}>
                <figure className="w-full h-full m-0 p-0" onClick={() => onPlayRequest(isPlaying ? null : video)}>
                    <video ref={videoRef} src={video.url} loop muted={isMuted} playsInline className="w-full h-full object-contain" onCanPlay={() => setIsLoading(false)} />
                    <div className={`absolute inset-0 bg-black/20 transition-opacity flex items-center justify-center ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                         {!isPlaying && !isLoading && <PlayIcon className="w-8 h-8 text-white/80 drop-shadow-lg" />}
                    </div>
                    {isPlaying && (
                        <div className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full z-20" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                            {isMuted ? <VolumeOffIcon className="w-4 h-4 text-white" /> : <VolumeOnIcon className="w-4 h-4 text-white" />}
                        </div>
                    )}
                </figure>
            </InteractiveCard>
        </motion.div>
    );
};

export const Portfolio: React.FC<any> = ({ 
    openModal, isYouTubeApiReady, playingVfxVideo, setPlayingVfxVideo, pipVideo, setPipVideo,
    activeYouTubeId, setActiveYouTubeId, isYtPlaying, setIsYtPlaying, currentTime, setCurrentTime
}) => {
    const { videos: youtubeVideos, stats, loading, formatNumber } = useYouTubeChannelStats();
    const [currentVideoStats, setCurrentVideoStats] = useState<any>(null);
    const playerRef = useRef<any>(null);
    const [vfxRef, vfxInView] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    useEffect(() => {
        if (!activeYouTubeId || youtubeVideos.length === 0) return;
        const preFetched = youtubeVideos.find(v => v.id === activeYouTubeId);
        if (preFetched) setCurrentVideoStats({ id: activeYouTubeId, title: preFetched.title, rawViews: preFetched.rawViewCount || 0, likes: preFetched.likeCount || 0 });
    }, [activeYouTubeId, youtubeVideos]);

    useEffect(() => {
        if (!isYouTubeApiReady || !activeYouTubeId) return;
        const initPlayer = () => {
            if (playerRef.current) playerRef.current.destroy();
            // FIX: Using type casting to access YT property on window object
            playerRef.current = new (window as any).YT.Player('youtube-portfolio-player-inner', {
                videoId: activeYouTubeId,
                playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
                events: {
                    onStateChange: (e: any) => {
                        // FIX: Using type casting to access YT property on window object
                        if (e.data === (window as any).YT.PlayerState.PLAYING) setIsYtPlaying(true);
                        else if (e.data === (window as any).YT.PlayerState.PAUSED || e.data === (window as any).YT.PlayerState.ENDED) setIsYtPlaying(false);
                    }
                }
            });
        };
        initPlayer();
        return () => { if (playerRef.current) playerRef.current.destroy(); };
    }, [isYouTubeApiReady, activeYouTubeId]);

    const animatedLikes = useAnimatedCounter(currentVideoStats?.likes || 0, 2000, activeYouTubeId);
    const animatedViews = useAnimatedCounter(currentVideoStats?.rawViews || 0, 3000, activeYouTubeId);

    const graphicWorks = siteConfig.content.portfolio.graphicWorks;
    const vfxEdits = siteConfig.content.portfolio.vfxEdits;
    const animeEdits = siteConfig.content.portfolio.animeEdits;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 15 },
        visible: { 
            opacity: 1, scale: 1, y: 0,
            transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
        }
    };

    return (
        <section id="portfolio" className="py-20 md:py-24 bg-[#050505] relative z-10 select-none overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="text-center mb-16 md:mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-4 block">Video</span>
                    <h2 className="text-white text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none">YouTube Edits</h2>
                </div>

                {/* YouTube Sector First */}
                <div id="video-editing" className="mb-20 md:mb-32">
                    <div className="flex items-center gap-4 mb-8 md:mb-10 border-l-4 border-red-600 pl-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                            <YouTubeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">YouTube</span>
                            <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter">Content Feed</h3>
                        </div>
                    </div>

                    <div className="lg:flex lg:gap-12 lg:items-start">
                        <div className="flex-1 space-y-4 md:space-y-6">
                            <div className="relative aspect-video w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-white/10">
                                <div id="youtube-portfolio-player-inner" className="w-full h-full"></div>
                            </div>
                            <div className="bg-[#0f0f0f] p-6 md:p-8 border border-white/5 rounded-[1.5rem] md:rounded-[2rem]">
                                <h3 className="text-white font-bold text-lg md:text-xl mb-4 truncate">{currentVideoStats?.title || 'Syncing...'}</h3>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border border-red-600/30 flex-shrink-0">
                                            <img src={stats.channelProfilePic || siteConfig.branding.profilePicUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-black text-xs md:text-sm uppercase truncate">{stats.channelTitle}</p>
                                            <p className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold truncate">{formatNumber(stats.subscribers)} Subscribers</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 md:gap-6 flex-shrink-0">
                                        <div className="text-center">
                                            <p className="text-white font-black text-base md:text-lg">{formatNumber(animatedViews)}</p>
                                            <p className="text-[7px] md:text-[8px] text-zinc-500 uppercase font-black">Views</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-red-600 font-black text-base md:text-lg">{formatNumber(animatedLikes)}</p>
                                            <p className="text-[7px] md:text-[8px] text-zinc-500 uppercase font-black">Likes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col gap-4 w-[300px] flex-shrink-0 h-[600px] overflow-y-auto custom-scrollbar px-4">
                            {animeEdits.map((video: any) => (
                                <button key={video.id} onClick={() => { setActiveYouTubeId(video.videoId); setIsYtPlaying(true); }} className={`relative aspect-video rounded-2xl overflow-hidden border transition-all ${activeYouTubeId === video.videoId ? 'border-red-600 ring-4 ring-red-600/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                                    <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="mt-12 flex justify-center">
                        <button 
                            onClick={() => document.getElementById('vfx-animations')?.scrollIntoView({ behavior: 'smooth' })}
                            className="group flex flex-col items-center gap-3 transition-all hover:scale-105"
                        >
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white">Next: VFX Mastery</span>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 transition-all">
                                <ChevronRightIcon className="w-4 h-4 rotate-90 text-zinc-500 group-hover:text-red-500" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* VFX Sector */}
                <div id="vfx-animations" className="mb-20 md:mb-32" ref={vfxRef as any}>
                     <div className="flex items-center gap-4 mb-8 md:mb-10 border-l-4 border-red-600 pl-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                            <SparklesIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">Visuals</span>
                            <h3 className="text-white text-2xl md:text-3xl font-black uppercase tracking-tighter">VFX Mastery</h3>
                        </div>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" animate={vfxInView ? "visible" : "hidden"} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {vfxEdits.map((video: any) => (
                            <VfxVideoPlayer key={video.id} video={video} currentlyPlaying={playingVfxVideo} pipVideo={pipVideo} onPlayRequest={setPlayingVfxVideo} setPipVideo={setPipVideo} currentTime={currentTime} setCurrentTime={setCurrentTime} variants={itemVariants} />
                        ))}
                    </motion.div>
                    <div className="mt-12 flex justify-center">
                        <button onClick={() => document.getElementById('graphic-design')?.scrollIntoView({ behavior: 'smooth' })} className="group flex flex-col items-center gap-3 transition-all hover:scale-105">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 group-hover:text-white">Next: Graphic Designs</span>
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-red-600 transition-all">
                                <ChevronRightIcon className="w-4 h-4 rotate-90 text-zinc-500 group-hover:text-red-500" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Graphic Sector */}
                <PortfolioSection 
                    id="graphic-design" 
                    title="Graphic Designs" 
                    subtitle="Creative" 
                    icon={<PhotoManipulationIcon className="w-5 h-5 md:w-6 md:h-6" />} 
                    works={graphicWorks} 
                    onItemClick={(items, index) => openModal(items, index)}
                    nextSectionId="community"
                    nextSectionTitle="Community Chat"
                />
            </div>
        </section>
    );
};
