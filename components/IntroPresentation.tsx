import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { siteConfig } from '../config';
import { PlayIcon, VolumeOnIcon, VolumeOffIcon, ChevronRightIcon, SparklesIcon, VfxIcon, PhotoManipulationIcon, ThumbnailIcon } from './Icons';
import { LazyImage } from './LazyImage';

interface IntroPresentationProps {
    onFinished: () => void;
}

export const IntroPresentation: React.FC<IntroPresentationProps> = ({ onFinished }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [progress, setProgress] = useState(0);
    const [isFinished, setIsFinished] = useState(false);
    const [isMuted, setIsMuted] = useState(false); 
    const [playbackStarted, setPlaybackStarted] = useState(false);
    const [canSkip, setCanSkip] = useState(false);
    const [skipTimer, setSkipTimer] = useState(5);
    const [error, setError] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);

    const introVideoUrl = "https://www.dropbox.com/scl/fi/wi6fm6hqwpdcixg1qsly4/ssstik.io_-fuadeditingzone_1766534523184.mp4?rlkey=ujxaf5wwgwna0k3ycydwjueg6&st=fj6bn76z&raw=1";

    const backgroundMedia = useMemo(() => {
        const allMedia = [
            ...siteConfig.content.portfolio.graphicWorks.map(w => ({ type: 'image', url: w.imageUrl })),
            ...siteConfig.content.portfolio.vfxEdits.map(v => ({ type: 'video', url: v.url })),
            ...siteConfig.content.portfolio.animeEdits.map(a => ({ type: 'image', url: a.thumbnailUrl }))
        ];
        
        return allMedia.sort(() => Math.random() - 0.5).slice(0, 10);
    }, []);

    const randomizedFeatures = useMemo(() => {
        const allCapabilities = [
            { title: "VFX Mastery", icon: <VfxIcon className="w-5 h-5 text-red-500" />, desc: "Cinematic Visual Effects" },
            { title: "Manipulation", icon: <PhotoManipulationIcon className="w-5 h-5 text-red-500" />, desc: "High-End Photo Art" },
            { title: "Growth Design", icon: <ThumbnailIcon className="w-5 h-5 text-red-500" />, desc: "High-CTR Thumbnails" },
            { title: "Anime Edits", icon: <SparklesIcon className="w-5 h-5 text-red-500" />, desc: "Stylized Visual Motion" }
        ];
        
        const shuffledCaps = allCapabilities.sort(() => Math.random() - 0.5);
        
        return shuffledCaps.map((cap, i) => ({
            ...cap,
            media: backgroundMedia[i % backgroundMedia.length]
        }));
    }, [backgroundMedia]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = false;
        video.volume = 0.3;

        const attemptPlay = async () => {
            try {
                await video.play();
                setPlaybackStarted(true);
            } catch (err) {
                console.warn("Autoplay blocked. User interaction required.");
                video.muted = true;
                setIsMuted(true);
                setError(true);
            }
        };

        attemptPlay();

        const countdownInterval = setInterval(() => {
            setSkipTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownInterval);
                    setCanSkip(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const featureInterval = setInterval(() => {
            setActiveFeature(prev => (prev + 1) % randomizedFeatures.length);
        }, 4000);

        const updateProgress = () => {
            if (!video.duration) return;
            const currentProgress = (video.currentTime / video.duration) * 100;
            setProgress(currentProgress);
        };

        const handleAutoFinish = () => {
            if (isFinished) return;
            setIsFinished(true);
            setTimeout(() => onFinished(), 800);
        };

        video.addEventListener('timeupdate', updateProgress);
        video.addEventListener('ended', handleAutoFinish);

        return () => {
            video.removeEventListener('timeupdate', updateProgress);
            clearInterval(countdownInterval);
            clearInterval(featureInterval);
        };
    }, [onFinished, randomizedFeatures.length]);

    const handleStartExperience = () => {
        const video = videoRef.current;
        if (video) {
            video.muted = false;
            video.volume = 0.4;
            video.play();
            setIsMuted(false);
            setPlaybackStarted(true);
            setError(false);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (video) {
            video.muted = !video.muted;
            setIsMuted(video.muted);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(30px)' }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[250] bg-black flex flex-col items-center overflow-x-hidden overflow-y-auto lg:overflow-hidden select-none"
        >
            {/* Ambient Background Content */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-red-950/40 via-black to-black z-10"></div>
                {backgroundMedia.map((media, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ 
                            opacity: 0.06, 
                            scale: 1,
                            y: [0, -10, 0],
                            x: [0, 5, 0]
                        }}
                        transition={{ 
                            duration: 15 + i * 2, 
                            repeat: Infinity, 
                            delay: i * 0.4,
                            opacity: { duration: 2 }
                        }}
                        className="absolute rounded-lg overflow-hidden border border-white/5"
                        style={{
                            width: `${6 + (i % 3) * 3}rem`,
                            height: 'auto',
                            top: `${(i * 19) % 100}%`,
                            left: `${(i * 27) % 100}%`,
                            transform: `rotate(${(i * 12) - 20}deg)`,
                            filter: 'blur(4px)'
                        }}
                    >
                        {media.type === 'video' ? (
                            <video src={media.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                        ) : (
                            <img src={media.url} alt="" className="w-full h-full object-cover" />
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Content Container */}
            <div className="relative w-full max-w-7xl min-h-full lg:h-full flex flex-col lg:flex-row gap-6 lg:gap-12 items-center justify-center z-10 p-6 md:p-10 lg:p-12">
                
                {/* Main Player Area */}
                <div className="w-full lg:flex-1 flex items-center justify-center relative min-h-0">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                        className="relative aspect-square w-full h-auto max-w-[min(85vw,42dvh)] lg:max-w-[min(80vw,65dvh)] bg-black rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(220,38,38,0.2)] ring-1 ring-white/5"
                    >
                        <video 
                            ref={videoRef}
                            src={introVideoUrl}
                            playsInline
                            muted={isMuted}
                            className="w-full h-full object-contain bg-black"
                        />

                        {/* Interaction Overlay */}
                        <AnimatePresence>
                            {(!playbackStarted || error) && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-20 cursor-pointer group"
                                    onClick={handleStartExperience}
                                >
                                    <div className="relative">
                                        <div className="absolute -inset-8 bg-red-600/20 blur-3xl animate-pulse rounded-full"></div>
                                        <motion.button 
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="relative w-20 h-20 md:w-28 md:h-28 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.5)] border border-white/20"
                                        >
                                            <PlayIcon className="w-10 h-10 md:w-14 md:h-14 ml-1.5" />
                                        </motion.button>
                                    </div>
                                    <p className="mt-8 text-[10px] md:text-sm font-black uppercase tracking-[0.5em] text-white animate-pulse">Enter Experience</p>
                                    <p className="mt-2 text-[8px] text-gray-500 font-bold uppercase tracking-widest">Click to enable cinematic audio</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Player Labels */}
                        <div className="absolute top-3 left-3 md:top-6 md:left-6 flex items-center gap-1.5 z-10 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(220,38,38,1)]"></div>
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/90">HQ VFX Master</span>
                        </div>

                        {/* Volume Control */}
                        {playbackStarted && (
                            <button 
                                onClick={toggleMute}
                                className="absolute top-3 right-3 md:top-6 md:right-6 z-10 p-2.5 md:p-4 bg-black/50 hover:bg-red-600 rounded-full border border-white/10 backdrop-blur-md text-white transition-all hover:scale-110"
                            >
                                {isMuted ? <VolumeOffIcon className="w-4 h-4 md:w-6 md:h-6" /> : <VolumeOnIcon className="w-4 h-4 md:w-6 md:h-6" />}
                            </button>
                        )}

                        {/* Progress Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
                            <motion.div 
                                className="h-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)]"
                                style={{ width: `${progress}%` }}
                            />
                        </div>

                        {/* Skip Button */}
                        <AnimatePresence>
                            {playbackStarted && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="absolute bottom-10 right-0 z-30"
                                >
                                    {canSkip ? (
                                        <button
                                            onClick={() => onFinished()}
                                            className="bg-black/80 hover:bg-red-600 backdrop-blur-md text-white border-l border-t border-b border-white/20 py-3 px-8 md:py-4 md:px-14 flex items-center gap-3 group transition-all"
                                        >
                                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em]">Skip Intro</span>
                                            <ChevronRightIcon className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1.5 transition-transform" />
                                        </button>
                                    ) : (
                                        <div className="bg-black/80 backdrop-blur-md text-white/60 border-l border-t border-b border-white/20 py-3 px-8 md:py-4 md:px-14 flex items-center gap-3">
                                            <span className="text-[9px] md:text-[11px] font-black uppercase tracking-widest">Available in {skipTimer}s</span>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Info Sidebar */}
                <div className="w-full lg:w-[320px] xl:w-[360px] flex flex-col gap-4 lg:gap-6 flex-shrink-0 pb-10 lg:pb-0">
                    <div className="text-center lg:text-left">
                        <h2 className="text-base md:text-2xl lg:text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3 justify-center lg:justify-start">
                            Capability Showcase
                            <div className="hidden lg:block h-0.5 flex-1 bg-gradient-to-r from-red-600 to-transparent"></div>
                        </h2>
                    </div>

                    <div className="relative min-h-[160px] md:min-h-[200px] lg:min-h-[240px]">
                        <AnimatePresence mode="wait">
                            {randomizedFeatures.map((feature, idx) => (
                                idx === activeFeature && (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden p-4 md:p-6 space-y-4 backdrop-blur-2xl shadow-2xl"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-red-600/10 rounded-xl border border-red-600/20">
                                                {React.cloneElement(feature.icon as React.ReactElement<any>, { className: 'w-5 h-5 md:w-6 md:h-6 text-red-500' })}
                                            </div>
                                            <div>
                                                <h4 className="text-xs md:text-base font-black text-white uppercase tracking-tight leading-none">{feature.title}</h4>
                                                <p className="text-[8px] md:text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1.5">{feature.desc}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="w-full rounded-xl overflow-hidden bg-black/40 border border-white/5 relative flex items-center justify-center aspect-video">
                                            {feature.media.type === 'video' ? (
                                                <video src={feature.media.url} autoPlay loop muted playsInline className="w-full h-full object-cover" />
                                            ) : (
                                                <LazyImage src={feature.media.url} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            ))}
                        </AnimatePresence>
                    </div>

                    <div className="bg-white/5 p-4 rounded-xl border border-white/10 backdrop-blur-md flex items-center justify-between">
                         <span className="text-[10px] md:text-xs text-gray-400 font-black uppercase tracking-[0.2em]">Selected Legend • 2025</span>
                         <div className="flex items-center gap-2">
                            <span className="text-[9px] md:text-[11px] text-red-500 font-black uppercase tracking-widest animate-pulse">Live Edit</span>
                            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-600 rounded-full shadow-[0_0_10px_rgba(220,38,38,1)]"></div>
                         </div>
                    </div>
                </div>
            </div>

            {/* Subtle Glitch Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02] mix-blend-overlay bg-[url('https://media.giphy.com/media/oEI9uWUicKgZRL28No/giphy.gif')]"></div>
        </motion.div>
    );
};