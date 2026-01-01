import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDatabase, ref, onValue, query, orderByChild, equalTo, update, set, remove, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { useUser } from '@clerk/clerk-react';
import type { GraphicWork, VideoWork, ContentSection } from '../hooks/types';
import { siteConfig } from '../config';
import { 
    PlayIcon, VolumeOnIcon, VolumeOffIcon, SparklesIcon, PhotoManipulationIcon, YouTubeIcon, ChevronRightIcon, VfxIcon, BannerIcon, ThumbnailIcon, CloseIcon, ShareIcon
} from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';

const OWNER_HANDLE = 'fuadeditingzone';
const DELETE_SECRET_CODE = '62114@#';

const PortfolioSection: React.FC<{ 
    title: string; 
    subtitle: string; 
    icon: React.ReactNode; 
    works: any[]; 
    onItemClick: (items: any[], index: number) => void;
    id: string;
    aspectRatio?: 'square' | 'video' | 'banner';
    isOwner?: boolean;
    onDeleteItem?: (work: any) => void;
}> = ({ title, subtitle, icon, works, onItemClick, id, aspectRatio = 'square', isOwner, onDeleteItem }) => {
    const [ref, inView] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });
    const [copyToast, setCopyToast] = useState(false);

    const handleQuickShare = (e: React.MouseEvent, work: any) => {
        e.stopPropagation();
        const url = `${window.location.origin}/work/${work.id}`;
        navigator.clipboard.writeText(url);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05, delayChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 10 },
        visible: { 
            opacity: 1, scale: 1, y: 0,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const aspectClass = {
        square: 'aspect-square',
        video: 'aspect-video',
        banner: 'aspect-[21/9]'
    }[aspectRatio];

    return (
        <div id={id} ref={ref as any} className="mb-24 last:mb-0 px-4 md:px-0 overflow-visible">
            <AnimatePresence>
                {copyToast && (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[500] bg-white text-black px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl">Preview Link Copied</motion.div>
                )}
            </AnimatePresence>
            
            <div className="flex items-center justify-between mb-8 md:mb-12 border-l-4 border-red-600 pl-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                        {icon}
                    </div>
                    <div>
                        <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">{subtitle}</span>
                        <h2 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">{title}</h2>
                    </div>
                </div>
                {isOwner && (
                    <button onClick={() => window.location.pathname = '/marketplace'} className="bg-red-600/10 border border-red-600/20 text-red-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">
                        + Add Work
                    </button>
                )}
            </div>

            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate={inView ? "visible" : "hidden"}
                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-7xl mx-auto px-2 md:px-0"
            >
                {works.map((work, index) => (
                    <motion.div 
                        key={work.id}
                        variants={itemVariants}
                        className={`group relative ${aspectClass} bg-[#0a0a0a] rounded-[1.2rem] md:rounded-[2rem] overflow-hidden border border-white/10 shadow-xl`}
                    >
                        <div className="w-full h-full cursor-pointer" onClick={() => onItemClick(works, index)}>
                            <img 
                                src={work.imageUrl || work.thumbnailUrl || (work.mediaUrl && work.mediaType === 'image' ? work.mediaUrl : `https://i.ytimg.com/vi/${work.videoId}/mqdefault.jpg`)} 
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                alt={`${work.title || 'Portfolio Work'} | Fuad Editing Zone - ${title}`}
                            />
                            {work.mediaType === 'video' && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <PlayIcon className="w-8 h-8 text-white/80" />
                                </div>
                            )}
                        </div>

                        <div className="absolute top-4 right-4 flex gap-2">
                            <button 
                                onClick={(e) => handleQuickShare(e, work)}
                                className="p-2 bg-black/80 hover:bg-red-600 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Copy Preview Link"
                            >
                                <ShareIcon className="w-3.5 h-3.5" />
                            </button>
                            {isOwner && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onDeleteItem?.(work); }}
                                    className="p-2 bg-black/80 hover:bg-red-600 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove from Portfolio"
                                >
                                    <CloseIcon className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4 md:p-6">
                            <h3 className="text-white font-black uppercase tracking-widest text-[8px] md:text-xs leading-tight truncate">{work.title || 'Portfolio Work'}</h3>
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

const VfxVideoPlayer: React.FC<{
    video: any;
    currentlyPlaying: VideoWork | null;
    pipVideo: VideoWork | null;
    onPlayRequest: (video: VideoWork | null) => void;
    setPipVideo: (video: VideoWork | null) => void;
    currentTime: number;
    setCurrentTime: (time: number) => void;
    variants?: any;
    isOwner?: boolean;
    onDeleteItem?: (work: any) => void;
}> = ({ video, currentlyPlaying, pipVideo, onPlayRequest, setPipVideo, currentTime, setCurrentTime, variants, isOwner, onDeleteItem }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [containerRef] = useIntersectionObserver({ threshold: 0.5 });
    const [isMuted, setIsMuted] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [copyToast, setCopyToast] = useState(false);

    const videoUrl = video.url || video.mediaUrl;
    const isPlaying = currentlyPlaying?.id === video.id;
    const isThisVideoInPip = pipVideo?.id === video.id;

    const handleQuickShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/work/${video.id}`;
        navigator.clipboard.writeText(url);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2000);
    };

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
        <motion.div ref={containerRef as any} variants={variants} className="group relative aspect-square bg-black rounded-[1.2rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 hover:border-red-600/50 transition-all duration-500">
            <AnimatePresence>
                {copyToast && (
                    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[500] bg-white text-black px-4 py-2 rounded-full font-black uppercase text-[8px] tracking-widest shadow-2xl">Signal Copied</motion.div>
                )}
            </AnimatePresence>
            
            <figure className="w-full h-full m-0 p-0 cursor-pointer" onClick={() => onPlayRequest(isPlaying ? null : video)}>
                <video ref={videoRef} src={videoUrl} loop muted={isMuted} playsInline className="w-full h-full object-cover" onCanPlay={() => setIsLoading(false)} title={`${video.title || 'VFX Work'} | Fuad Editing Zone Mastery`} />
                <div className={`absolute inset-0 bg-black/20 transition-opacity flex items-center justify-center ${isPlaying ? 'opacity-0 hover:opacity-100' : 'opacity-100'}`}>
                     {!isPlaying && !isLoading && <PlayIcon className="w-10 h-10 text-white/80 drop-shadow-lg" />}
                </div>
                {isPlaying && (
                    <div className="absolute bottom-4 right-4 p-2 bg-black/50 backdrop-blur-md rounded-full z-20" onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}>
                        {isMuted ? <VolumeOffIcon className="w-4 h-4 text-white" /> : <VolumeOnIcon className="w-4 h-4 text-white" />}
                    </div>
                )}
            </figure>
            
            <div className="absolute top-4 right-4 flex gap-2">
                <button 
                    onClick={handleQuickShare}
                    className="p-2 bg-black/80 hover:bg-red-600 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy Preview Link"
                >
                    <ShareIcon className="w-3.5 h-3.5" />
                </button>
                {isOwner && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDeleteItem?.(video); }}
                        className="p-2 bg-black/80 hover:bg-red-600 text-white rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from Portfolio"
                    >
                        <CloseIcon className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

export const Portfolio: React.FC<any> = ({ 
    openModal, isYouTubeApiReady, playingVfxVideo, setPlayingVfxVideo, pipVideo, setPipVideo,
    activeYouTubeId, setActiveYouTubeId, isYtPlaying, setIsYtPlaying, currentTime, setCurrentTime
}) => {
    const { user } = useUser();
    const db = getDatabase();
    const { videos: youtubeVideos, stats, loading, formatNumber } = useYouTubeChannelStats();
    const [currentVideoStats, setCurrentVideoStats] = useState<any>(null);
    const [promotedPosts, setPromotedPosts] = useState<any[]>([]);
    const [hiddenStaticWorks, setHiddenStaticWorks] = useState<string[]>([]);
    const playerRef = useRef<any>(null);
    const [vfxRef, vfxInView] = useIntersectionObserver({ threshold: 0.1, triggerOnce: true });

    const isOwner = user?.username === OWNER_HANDLE;

    useEffect(() => {
        const postsRef = query(ref(db, 'explore_posts'), orderByChild('targetSection'));
        const unsub = onValue(postsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data)
                    .map(([id, val]: [string, any]) => ({ id, ...val }))
                    .filter(p => p.targetSection && p.targetSection !== 'Marketplace Only');
                setPromotedPosts(list);
            }
        });

        const hiddenRef = ref(db, 'system/hidden_portfolio_items');
        const unsubHidden = onValue(hiddenRef, (snap) => {
            const data = snap.val() || {};
            setHiddenStaticWorks(Object.keys(data));
        });

        return () => { unsub(); unsubHidden(); };
    }, []);

    useEffect(() => {
        if (!activeYouTubeId || youtubeVideos.length === 0) return;
        const preFetched = youtubeVideos.find(v => v.id === activeYouTubeId);
        if (preFetched) setCurrentVideoStats({ id: activeYouTubeId, title: preFetched.title, rawViews: preFetched.rawViewCount || 0, likes: preFetched.likeCount || 0 });
    }, [activeYouTubeId, youtubeVideos]);

    useEffect(() => {
        if (!isYouTubeApiReady || !activeYouTubeId) return;
        const initPlayer = () => {
            if (playerRef.current) playerRef.current.destroy();
            playerRef.current = new (window as any).YT.Player('youtube-portfolio-player-inner', {
                videoId: activeYouTubeId,
                playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
                events: {
                    onStateChange: (e: any) => {
                        if (e.data === (window as any).YT.PlayerState.PLAYING) setIsYtPlaying(true);
                        else if (e.data === (window as any).YT.PlayerState.PAUSED || e.data === (window as any).YT.PlayerState.ENDED) setIsYtPlaying(false);
                    }
                }
            });
        };
        initPlayer();
        return () => { if (playerRef.current) playerRef.current.destroy(); };
    }, [isYouTubeApiReady, activeYouTubeId]);

    const handleHideOrDelete = async (work: any) => {
        if (!isOwner) return;
        
        const code = window.prompt("Security clearance required. Enter secret code to remove this item:");
        if (code === null) return; // User cancelled
        
        if (code !== DELETE_SECRET_CODE) {
            alert("Authorization denied: Incorrect secret code.");
            return;
        }

        if (work.id && typeof work.id === 'string' && work.userId) {
            // This is a dynamic post from marketplace
            await update(ref(db, `explore_posts/${work.id}`), { targetSection: 'Marketplace Only' });
        } else {
            // This is a static hardcoded item, hide it
            await set(ref(db, `system/hidden_portfolio_items/${work.id}`), true);
        }
    };

    const handleRestoreWork = async (id: string) => {
        await remove(ref(db, `system/hidden_portfolio_items/${id}`));
    };

    const animatedLikes = useAnimatedCounter(currentVideoStats?.likes || 0, 2000, activeYouTubeId);
    const animatedViews = useAnimatedCounter(currentVideoStats?.rawViews || 0, 3000, activeYouTubeId);

    const getWorksForSection = (sectionName: ContentSection, hardcoded: any[]) => {
        const dynamic = promotedPosts.filter(p => p.targetSection === sectionName);
        const filteredHardcoded = hardcoded.filter(w => !hiddenStaticWorks.includes(String(w.id)));
        return [...filteredHardcoded, ...dynamic].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    };

    const photoManipWorks = useMemo(() => getWorksForSection('Photo Manipulation', siteConfig.content.portfolio.graphicWorks.filter(w => w.category === 'Photo Manipulation')), [promotedPosts, hiddenStaticWorks]);
    const thumbnailWorks = useMemo(() => getWorksForSection('Thumbnail Designs', siteConfig.content.portfolio.graphicWorks.filter(w => w.category === 'Thumbnail Designs')), [promotedPosts, hiddenStaticWorks]);
    const bannerWorks = useMemo(() => getWorksForSection('Banner Designs', siteConfig.content.portfolio.graphicWorks.filter(w => w.category === 'Banner Designs')), [promotedPosts, hiddenStaticWorks]);
    const vfxWorks = useMemo(() => getWorksForSection('VFX', siteConfig.content.portfolio.vfxEdits), [promotedPosts, hiddenStaticWorks]);

    const animeEdits = siteConfig.content.portfolio.animeEdits;

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
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
                <div className="text-center mb-16 md:mb-24">
                    <h2 className="text-white text-4xl md:text-8xl font-black uppercase tracking-tighter leading-none">Portfolio</h2>
                </div>

                <PortfolioSection 
                    id="photo-manipulation" 
                    title="Photo Manipulation" 
                    subtitle="Advanced Composition" 
                    icon={<PhotoManipulationIcon className="w-5 h-5 md:w-6 md:h-6" />} 
                    works={photoManipWorks} 
                    onItemClick={(items, index) => openModal(items, index)}
                    aspectRatio="square"
                    isOwner={isOwner}
                    onDeleteItem={handleHideOrDelete}
                />

                <PortfolioSection 
                    id="thumbnail-designs" 
                    title="Thumbnails" 
                    subtitle="High CTR Design" 
                    icon={<ThumbnailIcon className="w-5 h-5 md:w-6 md:h-6" />} 
                    works={thumbnailWorks} 
                    onItemClick={(items, index) => openModal(items, index)}
                    aspectRatio="video"
                    isOwner={isOwner}
                    onDeleteItem={handleHideOrDelete}
                />

                <PortfolioSection 
                    id="banner-designs" 
                    title="Banners" 
                    subtitle="Profile Identity" 
                    icon={<BannerIcon className="w-5 h-5 md:w-6 md:h-6" />} 
                    works={bannerWorks} 
                    onItemClick={(items, index) => openModal(items, index)}
                    aspectRatio="banner"
                    isOwner={isOwner}
                    onDeleteItem={handleHideOrDelete}
                />

                <div id="video-editing" className="mb-24 md:mb-32 px-6 md:px-0">
                    <div className="flex items-center gap-4 mb-8 md:mb-12 border-l-4 border-red-600 pl-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                            <YouTubeIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">YouTube Edits</span>
                            <h2 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tighter">Content Feed</h2>
                        </div>
                    </div>

                    <div className="lg:flex lg:gap-12 lg:items-start space-y-8 lg:space-y-0">
                        <div className="flex-1 space-y-6">
                            <div className="relative aspect-video w-full rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-black border border-white/5">
                                <div id="youtube-portfolio-player-inner" className="w-full h-full"></div>
                            </div>
                            <div className="bg-[#0f0f0f] p-6 md:p-8 border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem]">
                                <h3 className="text-white font-bold text-lg md:text-2xl mb-4 truncate">{currentVideoStats?.title || 'Syncing...'}</h3>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                                        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border border-red-600/30 flex-shrink-0">
                                            <img src={stats.channelProfilePic || siteConfig.branding.profilePicUrl} className="w-full h-full object-cover" alt="Selected Legend YouTube Profile" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-black text-sm md:text-lg uppercase truncate">{stats.channelTitle}</p>
                                            <p className="text-zinc-500 text-[10px] uppercase font-bold truncate">{formatNumber(stats.subscribers)} Subscribers</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 flex-shrink-0">
                                        <div className="text-center">
                                            <p className="text-white font-black text-lg md:text-2xl">{formatNumber(animatedViews)}</p>
                                            <p className="text-[8px] text-zinc-500 uppercase font-black">Views</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-red-600 font-black text-lg md:text-2xl">{formatNumber(animatedLikes)}</p>
                                            <p className="text-[8px] text-zinc-500 uppercase font-black">Likes</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 w-full lg:w-[320px] flex-shrink-0">
                            {animeEdits.slice(0, 4).map((video: any) => (
                                <button key={video.id} onClick={() => { setActiveYouTubeId(video.videoId); setIsYtPlaying(true); }} className={`relative aspect-video rounded-xl md:rounded-2xl overflow-hidden border transition-all ${activeYouTubeId === video.videoId ? 'border-red-600 ring-4 ring-red-600/20 scale-[1.02]' : 'border-white/10 opacity-60 hover:opacity-100'}`}>
                                    <img src={`https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`} className="w-full h-full object-cover" alt="Video Thumbnail" />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div id="vfx-animations" className="mb-24 md:mb-32 px-6 md:px-0" ref={vfxRef as any}>
                     <div className="flex items-center gap-4 mb-8 md:mb-12 border-l-4 border-red-600 pl-6">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-red-600/10 flex items-center justify-center border border-red-600/20 text-red-500">
                            <VfxIcon className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div>
                            <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-[0.4em] mb-1 block">Visual Effects</span>
                            <h2 className="text-white text-2xl md:text-4xl font-black uppercase tracking-tighter">VFX Mastery</h2>
                        </div>
                    </div>
                    <motion.div variants={containerVariants} initial="hidden" animate={vfxInView ? "visible" : "hidden"} className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 max-w-7xl mx-auto px-2 md:px-0">
                        {vfxWorks.map((video: any) => (
                            <VfxVideoPlayer 
                                key={video.id} 
                                video={video} 
                                currentlyPlaying={playingVfxVideo} 
                                pipVideo={pipVideo} 
                                onPlayRequest={setPlayingVfxVideo} 
                                setPipVideo={setPipVideo} 
                                currentTime={currentTime} 
                                setCurrentTime={setCurrentTime} 
                                variants={itemVariants} 
                                isOwner={isOwner}
                                onDeleteItem={handleHideOrDelete}
                            />
                        ))}
                    </motion.div>
                </div>

                {isOwner && hiddenStaticWorks.length > 0 && (
                    <div className="mt-20 p-10 bg-white/5 border border-white/5 rounded-[3rem]">
                        <h3 className="text-red-500 font-black uppercase tracking-[0.3em] text-sm mb-6">Owner Console: Hidden Works</h3>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                            {hiddenStaticWorks.map(id => (
                                <button 
                                    key={id} 
                                    onClick={() => handleRestoreWork(id)}
                                    className="p-3 bg-red-600/20 text-red-500 rounded-xl font-black text-[9px] uppercase tracking-widest border border-red-600/20 hover:bg-red-600 hover:text-white transition-all"
                                >
                                    Restore {id}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};