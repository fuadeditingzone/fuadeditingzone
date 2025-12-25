
import React, { useEffect } from 'react';
import { CloseIcon, GlobeAltIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeLanguage: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onChangeLanguage }) => {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div role="dialog" aria-modal="true" className="fixed inset-0 bg-black/80 backdrop-blur-md z-[70] flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
            <div
                className="relative bg-black rounded-xl w-full max-w-sm p-8 text-center"
                style={{ animation: 'fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    aria-label="Close settings"
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                >
                    <CloseIcon className="w-6 h-6" />
                </button>

                <h2 className="text-2xl font-bold text-gradient-white-gray mb-6">Settings</h2>
                
                <div className="text-left mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Language</label>
                    {/* Angular Shape */}
                    <button 
                        onClick={() => {
                            onClose(); // Close settings before opening language modal
                            onChangeLanguage();
                        }}
                        className="btn-angular w-full flex items-center justify-center gap-3 bg-white/10 text-white font-bold py-4 px-4 transition-all duration-300 hover:bg-white/20 focus:outline-none"
                    >
                        <GlobeAltIcon className="w-5 h-5" />
                        <span>Change Conversation Language</span>
                    </button>
                </div>
            </div>
        </div>
    );
};