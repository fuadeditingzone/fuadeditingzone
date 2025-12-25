import React, { useEffect } from 'react';
import { CloseIcon, YouTubeIcon, ChevronRightIcon } from './Icons';

interface YouTubeRedirectPopupProps {
  onClose: () => void;
  onConfirm: () => void;
}

export const YouTubeRedirectPopup: React.FC<YouTubeRedirectPopupProps> = ({ onClose, onConfirm }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fade-in backdrop-blur-md select-none">
            <div
                className="relative bg-[#0f0f0f] border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(220,38,38,0.1)] animate-popup-scale-in"
                onClick={e => e.stopPropagation()}
            >
                {/* Header Decoration */}
                <div className="h-1 bg-red-600 w-full"></div>
                
                <div className="p-8">
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20">
                            <YouTubeIcon className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    <div className="text-center space-y-2 mb-8">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-tighter">Explore Channel?</h2>
                        <p className="text-gray-400 text-sm font-medium leading-relaxed">
                            Jump to the <span className="text-red-500 font-bold">Video Portfolio</span> to view my latest cinematic visual edits and AMVs.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button 
                            onClick={onConfirm}
                            className="btn-angular btn-3d bg-red-600 text-white font-black py-4 px-6 transition-all duration-300 flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(220,38,38,0.3)] hover:bg-red-700"
                        >
                            <span className="uppercase tracking-[0.2em] text-xs">Jump to Portfolio</span>
                            <ChevronRightIcon className="w-4 h-4" />
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="text-gray-500 hover:text-white text-[10px] uppercase tracking-[0.3em] font-black py-3 transition-colors"
                        >
                            Stay Here
                        </button>
                    </div>
                </div>

                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors"
                >
                    <CloseIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};