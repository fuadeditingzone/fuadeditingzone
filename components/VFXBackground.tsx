import React, { useRef, useEffect } from 'react';
import { useParallax } from '../contexts/ParallaxContext';

export const VFXBackground = () => {
    const { x, y } = useParallax();
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const interval = setInterval(() => {
            if (videoRef.current?.paused) {
                videoRef.current.play().catch(() => {});
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const backgroundStyle = {
      transform: `translateX(${x * 20}px) translateY(${y * 20}px) scale(1.1)`,
      transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
      willChange: 'transform' as const
    };

    return (
        <div className="fixed inset-0 w-full h-full -z-20 bg-black overflow-hidden pointer-events-none">
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-20 filter grayscale contrast-125"
                style={backgroundStyle}
                src="https://videos.pexels.com/video-files/4784149/4784149-hd.mp4"
            />
            
            {/* Visual Overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 via-transparent to-black z-0"></div>
            <div className="absolute inset-0 bg-black/60 z-0"></div>
            <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] z-0"></div>
            
            {/* Scanline Effect */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10 opacity-30"></div>
        </div>
    );
};