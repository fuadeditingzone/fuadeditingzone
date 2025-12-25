import React, { useState, useEffect, useRef } from 'react';
import { graphicWorks, vfxEdits } from '../data';
import { useParallax } from '../contexts/ParallaxContext';

// --- Helper Functions & Data ---
const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

const allMedia = [
    ...graphicWorks.map(item => ({ type: 'image' as const, url: item.imageUrl, id: `g-${item.id}` })),
    ...vfxEdits.map(item => ({ type: 'video' as const, url: item.url, id: `v-${item.id}` }))
];

const GRID_SIZE = 36; // 6x6 grid

const getShuffledMedia = () => {
    const shuffled = shuffleArray(allMedia);
    const loopedMedia: typeof allMedia = [];
    while (loopedMedia.length < GRID_SIZE) {
        loopedMedia.push(...shuffled);
    }
    return loopedMedia.slice(0, GRID_SIZE);
};

// --- Single Cell Component for Hover-to-Play ---
const GridCell: React.FC<{ item: typeof allMedia[0] }> = ({ item }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleMouseEnter = () => {
        if (videoRef.current) {
            videoRef.current.play().catch(() => {});
        }
    };

    const handleMouseLeave = () => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <div 
            className="relative w-full h-full rounded-sm md:rounded-lg overflow-hidden bg-black shadow-lg border border-white/5 group"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {item.type === 'image' && (
                <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover grayscale-[0.3] brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700" loading="lazy" />
            )}
            {item.type === 'video' && item.url && (
                <video 
                    ref={videoRef}
                    src={item.url} 
                    loop 
                    muted 
                    playsInline 
                    className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 transition-all duration-700" 
                />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            <div className="absolute inset-0 bg-red-900/5 mix-blend-color"></div>
        </div>
    );
};

// --- Grid Component ---
const GridLayer: React.FC<{ items: typeof allMedia; isVisible: boolean }> = React.memo(({ items, isVisible }) => {
    return (
        <div className={`absolute inset-0 grid grid-cols-4 md:grid-cols-6 grid-rows-9 md:grid-rows-6 gap-1 md:gap-2 transition-opacity duration-[2500ms] ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {items.map((item, index) => (
                <GridCell key={`${item.id}-${index}`} item={item} />
            ))}
        </div>
    );
});


// --- Main Component ---
export const MediaGridBackground: React.FC = () => {
    const [gridOneItems, setGridOneItems] = useState<typeof allMedia>([]);
    const [gridTwoItems, setGridTwoItems] = useState<typeof allMedia>([]);
    const [isGridOneVisible, setIsGridOneVisible] = useState(true);
    const { x, y } = useParallax();

    useEffect(() => {
        setGridOneItems(getShuffledMedia());
        setGridTwoItems(getShuffledMedia());
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isGridOneVisible) {
                setGridTwoItems(getShuffledMedia());
            } else {
                setGridOneItems(getShuffledMedia());
            }
            setIsGridOneVisible(prev => !prev);
        }, 25000);

        return () => clearInterval(intervalId);
    }, [isGridOneVisible]);

    const containerStyle = {
        transform: `perspective(1500px) rotateX(${y * 4}deg) rotateY(${x * 4}deg) scale(1.15)`,
        transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'transform' as const,
    };

    return (
        <div 
            className="fixed inset-[-10%] -z-10 pointer-events-none opacity-60 md:opacity-75"
            style={containerStyle}
        >
            <GridLayer items={gridOneItems} isVisible={isGridOneVisible} />
            <GridLayer items={gridTwoItems} isVisible={!isGridOneVisible} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]"></div>
            <div className="absolute inset-0 bg-black/30"></div>
        </div>
    );
};