import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GraphicWork, VideoWork } from '../hooks/types';
import { LazyImage } from './LazyImage';
import { siteConfig } from '../config';
import { 
    PlayIcon, VolumeOnIcon, VolumeOffIcon, HandThumbUpIcon, 
    GlobeAltIcon, SparklesIcon, CloseIcon, CheckCircleIcon,
    ShareIcon, DownloadIcon, ThreeDotsIcon, PhotoManipulationIcon,
    ThumbnailIcon, BannerIcon, EyeIcon, YouTubeIcon, ChevronRightIcon
} from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { InteractiveCard } from './InteractiveCard';
import { useParallax } from '../contexts/ParallaxContext';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
    gapi: any;
  }
}

const PortfolioSection: React.FC<{ 
    title: string; 
    subtitle: string; 
    icon: React.ReactNode; 
    works: any[]; 
    onItemClick: (work: any) => void;
    id: string;
}> = ({ title, subtitle, icon, works, onItemClick, id }) => (
    <div id={id} className="mb-24 last:mb-0">
        <div className="flex items-center gap-4 mb-10 border-l-4 border-red-600 pl-6">
            <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                {icon}
            </div>
            <div>
                <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">{subtitle}</span>
                <h3 className="text-white text-3xl font-black uppercase tracking-tighter">{title}</h3>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {works.map((work) => (
                <motion.div 
                    key={work.id}
                    whileHover={{ y: -8 }}
                    onClick={(e) => { e.preventDefault(); onItemClick(work); }}
                    className="group relative aspect-square bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer hover:border-red-600/50 transition-all duration-500 shadow-2xl"
                >
                    <img 
                        src={work.imageUrl || work.thumbnailUrl || `https://i.ytimg.com/vi/${work.videoId}/mqdefault.jpg`} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0"
                        alt=""
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                        <h4 className="text-white font-black uppercase tracking-widest text-lg leading-tight mb-2">{work.title || 'Untitled Masterpiece'}</h4>
                        <div className="flex flex-wrap gap-2">
                            {(work.tags || ['#SelectedLegend']).map((tag: string) => (
                                <span key={tag} className="text-[8px] font-black text-red-500 uppercase tracking-widest bg-red-600/10 px-2 py-1 rounded border border-red-600/20">{tag}</span>
                            ))}
                        </div>
                    </div>
                    {(work.videoId || work.url) && (
                        <div className="absolute top-6 right-6 p-3 bg-red-600 rounded-full shadow-2xl scale-0 group-hover:scale-100 transition-transform duration-300">
                            <PlayIcon className="w-4 h-4 text-white" />
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    </div>
);

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
            if (currentTime > 0 && Math.abs(videoEl.currentTime - currentTime) > 1) videoEl.currentTime = currentTime;
            videoEl.play().catch(() => {});
            setHasActuallyPlayed(true);
        } else {
            videoEl.pause();
            if (!isThisVideoInPip && videoEl.currentTime !== 0) videoEl.currentTime = 0;
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
        if (isThisVideoInPip && isVisible) setPipVideo(null);
    }, [isPlaying, hasActuallyPlayed, isVisible, isThisVideoInPip, video]);
    
    return (
        <div ref={containerRef}>
            <InteractiveCard className={`relative group w-full aspect-square bg-black rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${isPlaying ? 'shadow-2xl z-10 border-red-600/50' : 'opacity-90 hover:opacity-100 border-white/5'} border ${isThisVideoInPip ? 'opacity-30 pointer-events-none' : ''}`}>
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
        </div>
    );
};

export const Portfolio: React.FC<any> = ({ 
    openModal, isYouTubeApiReady, playingVfxVideo, setPlayingVfxVideo, pipVideo, setPipVideo,
    activeYouTubeId, setActiveYouTubeId, isYtPlaying, setIsYtPlaying, currentTime, setCurrentTime
}) => {
    const [ytContainerRef, isYtVisible] = useIntersectionObserver({ threshold: 0.1 });
    const { videos: youtubeVideos, stats, loading, formatNumber } = useYouTubeChannelStats();
    const [currentVideoStats, setCurrentVideoStats] = useState<any>(null);
    const playerRef = useRef<any>(null);

    useEffect(() => {
        if (!activeYouTubeId || youtubeVideos.length === 0) return;
        const preFetched = youtubeVideos.find(v => v.id === activeYouTubeId);
        if (preFetched) setCurrentVideoStats({ id: activeYouTubeId, title: preFetched.title, rawViews: preFetched.rawViewCount || 0, likes: preFetched.likeCount || 0 });
    }, [activeYouTubeId, youtubeVideos]);

    useEffect(() => {
        if (!isYouTubeApiReady || !activeYouTubeId) return;
        const initPlayer = () => {
            if (playerRef.current) playerRef.current.destroy();
            playerRef.current = new window.YT.Player('youtube-portfolio-player-inner', {
                videoId: activeYouTubeId,
                playerVars: { autoplay: isYtPlaying ? 1 : 0, modestbranding: 1, rel: 0, start: Math.floor(currentTime) },
                events: {
                    onStateChange: (e: any) => {
                        if (e.data === window.YT.PlayerState.PLAYING) setIsYtPlaying(true);
                        else if (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED) setIsYtPlaying(false);
                    }
                }
            });
        };
        initPlayer();
        return () => { if (playerRef.current) playerRef.current.destroy(); };
    }, [isYouTubeApiReady, activeYouTubeId, !!pipVideo]);

    const animatedLikes = useAnimatedCounter(currentVideoStats?.likes || 0, 2000, activeYouTubeId);
    const animatedViews = useAnimatedCounter(currentVideoStats?.rawViews || 0, 3000, activeYouTubeId);

    const graphicWorks = siteConfig.content.portfolio.graphicWorks;
    const vfxEdits = siteConfig.content.portfolio.vfxEdits;
    const animeEdits = siteConfig.content.portfolio.animeEdits;

    return (
        <section id="portfolio" className="py-24 bg-[#050505] relative z-10 select-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-[0.02] flex items-center justify-center select-none overflow-hidden">
                <span className="text-[40vw] font-black uppercase tracking-tighter">PORTFOLIO</span>
            </div>

            <div className="container mx-auto px-6 max-w-7xl">
                <div className="text-center mb-20">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-red-600 mb-4 block">The Showroom</span>
                    <h2 className="text-white text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">Completed Missions</h2>
                </div>

                {/* YouTube Preview Sector */}
                <div id="video-editing" className="mb-24">
                    <div className="flex items-center gap-4 mb-10 border-l-4 border-red-600 pl-6">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                            <YouTubeIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">Sector YouTube</span>
                            <h3 className="text-white text-3xl font-black uppercase tracking-tighter">Visual Transmissions</h3>
                        </div>
                    </div>

                    <div className="lg:flex lg:gap-12 lg:items-start" ref={ytContainerRef}>
                        <div className="flex-1 space-y-6">
                            <div className="relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-white/10">
                                <div id="youtube-portfolio-player-inner" className="w-full h-full"></div>
                            </div>
                            <div className="bg-[#0f0f0f] p-8 border border-white/5 rounded-[2rem]">
                                <h3 className="text-white font-bold text-xl mb-4">{currentVideoStats?.title || 'Syncing Visual Data...'}</h3>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-red-600/30">
                                            <img src={stats.channelProfilePic || siteConfig.branding.profilePicUrl} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-white font-black text-sm uppercase">{stats.channelTitle}</p>
                                            <p className="text-gray-500 text-[10px] uppercase font-bold">{formatNumber(stats.subscribers)} Agents Synced</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-center">
                                            <p className="text-white font-black text-lg">{formatNumber(animatedViews)}</p>
                                            <p className="text-[8px] text-gray-500 uppercase font-black">Reach</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-red-600 font-black text-lg">{formatNumber(animatedLikes)}</p>
                                            <p className="text-[8px] text-gray-500 uppercase font-black">Support</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="hidden lg:flex flex-col gap-4 w-[300px] flex-shrink-0 h-[650px] overflow-y-auto custom-scrollbar px-4">
                            {animeEdits.map((video: any) => (
                                <button key={video.id} onClick={() => { setActiveYouTubeId(video.videoId); setIsYtPlaying(true); }} className={`relative aspect-video rounded-2xl overflow-hidden border transition-all ${activeYouTubeId === video.videoId ? 'border-red-600 ring-4 ring-red-600/20' : 'border-white/10 opacity-50 hover:opacity-100'}`}>
                                    <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"><PlayIcon className="w-8 h-8 text-white" /></div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <PortfolioSection id="graphic-design" title="Graphic Architecture" subtitle="Sector Alpha" icon={<PhotoManipulationIcon className="w-6 h-6" />} works={graphicWorks} onItemClick={openModal} />
                <div className="mb-24">
                     <div className="flex items-center gap-4 mb-10 border-l-4 border-red-600 pl-6">
                        <div className="w-12 h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">Sector Beta</span>
                            <h3 className="text-white text-3xl font-black uppercase tracking-tighter">Cinematic VFX</h3>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {vfxEdits.map((video: any) => (
                            <VfxVideoPlayer key={video.id} video={video} currentlyPlaying={playingVfxVideo} pipVideo={pipVideo} onPlayRequest={setPlayingVfxVideo} setPipVideo={setPipVideo} currentTime={currentTime} setCurrentTime={setCurrentTime} />
                        ))}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {openModal.selectedWork && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-6" onClick={() => openModal(null)}>
                        <motion.div initial={{ scale: 0.9, y: 40 }} animate={{ scale: 1, y: 0 }} className="relative w-full max-w-6xl aspect-video md:aspect-auto md:h-[85vh] rounded-[3rem] overflow-hidden shadow-[0_0_150px_rgba(220,38,38,0.3)] bg-black border border-white/10" onClick={e => e.stopPropagation()}>
                            <button onClick={() => openModal(null)} className="absolute top-8 right-8 z-[600] p-4 bg-black/60 hover:bg-red-600 rounded-full text-white transition-all border border-white/10"><CloseIcon className="w-6 h-6" /></button>
                            <div className="w-full h-full relative">
                                {openModal.selectedWork.videoId ? <iframe src={`https://www.youtube.com/embed/${openModal.selectedWork.videoId}?autoplay=1`} className="w-full h-full" /> : <img src={openModal.selectedWork.imageUrl} className="w-full h-full object-contain" />}
                                <div className="absolute bottom-0 left-0 right-0 p-12 bg-gradient-to-t from-black via-black/80 to-transparent">
                                    <h3 className="text-white text-3xl font-black uppercase tracking-tighter">{openModal.selectedWork.title}</h3>
                                    <p className="text-gray-400 text-sm italic mt-2">{openModal.selectedWork.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};