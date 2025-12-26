import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config';
import { ThreeDotsIcon, CheckCircleIcon, YouTubeIcon } from './Icons';
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
    
    const animatedSubs = useAnimatedCounter(stats.subscribers, 1500);
    const animatedViews = useAnimatedCounter(stats.views, 1500);
    
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

    return (
        <section 
            id="home" 
            className="h-[100dvh] min-h-[550px] md:min-h-[600px] flex flex-col items-center justify-center relative select-none overflow-hidden p-4 pt-12 md:pt-20"
        >
            <div className="relative z-10 w-full text-center flex flex-col items-center max-w-6xl -mt-8 md:mt-[-2vh]" style={headlineStyle}>
                
                {/* 1. ARTIST IDENTITY HEADER - Kept size as before */}
                <div className="relative flex flex-col md:flex-row items-center justify-center mb-5 md:mb-12 gap-3 md:gap-10">
                    <div className="relative group flex-shrink-0 z-30 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] md:drop-shadow-[0_25px_40px_rgba(0,0,0,0.9)]">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-24 h-24 md:w-44 md:h-44 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/10 bg-black"
                        >
                            <img 
                                src={siteConfig.branding.profilePicUrl} 
                                alt={siteConfig.branding.author} 
                                className="w-full h-full object-cover object-top origin-top scale-[1.05] transition-transform duration-1000 group-hover:scale-110" 
                                style={{ objectPosition: 'center top' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </motion.div>
                        
                        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-red-600 text-white py-1 px-2 md:py-1.5 md:px-3 rounded-full shadow-2xl flex items-center gap-1.5 border border-white/20 z-10">
                            <CheckCircleIcon className="w-2.5 h-2.5 md:w-4 md:h-4 text-white" />
                            <span className="text-[5px] md:text-[8px] font-black uppercase tracking-[0.1em]">Verified</span>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-start leading-none z-10 pointer-events-none">
                        <motion.h1 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.8 }}
                            className="flex flex-col items-center md:items-start font-black text-white tracking-tighter uppercase m-0 p-0" 
                            style={{ fontFamily: '"Montserrat", sans-serif' }}
                        >
                            <span className="text-3xl md:text-5xl lg:text-7xl block -mb-[0.1em] relative leading-[0.85] opacity-80 whitespace-nowrap">FUAD</span>
                            <span className="text-3xl md:text-5xl lg:text-7xl block text-red-600 relative leading-[0.85] opacity-90 whitespace-nowrap">AHMED</span>
                        </motion.h1>
                        
                        <p className="text-[6px] md:text-[9px] text-gray-500 font-bold tracking-[0.5em] md:tracking-[0.6em] mt-2 md:mt-2 uppercase opacity-40 text-center md:text-left w-full ml-1" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                             Visual Artist <span className="text-red-600 text-[7px] md:text-xs">by</span> FEZ zone
                        </p>
                    </div>
                </div>

                {/* 2. SKILLS CHIPS - Made bigger and reduced margin */}
                <div className="flex flex-wrap justify-center items-center gap-2 md:gap-3 mb-5 md:mb-14 px-2">
                    {sortedHeroSkills.map((skill, i) => (
                        <motion.span 
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + (i * 0.1), duration: 0.4 }}
                            className="flex items-center bg-white/5 border border-white/10 rounded-lg px-3.5 py-2 md:px-6 md:py-3.5 text-[9px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300 hover:text-white hover:bg-white/10"
                        >
                            {skill}
                            {proSkills.includes(skill) && (
                                <span className="ml-1.5 md:ml-2 bg-red-600 text-white text-[6px] md:text-[8px] px-1 py-0 md:px-1.5 md:py-0.5 rounded-sm font-black ring-1 ring-white/20">PRO</span>
                            )}
                        </motion.span>
                    ))}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenServices(); }}
                        className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center bg-white/5 hover:bg-red-600 border border-white/10 rounded-lg transition-all duration-300 group shadow-lg"
                    >
                        <ThreeDotsIcon className="w-4 h-4 md:w-5 md:h-5 text-white group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* 3. CTA & STATS - Made bigger */}
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-20 w-full justify-center px-4">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOrderNow(); }}
                        className="bg-white text-black text-[10px] md:text-sm font-black px-12 py-4 md:px-18 md:py-6 rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl uppercase tracking-[0.2em] md:tracking-[0.25em] flex-shrink-0"
                    >
                        Order Now
                    </button>
                    
                    <div className="flex items-center gap-8 sm:gap-12 md:gap-20 px-2">
                        {/* YouTube Vibe Stats: Subscribers */}
                        <div 
                            className="text-left cursor-pointer group/stat flex-shrink-0"
                            onClick={onYouTubeClick}
                        >
                            <div className="flex items-center gap-2 md:gap-4 mb-0.5 md:mb-2">
                                <p className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-none group-hover/stat:text-red-500 transition-colors" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                    {loading ? '---' : <StretchyCounter value={animatedSubs} />}
                                </p>
                                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-600 rounded-full animate-pulse shadow-[0_0_12px_rgba(220,38,38,1)]"></div>
                            </div>
                            <span className="text-[8px] md:text-[13px] text-gray-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] group-hover/stat:text-red-600 transition-colors whitespace-nowrap">Subscribers</span>
                        </div>

                        {/* YouTube Vibe Stats: Views (Reach) */}
                        <div 
                            className="text-left border-l border-white/10 pl-8 sm:pl-12 md:pl-20 cursor-pointer group/stat flex-shrink-0"
                            onClick={onYouTubeClick}
                        >
                            <div className="flex items-center gap-2 md:gap-4 mb-0.5 md:mb-2">
                                <p className="text-2xl sm:text-4xl md:text-6xl font-black text-white leading-none group-hover/stat:text-red-500 transition-colors" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                    {loading ? '---' : <StretchyCounter value={animatedViews} />}
                                </p>
                                <YouTubeIcon className="w-3.5 h-3.5 md:w-6 md:h-6 text-red-600 opacity-50 group-hover/stat:opacity-100 transition-all" />
                            </div>
                            <span className="text-[8px] md:text-[13px] text-gray-500 font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] group-hover/stat:text-red-600 transition-colors whitespace-nowrap">Total Views</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Ambient Lighting & Glows */}
            <div className="absolute top-1/4 -left-40 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-red-600/5 blur-[150px] rounded-full pointer-events-none"></div>
        </section>
    );
};
