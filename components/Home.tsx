import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../config';
import { ThreeDotsIcon, CheckCircleIcon, YouTubeIcon, SparklesIcon, VfxIcon, ThumbnailIcon, PhotoManipulationIcon } from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useParallax } from '../contexts/ParallaxContext';

const AnimatedDigit: React.FC<{ digit: string }> = React.memo(({ digit }) => {
    const d = parseInt(digit, 10);
    const h = 1.4; 
    const y = -d * h; 

    return (
        <span className="inline-block w-[0.75em] h-[1.4em] overflow-hidden align-bottom leading-[1.4]">
            <span 
                className="inline-block transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] w-full text-center"
                style={{ transform: `translateY(${y}em)` }}
            >
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="block h-[1.4em]">{i}</span>
                ))}
            </span>
        </span>
    );
});

const StretchyCounter: React.FC<{ value: number }> = ({ value }) => {
    const formatted = new Intl.NumberFormat('en-US').format(value);
    
    return (
        <span className="flex items-center justify-center tabular-nums">
            {formatted.split('').map((char, index) => {
                if (/\d/.test(char)) {
                    return <AnimatedDigit key={`${char}-${index}`} digit={char} />;
                }
                return <span key={index} className="w-[0.45em] inline-block text-center">{char}</span>;
            })}
        </span>
    );
};

const ShowcaseVideo: React.FC<{ src: string }> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    }, []);
    return (
        <video 
            ref={videoRef}
            src={src} 
            muted 
            loop 
            playsInline 
            className="w-full h-full object-cover grayscale-[0.3] brightness-75 hover:grayscale-0 hover:brightness-100 transition-all duration-700" 
        />
    );
};

interface HomeProps {
  onOpenServices: () => void;
  onOrderNow: () => void;
  onYouTubeClick?: () => void;
}

