import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  isHeroVideoActive: boolean;
  setIsHeroVideoActive: (active: boolean) => void;
  isWelcomeDismissed: boolean;
  triggerPlay: number;
  isPortfolioMediaActive?: boolean;
}

export const Home: React.FC<HomeProps> = ({ 
    onOpenServices, 
    onOrderNow, 
    isHeroVideoActive, 
    setIsHeroVideoActive,
    isWelcomeDismissed,
    triggerPlay,
    isPortfolioMediaActive = false
}) => {
    const { stats, loading } = useYouTubeChannelStats();
    const { x, y } = useParallax();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cycleIndex, setCycleIndex] = useState(0);
    const [isVideoReady, setIsVideoReady] = useState(false);
    const [hasTriggeredByClick, setHasTriggeredByClick] = useState(false);
    
    const animatedSubs = useAnimatedCounter(stats.subscribers, 1500);
    const animatedViews = useAnimatedCounter(stats.views, 1500);
    
    const vfxEdits = siteConfig.content.portfolio.vfxEdits;

    const proSkills = ['VFX Mastery', 'YouTube Thumbnail', 'Photo Manipulation', 'Banner Designs', 'Social Media Post', 'AMV EDIT', 'Graphic Design'];

    const sortedHeroSkills = [...siteConfig.content.introCard.skills].sort((a, b) => {
        const aIsPro = proSkills.includes(a);
        const bIsPro = proSkills.includes(b);
        if (aIsPro && !bIsPro) return -1;
        if (!aIsPro && bIsPro) return 1;
        return 0;
    }).slice(0, 5);

    const introVideoUrl = "https://dl.dropboxusercontent.com/scl/fi/wi6fm6hqwpdcixg1qsly4/ssstik.io_-fuadeditingzone_1766534523184.mp4?rlkey=ujxaf5wwgwna0k3ycydwjueg6&raw=1";
    const pfpVideoPlaylist = [introVideoUrl, ...vfxEdits.map(v => v.url)].filter(Boolean) as string[];

    const playVideo = useCallback(() => {
        if (videoRef.current && !isPortfolioMediaActive && isWelcomeDismissed) {
            setIsHeroVideoActive(true);
            videoRef.current.play().catch(e => {
                console.warn("Autoplay was prevented, waiting for user interaction.", e);
            });
        }
    }, [isPortfolioMediaActive, isWelcomeDismissed, setIsHeroVideoActive]);

    // Initial play and trigger updates
    useEffect(() => {
        if (isWelcomeDismissed && !isPortfolioMediaActive) {
            // "Clicking outside PFP playing video will work only once after opening web"
            // The first triggerPlay (usually 1 when portal is clicked) sets the lock.
            if (!hasTriggeredByClick && triggerPlay > 0) {
                playVideo();
                setHasTriggeredByClick(true);
            }
        }
    }, [isWelcomeDismissed, playVideo, isPortfolioMediaActive, triggerPlay, hasTriggeredByClick]);

    // Strict 1-minute cycle
    useEffect(() => {
        if (!isWelcomeDismissed) return;
        const interval = setInterval(() => {
            if (!isPortfolioMediaActive) {
                setCycleIndex(prev => (prev + 1) % pfpVideoPlaylist.length);
            }
        }, 60000); 
        return () => clearInterval(interval);
    }, [isWelcomeDismissed, pfpVideoPlaylist.length, isPortfolioMediaActive]);

    // Handle play state synchronization
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isHeroVideoActive && !isPortfolioMediaActive) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [isHeroVideoActive, isPortfolioMediaActive]);

    const handleVideoEnded = () => {
        setIsHeroVideoActive(false); 
        setIsVideoReady(false);
    };

    const handleMediaClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Manual clicks on PFP always work
        playVideo();
    };

    const headlineStyle = {
        transform: `perspective(1000px) rotateX(${y * -10}deg) rotateY(${x * 10}deg)`,
        transition: 'transform 0.1s ease-out',
    };

    return (
        <section 
            id="home" 
            className="h-[100dvh] min-h-[500px] flex flex-col items-center justify-center relative select-none overflow-hidden p-6"
        >
            <div className="relative z-10 w-full text-center flex flex-col items-center max-w-4xl" style={headlineStyle}>
                
                <div className="relative mb-5 md:mb-8 group">
                    <div 
                        onClick={handleMediaClick}
                        className="relative w-32 h-32 md:w-52 md:h-52 rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden border-2 border-white/20 shadow-[0_0_50px_rgba(220,38,38,0.3)] transition-all duration-500 group-hover:scale-[1.05] group-hover:shadow-[0_0_70px_rgba(220,38,38,0.5)] cursor-pointer bg-black"
                    >
                        {/* Video Layer */}
                        <video
                            ref={videoRef}
                            src={pfpVideoPlaylist[cycleIndex]}
                            muted={false}
                            playsInline
                            onPlaying={() => setIsVideoReady(true)}
                            onEnded={handleVideoEnded}
                            // Using autoPlay here as a hint to the browser, though controlled by ref
                            autoPlay={isWelcomeDismissed && !isPortfolioMediaActive}
                            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 scale-[1.25] z-10 ${isVideoReady && isHeroVideoActive ? 'opacity-100' : 'opacity-0'}`}
                        />
                        
                        {/* Static Image Layer - Shown when video is loading or inactive */}
                        <img 
                            src={siteConfig.branding.profilePicUrl} 
                            alt={siteConfig.branding.author} 
                            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 z-0 ${(!isVideoReady || !isHeroVideoActive) ? 'opacity-100' : 'opacity-0'}`} 
                        />

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-20"></div>
                    </div>
                    
                    <div className="absolute -inset-2.5 rounded-[2rem] md:rounded-[3rem] ring-2 ring-red-600/40 animate-pulse pointer-events-none"></div>
                    <div className="absolute -inset-5 rounded-[2.3rem] md:rounded-[4rem] ring-1 ring-white/10 animate-spin-slow pointer-events-none" style={{ animationDuration: '20s' }}></div>

                    <div className="absolute -bottom-2 -right-2 md:-bottom-4 md:-right-4 bg-red-600 text-white py-1.5 px-2.5 md:py-2.5 md:px-4 rounded-lg md:rounded-2xl shadow-[0_10px_30px_rgba(220,38,38,0.5)] flex items-center gap-1 md:gap-2 border border-white/30 animate-float-3d z-30">
                        <CheckCircleIcon className="w-3.5 h-3.5 md:w-5 md:h-5 text-white" />
                        <span className="text-[8px] md:text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap">Official Artist</span>
                    </div>
                </div>

                <h1 className="text-4xl md:text-7xl font-bold text-white tracking-tighter glitch-text font-teko mb-2 md:mb-4">
                    FUAD <span className="text-red-600">AHMED</span>
                </h1>
                
                <p className="text-[10px] md:text-xl text-gray-400 font-light tracking-[0.3em] mb-4 md:mb-8 uppercase">
                    VISUAL EFFECTS <span className="text-red-600 font-bold">&</span> DESIGN
                </p>
                
                <div className="flex flex-wrap justify-center items-center gap-1.5 md:gap-3 mb-6 md:mb-12">
                    {sortedHeroSkills.map(skill => (
                        <span 
                            key={skill}
                            className="flex items-center bg-white/5 border border-white/10 rounded-full px-2 py-0.5 md:px-4 md:py-1.5 text-[7.5px] md:text-[10px] font-bold text-gray-300 uppercase tracking-widest skill-tag-effect hover:bg-red-600 hover:text-white hover:border-red-600 hover:shadow-[0_0_20px_rgba(220,38,38,0.6)] transition-all duration-500 cursor-default"
                        >
                            {skill}
                            {proSkills.includes(skill) && (
                                <span className="ml-1 bg-red-600 text-white text-[5px] md:text-[7px] px-1 py-0 rounded-sm font-black ring-1 ring-white/20">PRO</span>
                            )}
                        </span>
                    ))}
                    <button 
                        onClick={(e) => { e.stopPropagation(); onOpenServices(); }}
                        className="w-6 h-6 md:w-9 md:h-9 flex items-center justify-center bg-red-600/20 hover:bg-red-600 border border-red-600/30 rounded-full transition-all duration-300 group"
                    >
                        <ThreeDotsIcon className="w-3 md:w-4 md:h-4 text-white group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row items-center gap-5 md:gap-16">
                  <button 
                      onClick={(e) => { e.stopPropagation(); onOrderNow(); }}
                      className="btn-angular btn-3d bg-red-600 text-white text-[10px] md:text-sm font-bold px-8 py-3.5 md:px-12 md:py-5 hover:bg-red-700 transition-all duration-300 shadow-[0_10px_30px_rgba(220,38,38,0.4)] uppercase tracking-[0.2em]"
                  >
                      Hire Me Now
                  </button>
                  
                  <div className="flex items-center gap-4 md:gap-6">
                      <div className="text-left border-l-2 border-red-600 pl-3 md:pl-4">
                          <p className="text-lg md:text-3xl font-bold text-white font-mono leading-none">
                              {loading ? '---' : <StretchyCounter value={animatedSubs} />}
                          </p>
                          <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest mt-1">YouTube</p>
                      </div>
                      <div className="text-left border-l-2 border-white/10 pl-3 md:pl-4">
                          <p className="text-lg md:text-3xl font-bold text-white font-mono leading-none">
                              {loading ? '---' : <StretchyCounter value={animatedViews} />}
                          </p>
                          <p className="text-[8px] md:text-[10px] text-gray-500 uppercase tracking-widest mt-1">Total Views</p>
                      </div>
                  </div>
                </div>
            </div>
            
            <div className="absolute top-1/4 -left-20 w-64 h-64 md:w-96 md:h-96 bg-red-600/10 blur-[150px] rounded-full"></div>
            <div className="absolute bottom-1/4 -right-20 w-64 h-64 md:w-96 md:h-96 bg-red-600/10 blur-[150px] rounded-full"></div>
        </section>
    );
};