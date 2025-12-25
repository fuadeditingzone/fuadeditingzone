import React, { useState, useRef, useEffect } from 'react';

export const LazyImage: React.FC<{ src: string; alt: string; className?: string; loadIndex?: number }> = ({ src, alt, className, loadIndex = 0 }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load image instantly without waiting for it to be in view
    setIsInView(true);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-gray-900/50 rounded-lg overflow-hidden">
      {!isLoaded && (
        <div className="absolute inset-0 shimmer-bg"></div>
      )}
      <img
        src={isInView ? src : undefined}
        alt={alt}
        onLoad={() => setIsLoaded(true)}
        className={`${className} transition-opacity duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};