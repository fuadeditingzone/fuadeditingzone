import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config';
import { ThreeDotsIcon, CheckCircleIcon, YouTubeIcon, SparklesIcon } from './Icons';
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
                style={{ transform: `translateY(${y}em)`, willChange: 'transform' }}
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
    const [parallaxEnabled, setParallaxEnabled] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    
    const animatedSubs = useAnimatedCounter(stats.subscribers, 5000);
    const animatedViews = useAnimatedCounter(stats.views, 5000);
    
    useEffect(() => {
        const timer = setTimeout(() => setParallaxEnabled(true), 1500);
        return () => clearTimeout(timer);
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
        transform: parallaxEnabled 
            ? `perspective(1200px) rotateX(${y * -1.5}deg) rotateY(${x * 1.5}deg)` 
            : 'perspective(1200px) rotateX(0deg) rotateY(0deg)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform',
        backfaceVisibility: 'hidden' as const
    };

    return (
        <section 
            id="home" 
            className="h-[100dvh] min-h-[600px] flex flex-col items-center justify-center relative select-none overflow-hidden p-0"
        >
            <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={isImageLoaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full text-center flex flex-col items-center max-w-6xl -mt-12 md:mt-[-2vh]" 
                style={headlineStyle}
            >
                {/* ARTIST IDENTITY HEADER */}
                <div className="relative flex flex-col md:flex-row items-center justify-center mb-4 md:mb-8 gap-4 md:gap-10 min-h-[140px] md:min-h-[220px]">
                    
                    {/* PROFILE CONTAINER */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, rotateY: 30 }}
                        animate={isImageLoaded ? { opacity: 1, scale: 1, rotateY: 0 } : { opacity: 0 }}
                        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                        className="relative group flex-shrink-0 z-30"
                    >
                        {/* Background Pulsing Glow */}
                        <div className="absolute -inset-4 bg-red-600/10 rounded-[3rem] blur-2xl animate-pulse group-hover:bg-red-600/25 transition-colors duration-700"></div>
                        
                        {/* Profile Frame */}
                        <div className="relative w-32 h-32 md:w-56 md:h-56 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border-2 border-white/10 transition-all duration-1000 bg-black shadow-[0_0_50px_rgba(0,0,0,0.8)] ring-1 ring-white/5">
                            <motion.img 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                src={siteConfig.branding.profilePicUrl} 
                                alt={`${siteConfig.branding.author} - Fuad Editing Zone Profile`} 
                                onLoad={() => setIsImageLoaded(true)}
                                className="w-full h-full object-cover object-top origin-top transition-all duration-700 group-hover:scale-105 group-hover:brightness-110" 
                            />

                            {/* HUD Overlay elements (Minimal) */}
                            <div className="absolute top-2 left-2 text-white/30 text-[6px] uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                                ID: 880-FEZ
                            </div>
                        </div>
                        
                        {/* Verified Badge */}
                        <div className="absolute -bottom-2 -right-2 md:-bottom-3 md:-right-3 bg-red-600 text-white py-1.5 px-3 md:py-2.5 md:px-5 rounded-full shadow-lg flex items-center gap-1.5 border border-white/20 z-40 transform hover:scale-110 transition-transform">
                            <CheckCircleIcon className="w-3 h-3 md:w-4.5 md:h-4.5 text-white" />
                            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-[0.25em]">Pro Artist</span>
                        </div>
                    </motion.div>

                    {/* Artist Name Stack */}
                    <div className="flex flex-col items-center md:items-start leading-none z-10">
                        <motion.h1 
                            initial={{ opacity: 0, x: 25 }}
                            animate={isImageLoaded ? { opacity: 1, x: 0 } : { opacity: 0 }}
                            transition={{ duration: 1.2, delay: 0.5 }}
                            className="font-black text-white tracking-tighter uppercase m-0 p-0" 
                            style={{ fontFamily: '"Montserrat", sans-serif' }}
                        >
                            <span className="sr-only">Fuad Ahmed - Fuad Editing Zone | Selected Legend - Sykhet Vfx editor & Sylhety graphic designer</span>
                            <span className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl block -mb-[0.1em] relative leading-[0.7] opacity-90 whitespace-nowrap drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">FUAD</span>
                            <span className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl block text-red-600 relative leading-[0.7] opacity-100 whitespace-nowrap">AHMED</span>
                        </motion.h1>
                    </div>
                </div>

                {/* SKILLS CHIPS */}
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mb-6 md:mb-12 px-4 max-w-4xl mt-4">
                    {sortedHeroSkills.map((skill, i) => (
                        <motion.span 
                            key={skill}
                            initial={{ opacity: 0, y: 10 }}
                            animate={isImageLoaded ? { opacity: 1, y: 0 } : { opacity: 0 }}
                            transition={{ delay: 0.9 + (0.05 * i), duration: 0.5 }}
                            className="flex items-center bg-white/5 border border-white/10 rounded-lg md:rounded-xl px-4 py-2 md:px-6 md:py-4 text-[8px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest transition-all duration-500 hover:text-white hover:bg-red-600/10 hover:border-red-600/50 hover:-translate-y-1 shadow-lg"
                        >
                            {skill}
                            {proSkills.includes(skill) && (
                                <span className="ml-2 bg-red-600 text-white text-[6px] md:text-[8px] px-1.5 py-0.5 rounded-sm font-black ring-1 ring-white/20">PRO</span>
                            )}
                        </motion.span>
                    ))}
                    <motion.button 
                        initial={{ opacity: 0 }}
                        animate={isImageLoaded ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 1.3 }}
                        onClick={(e) => { e.stopPropagation(); onOpenServices(); }}
                        className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white/5 hover:bg-red-600 border border-white/10 rounded-lg md:rounded-xl transition-all duration-300 group shadow-2xl"
                    >
                        <ThreeDotsIcon className="w-4 h-4 md:w-6 md:h-6 text-white group-hover:rotate-90 transition-transform" />
                    </motion.button>
                </div>

                {/* CTA & STATS */}
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20 w-full justify-center px-6">
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={isImageLoaded ? { opacity: 1, scale: 1 } : { opacity: 0 }}
                        transition={{ delay: 1.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        onClick={(e) => { e.stopPropagation(); onOrderNow(); }}
                        className="relative overflow-hidden bg-white text-black text-sm md:text-lg font-black px-12 py-6 md:px-32 md:py-10 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_25px_50px_rgba(0,0,0,0.5)] uppercase tracking-[0.5em] flex-shrink-0 group/order"
                    >
                        <span className="relative z-10">Order Now</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/20 to-red-600/0 translate-x-[-100%] group-hover/order:translate-x-[100%] transition-transform duration-1000"></div>
                    </motion.button>
                    
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={isImageLoaded ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 1.6, duration: 1.2 }}
                        className="flex items-center gap-8 sm:gap-14 md:gap-20 px-2"
                    >
                        {/* Subscribers */}
                        <div className="text-left cursor-pointer group/stat flex-shrink-0" onClick={onYouTubeClick}>
                            <div className="flex items-center gap-3 md:gap-5 mb-1 md:mb-2">
                                <div className="text-3xl sm:text-4xl md:text-7xl font-black text-white leading-none group-hover/stat:text-red-600 transition-colors" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                    {loading ? '---' : <StretchyCounter value={animatedSubs} />}
                                </div>
                                <div className="w-2.5 h-2.5 md:w-4 md:h-4 bg-red-600 rounded-full animate-pulse shadow-[0_0_20px_rgba(220,38,38,1)]"></div>
                            </div>
                            <span className="text-[10px] md:text-[14px] text-gray-500 font-bold uppercase tracking-[0.4em] group-hover/stat:text-red-600 transition-colors whitespace-nowrap">Subscribers</span>
                        </div>

                        {/* Views */}
                        <div className="text-left border-l border-white/10 pl-8 sm:pl-14 md:pl-20 cursor-pointer group/stat flex-shrink-0" onClick={onYouTubeClick}>
                            <div className="flex items-center gap-3 md:gap-5 mb-1 md:mb-2">
                                <div className="text-3xl sm:text-4xl md:text-7xl font-black text-white leading-none group-hover/stat:text-red-600 transition-colors" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                    {loading ? '---' : <StretchyCounter value={animatedViews} />}
                                </div>
                                <YouTubeIcon className="w-5 h-5 md:w-9 md:h-9 text-red-600 opacity-60 group-hover/stat:opacity-100 transition-all" />
                            </div>
                            <span className="text-[10px] md:text-[14px] text-gray-500 font-bold uppercase tracking-[0.4em] group-hover/stat:text-red-600 transition-colors whitespace-nowrap">Views</span>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
            
            {/* Ambient Lighting & Glows */}
            <div className="absolute top-1/4 -left-60 w-[800px] h-[800px] bg-red-600/5 blur-[200px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-60 w-[800px] h-[800px] bg-red-600/5 blur-[200px] rounded-full pointer-events-none"></div>
        </section>
    );
};