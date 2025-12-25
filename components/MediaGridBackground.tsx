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

const GRID_SIZE = 25; // 5x5 grid

const getShuffledMedia = () => {
    const shuffled = shuffleArray(allMedia);
    const loopedMedia: typeof allMedia = [];
    while (loopedMedia.length < GRID_SIZE) {
        loopedMedia.push(...shuffled);
    }
    return loopedMedia.slice(0, GRID_SIZE);
};

// --- Grid Component ---
const GridLayer: React.FC<{ items: typeof allMedia; isVisible: boolean }> = React.memo(({ items, isVisible }) => {
    const gridRef = useRef<HTMLDivElement>(null);

    // This effect ensures the grid videos continue to play even if the browser
    // tries to pause them for performance reasons.
    useEffect(() => {
        const interval = setInterval(() => {
            if (gridRef.current) {
                const videos = gridRef.current.querySelectorAll('video');
                videos.forEach(video => {
                    if (video.paused) {
                        video.play().catch(() => {
                            // Ignore errors that might occur if the play request is interrupted.
                        });
                    }
                });
            }
        }, 2000); // Check every 2 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div ref={gridRef} className={`absolute inset-0 grid grid-cols-5 grid-rows-5 gap-2 transition-opacity duration-[2000ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            {items.map((item, index) => (
                <div key={`${item.id}-${index}`} className="relative w-full h-full rounded-md overflow-hidden bg-black shadow-lg">
                    {/* Main content, covering the cell without blur */}
                    {item.type === 'image' && (
                        <img src={item.url} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                    )}
                    {item.type === 'video' && item.url && (
                        <video src={item.url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    )}

                    {/* Overlays */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(80,0,0,0.6)_0%,rgba(0,0,0,0.6)_80%)]"></div>
                </div>
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

    // Initialize grids on mount
    useEffect(() => {
        setGridOneItems(getShuffledMedia());
        setGridTwoItems(getShuffledMedia());
    }, []);

    // Interval to shuffle and cross-fade
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (isGridOneVisible) {
                setGridTwoItems(getShuffledMedia());
            } else {
                setGridOneItems(getShuffledMedia());
            }
            setIsGridOneVisible(prev => !prev);
        }, 30000);

        return () => clearInterval(intervalId);
    }, [isGridOneVisible]);

    const containerStyle = {
        transform: `perspective(1200px) rotateX(${y * 3}deg) rotateY(${x * 3}deg) scale(1.2)`,
        transition: 'transform 0.2s ease-out',
        willChange: 'transform' as const,
    };

    return (
        <div 
            className="fixed inset-[-20%] -z-10 pointer-events-none opacity-40"
            style={containerStyle}
        >
            <GridLayer items={gridOneItems} isVisible={isGridOneVisible} />
            <GridLayer items={gridTwoItems} isVisible={!isGridOneVisible} />
        </div>
    );
};
