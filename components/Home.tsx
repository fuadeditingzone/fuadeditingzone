import React from 'react';
import { motion } from 'framer-motion';
import { siteConfig } from '../config';
import { ThreeDotsIcon, CheckCircleIcon } from './Icons';
import { useYouTubeChannelStats } from '../hooks/useYouTubeChannelStats';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { useParallax } from '../contexts/ParallaxContext';

const AnimatedDigit: React.FC<{ digit: string }> = React.memo(({ digit }) => {
    const d = parseInt(digit, 10);
    const y = -d * 1; 

    return (
        <span className="inline-block w-[0.6em] h-[1em] overflow-hidden align-bottom leading-none">
            <span 
                className="inline-block transition-transform duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateY(${y}em)` }}
            >
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="block h-[1em]">{i}</span>
                ))}
            </span>
        </span>
    );
});

const StretchyCounter: React.FC<{ value: number }> = ({ value }) => {
    const formatted = new Intl.NumberFormat('en-US').format(value);
    
    return (
        <span className="flex items-center justify-center">
            {formatted.split('').map((char, index) => {
                if (/\d/.test(char)) {
                    return <AnimatedDigit key={`${char}-${index}`} digit={char} />;
                }
                return <span key={index} className="w-[0.2em]">{char}</span>;
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
        transform: `perspective(1200px) rotateX(${y * -2}deg) rotateY(${x * 2}deg)`,
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    };

    return (
        <section 
            id="home" 
            className="h-[100dvh] min-h-[500px] flex flex-col items-center justify-center relative select-none overflow-hidden p-4 pt-16"
        >
            <div className="relative z-10 w-full text-center flex flex-col items-center max-w-5xl" style={headlineStyle}>
                
                {/* 1. ARTIST IDENTITY HEADER - Profile next to Name */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-4 md:mb-8">
                    {/* Profile Picture - Increased size and prominent placement */}
                    <div className="relative group flex-shrink-0">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                            className="relative w-36 h-36 md:w-56 md:h-56 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,1)] bg-black"
                        >
                            <img 
                                src={siteConfig.branding.profilePicUrl} 
                                alt={siteConfig.branding.author} 
                                className="w-full h-full object-cover object-top origin-top scale-[1.05] transition-transform duration-1000 group-hover:scale-110" 
                                style={{ objectPosition: 'center top' }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        </motion.div>
                        
                        {/* Verified Badge */}
                        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-red-600 text-white py-1 px-2.5 md:py-2 md:px-4 rounded-full shadow-2xl flex items-center gap-1.5 border border-white/20 z-10">
                            <CheckCircleIcon className="w-3 h-3 md:w-4 md:h-4 text-white" />
                            <span className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.1em]">Verified</span>
                        </div>
                    </div>

                    {/* Artist Name Stack - Tight vertical arrangement next to profile */}
                    <div className="flex flex-col items-center md:items-start leading-none">
                        <motion.h1 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="flex flex-col items-center md:items-start font-black text-white tracking-tighter uppercase m-0 p-0" 
                            style={{ fontFamily: '"Montserrat", sans-serif' }}
                        >
                            <span className="text-4xl md:text-7xl lg:text-8xl block -mb-[0.18em] relative z-10 leading-[0.85]">FUAD</span>
                            <span className="text-4xl md:text-7xl lg:text-8xl block text-red-600 relative leading-[0.85]">AHMED</span>
                        </motion.h1>
                        
                        <p className="text-[7px] md:text-[11px] text-gray-500 font-bold tracking-[0.5em] mt-6 md:mt-4 uppercase opacity-50 text-center md:text-left w-full" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                             Visual Artist <span className="text-red-600 text-[8px] md:text-xs">by</span> FEZ zone
                        </p>
                    </div>
                </div>

                {/* 2. SKILLS CHIPS */}
                <div className="flex flex-wrap justify-center items-center gap-1.5 md:gap-2 mb-8 md:mb-12">
                    {sortedHeroSkills.map((skill, i) => (
                        <motion.span 
                            key={skill}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 + (i * 0.1), duration: 0.4 }}
                            className="flex items-center bg-white/5 border border-white/10 rounded-md px-2 py-1 md:px-4 md:py-2 text-[6.5px] md:text-[9px] font-black text-gray-400 uppercase tracking-widest transition-all duration-300 hover:text-white hover:bg-white/10"
                        >
                            {skill}
                            {proSkills.includes(skill) && (
                                <span className="ml-1.5 bg-red-600 text-white text-[5px] md:text-[7px] px-1 py-0 rounded-sm font-black ring-1 ring-white/20">PRO</span>
                            )}
                        </motion.span>
                    ))}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenServices(); }}
                        className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-red-600 border border-white/10 rounded-md transition-all duration-300 group shadow-lg"
                    >
                        <ThreeDotsIcon className="w-3.5 h-3.5 md:w-4.5 md:h-4.5 text-white group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                {/* 3. CTA & STATS */}
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-12">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOrderNow(); }}
                        className="bg-white text-black text-[10px] md:text-xs font-black px-10 py-3.5 md:px-14 md:py-5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl uppercase tracking-[0.2em]"
                    >
                        Hire Artist
                    </button>
                    
                    <div className="flex items-center gap-6 md:gap-10">
                        <div className="text-left">
                            <p className="text-xl md:text-4xl font-black text-white tracking-tighter leading-none" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                {loading ? '---' : <StretchyCounter value={animatedSubs} />}
                            </p>
                            <button 
                                onClick={onYouTubeClick}
                                className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5 hover:text-red-500 transition-colors"
                            >
                                Followers
                            </button>
                        </div>
                        <div className="text-left border-l border-white/10 pl-6 md:pl-10">
                            <p className="text-xl md:text-4xl font-black text-white tracking-tighter leading-none" style={{ fontFamily: '"Montserrat", sans-serif' }}>
                                {loading ? '---' : <StretchyCounter value={animatedViews} />}
                            </p>
                            <p className="text-[7px] md:text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">Reach</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Ambient Lighting & Glows */}
            <div className="absolute top-1/4 -left-40 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
            <div className="absolute bottom-1/4 -right-40 w-[400px] h-[400px] bg-red-600/5 blur-[120px] rounded-full pointer-events-none"></div>
        </section>
    );
};
