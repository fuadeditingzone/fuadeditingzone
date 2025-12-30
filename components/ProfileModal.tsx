import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { CloseIcon, CheckCircleIcon, UserCircleIcon } from './Icons';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, isLoaded } = useUser();

    if (!isLoaded || !user) return null;

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'New Member';

    const handleManageAccount = () => {
        const btn = document.querySelector('.cl-userButtonTrigger') as HTMLElement;
        if (btn) {
            onClose();
            btn.click();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-6">
                    {/* Darker backdrop - NO blur as requested */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60"
                    />
                    
                    {/* Centered Modal Content - Designed for clarity and zero clipping */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[500px] bg-white rounded-[4rem] shadow-[0_60px_180px_rgba(0,0,0,0.7)] border border-zinc-100 flex flex-col overflow-hidden max-h-[92vh]"
                    >
                        {/* Premium Header */}
                        <div className="px-12 py-10 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-5">
                                <UserCircleIcon className="w-8 h-8 text-zinc-900" />
                                <span className="text-sm md:text-base font-black uppercase tracking-[0.5em] text-zinc-900">Artist Hub</span>
                            </div>
                            <button onClick={onClose} className="p-4 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors border border-transparent hover:border-zinc-200">
                                <CloseIcon className="w-8 h-8" />
                            </button>
                        </div>

                        {/* Profile Body - Luxury Spacing */}
                        <div className="px-12 md:px-20 py-16 md:py-24 flex flex-col items-center bg-white overflow-y-auto custom-scrollbar">
                            {/* Larger Avatar Display */}
                            <div className="relative mb-16 shrink-0">
                                <div className="p-4 bg-white rounded-[4rem] shadow-2xl ring-1 ring-zinc-100 scale-110">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="relative w-44 h-44 md:w-52 md:h-52 rounded-[3.2rem] object-cover" 
                                    />
                                </div>
                                <div className="absolute -bottom-3 -right-3 bg-red-600 text-white p-4 rounded-[1.5rem] shadow-3xl z-10 border-[8px] border-white">
                                    <CheckCircleIcon className="w-8 h-8" />
                                </div>
                            </div>

                            {/* Info Section - Ultra Spacious */}
                            <div className="text-center mb-16 w-full shrink-0">
                                <h3 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none break-words px-4">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <div className="mt-8">
                                    <p className="text-[12px] md:text-sm text-red-600 font-black uppercase tracking-[0.6em] bg-red-50 px-10 py-4 rounded-full inline-block border-2 border-red-100 shadow-sm">
                                        @{user.username || 'artist'}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="w-full space-y-6 mb-20 shrink-0">
                                <div className="flex items-center justify-between px-10 py-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                                    <span className="text-[11px] text-zinc-400 uppercase font-black tracking-widest">Artist Since</span>
                                    <span className="text-base text-zinc-900 font-black">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-10 py-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                                    <span className="text-[11px] text-zinc-400 uppercase font-black tracking-widest">Auth Status</span>
                                    <div className="flex items-center gap-4">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-[12px] text-zinc-900 font-black uppercase tracking-[0.2em]">Verified</span>
                                    </div>
                                </div>
                            </div>

                            {/* Control Button */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-7 md:py-9 bg-zinc-900 text-white font-black uppercase tracking-[0.6em] text-[13px] md:text-sm rounded-[2.5rem] hover:bg-red-600 transition-all shadow-[0_30px_60px_rgba(0,0,0,0.4)] active:scale-[0.97] shrink-0"
                            >
                                Open Settings
                            </button>
                        </div>

                        {/* Footnote */}
                        <div className="p-10 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[1em]">Fuad Ahmed • Portfolio Session</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};