export const Home: React.FC<HomeProps> = ({ 
    onOpenServices, 
    onOrderNow,
    onYouTubeClick
}) => {
    const { stats, loading } = useYouTubeChannelStats();
    const { x, y } = useParallax();
    const [phase, setPhase] = useState<'ad' | 'main'>('ad');
    const [countdown, setCountdown] = useState(5);
    
    // Stats animate over 5 seconds, starting only when main phase is active
    const animatedSubs = useAnimatedCounter(phase === 'main' ? stats.subscribers : 0, 5000);
    const animatedViews = useAnimatedCounter(phase === 'main' ? stats.views : 0, 5000);
    
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setPhase('main');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const proSkills = ['VFX Mastery', 'YouTube Thumbnail', 'Photo Manipulation', 'Banner Designs', 'Social Media Post', 'AMV EDIT', 'Graphic Design'];
    const sortedHeroSkills = [...siteConfig.content.introCard.skills].sort((a, b) => {
        const aIsPro = proSkills.includes(a);
        const bIsPro = proSkills.includes(b);
        if (aIsPro && !bIsPro) return -1;
        if (!aIsPro && bIsPro) return 1;
        return 0;
    }).slice(0, 5);

    const headlineStyle = {
        transform: `perspective(1200px) rotateX(${y * -1.5}deg) rotateY(${x * 1.5}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    const showcaseVisuals = [
        { type: 'video', src: siteConfig.content.portfolio.vfxEdits[0].url, label: "Cinematic VFX" },
        { type: 'image', src: siteConfig.content.portfolio.graphicWorks[0].imageUrl, label: "Pro Manipulation" },
        { type: 'video', src: siteConfig.content.portfolio.vfxEdits[1].url, label: "VFX Mastery" },
        { type: 'image', src: siteConfig.content.portfolio.graphicWorks[12]?.imageUrl || siteConfig.content.portfolio.graphicWorks[1].imageUrl, label: "Thumbnails" }
    ];

    return (
        <section 
            id="home" 
            className="h-[100dvh] min-h-[580px] md:min-h-[600px] flex flex-col items-center justify-center relative select-none overflow-hidden p-4 pt-12 md:pt-20"
        >
            <AnimatePresence mode="wait">
                {phase === 'ad' ? (
                    /* DYNAMIC VISUAL AD PHASE */
                    <motion.div 
                        key="showcase"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                        transition={{ duration: 0.8 }}
                        className="relative z-20 w-full h-full flex flex-col items-center justify-center"
                    >
                        {/* Background Media Grid */}
                        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-1 p-1 opacity-40">
                            {showcaseVisuals.map((item, i) => (
                                <div key={i} className="relative overflow-hidden">
                                    {item.type === 'video' ? (
                                        <ShowcaseVideo src={item.src!} />
                                    ) : (
                                        <img src={item.src} className="w-full h-full object-cover" />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Centered Content */}
                        <div className="relative z-30 px-6 max-w-5xl text-center">
                            <motion.div 
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="mb-6"
                            >
                                <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-[0.4em] shadow-lg">
                                    Highlight Reel
                                </span>
                            </motion.div>

                            <motion.h2 
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-4xl sm:text-6xl md:text-8xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-8"
                            >
                                VISUAL <span className="text-red-600">EXCELLENCE</span> <br />
                                <span className="text-gray-500">WITHOUT LIMITS</span>
                            </motion.h2>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl mx-auto">
                                {showcaseVisuals.map((item, i) => (
                                    <motion.div 
                                        key={i}
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.7 + (i * 0.1) }}
                                        className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex flex-col items-center gap-3"
                                    >
                                        <div className="text-red-600 font-black text-[10px] uppercase tracking-widest">{item.label}</div>
                                        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div 
                                                className="h-full bg-red-600"
                                                initial={{ width: 0 }}
                                                animate={{ width: '100%' }}
                                                transition={{ delay: 1, duration: 4, ease: "linear" }}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Skip / Countdown Overlay */}
                        <div className="absolute bottom-10 right-10 flex items-center gap-4 z-40">
                             <div className="text-right hidden sm:block">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Entering Studio in</p>
                                <p className="text-sm font-black text-white">{countdown}s</p>
                            </div>
                            <button 
                                onClick={() => setPhase('main')}
                                className="bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 backdrop-blur-md"
                            >
                                Skip Showcase
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* MAIN IDENTITY PHASE */
                    <motion.div 
                        key="main"
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className="relative z-10 w-full text-center flex flex-col items-center max-w-6xl -mt-20 md:mt-[-4vh]" 
                        style={headlineStyle}
                    >
                        {/* 1. ARTIST IDENTITY HEADER */}
                        <div className="relative flex flex-col md:flex-row items-center justify-center mb-6 md:mb-10 gap-4 md:gap-8 min-h-[160px] md:min-h-[220px]">
                            {/* Profile Picture */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.4, x: -60, rotate: -25 }}
                                animate={{ opacity: 1, scale: 1, x: 0, rotate: 0 }}
                                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                                className="relative group flex-shrink-0 z-30"
                            >
                                <div className="relative w-24 h-24 md:w-44 md:h-44 rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden border-2 border-white/30 bg-black">
                                    <img 
                                        src={siteConfig.branding.profilePicUrl} 
                                        alt={siteConfig.branding.author} 
                                        className="w-full h-full object-cover object-top origin-top transition-transform duration-500 group-hover:scale-105" 
                                        style={{ objectPosition: 'center top', imageRendering: 'auto' }}
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-red-600 text-white py-1 px-2 md:py-2 md:px-4 rounded-full shadow-2xl flex items-center gap-1.5 border border-white/20 z-10">
                                    <CheckCircleIcon className="w-2.5 h-2.5 md:w-5 md:h-5 text-white" />
                                    <span className="text-[6px] md:text-[10px] font-black uppercase tracking-[0.15em]">Verified</span>
                                </div>
                            </motion.div>

                            {/* Artist Name Stack */}
                            <div className="flex flex-col items-center md:items-start leading-none z-10 pointer-events-none">
                                <h1 className="font-black text-white tracking-tighter uppercase m-0 p-0" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl block -mb-[0.1em] relative leading-[0.8] opacity-90 whitespace-nowrap">FUAD</span>
                                    <span className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl block text-red-600 relative leading-[0.8] opacity-100 whitespace-nowrap">AHMED</span>
                                </h1>
                                <p 
                                    className="text-[8px] md:text-[10px] text-gray-500 font-bold tracking-[0.5em] md:tracking-[0.6em] mt-3 md:mt-4 uppercase opacity-60 w-full text-center md:text-left" 
                                    style={{ fontFamily: '"Montserrat", sans-serif' }}
                                >
                                     Visual Artist <span className="text-red-600 text-[9px] md:text-xs">by</span> FEZ zone
                                </p>
                            </div>
                        </div>

                        {/* 2. SKILLS CHIPS */}
                        <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mb-8 md:mb-12 px-4 max-w-4xl">
                            {sortedHeroSkills.map((skill, i) => (
                                <motion.span 
                                    key={skill}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.1 * i, duration: 0.4 }}
                                    className="flex items-center bg-white/5 border border-white/10 rounded-lg md:rounded-xl px-3 py-1.5 md:px-5 md:py-3 text-[7.5px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300 hover:text-white hover:bg-white/10"
                                >
                                    {skill}
                                    {proSkills.includes(skill) && (
                                        <span className="ml-1 md:ml-2.5 bg-red-600 text-white text-[5px] md:text-[8px] px-1 py-0 md:px-1.5 md:py-0.5 rounded-sm font-black ring-1 ring-white/20">PRO</span>
                                    )}
                                </motion.span>
                            ))}
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOpenServices(); }}
                                className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center bg-white/5 hover:bg-red-600 border border-white/10 rounded-lg md:rounded-xl transition-all duration-300 group shadow-lg"
                            >
                                <ThreeDotsIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-white group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* 3. CTA & STATS */}
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20 w-full justify-center px-6">
                            <button 
                                onClick={(e) => { e.stopPropagation(); onOrderNow(); }}
                                className="relative overflow-hidden bg-white text-black text-[15px] md:text-lg font-black px-14 py-6 md:px-28 md:py-9 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-[0.3em] flex-shrink-0 group/order"
                            >
                                <span className="relative z-10">Order Now</span>
                                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 translate-x-[-100%] group-hover/order:translate-x-[100%] transition-transform duration-700"></div>
                            </button>
                            
                            <div className="flex items-center gap-8 sm:gap-14 md:gap-20 px-2">
                                {/* Subscribers */}
                                <div className="text-left cursor-pointer group/stat flex-shrink-0" onClick={onYouTubeClick}>
                                    <div className="flex items-center gap-3 md:gap-5 mb-1 md:mb-2.5">
                                        <p className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-none group-hover/stat:text-red-600 transition-colors" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                            {loading ? '---' : <StretchyCounter value={animatedSubs} />}
                                        </p>
                                        <div className="w-1.5 h-1.5 md:w-3 md:h-3 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,0.8)]"></div>
                                    </div>
                                    <span className="text-[8.5px] md:text-[13px] text-gray-500 font-bold uppercase tracking-[0.25em] md:tracking-[0.3em] group-hover/stat:text-red-600 transition-colors whitespace-nowrap">Subscribers</span>
                                </div>

                                {/* Views */}
                                <div className="text-left border-l border-white/10 pl-8 sm:pl-14 md:pl-20 cursor-pointer group/stat flex-shrink-0" onClick={onYouTubeClick}>
                                    <div className="flex items-center gap-3 md:gap-5 mb-1 md:mb-2.5">
                                        <p className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-none group-hover/stat:text-red-600 transition-colors" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                            {loading ? '---' : <StretchyCounter value={animatedViews} />}
                                        </p>
                                        <YouTubeIcon className="w-4 h-4 md:w-7 md:h-7 text-red-600 opacity-60 group-hover/stat:opacity-100 transition-all" />
                                    </div>
                                    <span className="text-[8.5px] md:text-[13px] text-gray-500 font-bold uppercase tracking-[0.25em] md:tracking-[0.3em] group-hover/stat:text-red-600 transition-colors whitespace-nowrap">Total Views</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Ambient Lighting & Glows */}
            <div className="absolute top-1/4 -left-60 w-[700px] h-[700px] bg-red-600/5 blur-[180px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-60 w-[700px] h-[700px] bg-red-600/5 blur-[180px] rounded-full pointer-events-none"></div>
        </section>
    );
};