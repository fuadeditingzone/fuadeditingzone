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
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4">
                    {/* Darker backdrop for focused interaction */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    
                    {/* Centered Modal - Optimized for zero clipping */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[420px] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.4)] border border-zinc-100 flex flex-col overflow-hidden max-h-[85vh]"
                    >
                        {/* Header - Spacious & Clear */}
                        <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-4">
                                <UserCircleIcon className="w-6 h-6 text-zinc-900" />
                                <span className="text-xs md:text-sm font-black uppercase tracking-[0.35em] text-zinc-900">Artist Profile</span>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Area - Luxurious Spacing */}
                        <div className="px-8 md:px-12 py-10 md:py-12 flex flex-col items-center bg-white overflow-y-auto custom-scrollbar">
                            {/* Profile Image with Ring */}
                            <div className="relative mb-8 md:mb-10 shrink-0">
                                <div className="p-3 bg-white rounded-[2.8rem] shadow-xl ring-1 ring-zinc-100">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="relative w-32 h-32 md:w-36 md:h-36 rounded-[2.2rem] object-cover" 
                                    />
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 bg-red-600 text-white p-2.5 md:p-3 rounded-2xl shadow-2xl z-10 border-[5px] border-white">
                                    <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                            </div>

                            {/* Name & Username - Optimized spacing */}
                            <div className="text-center mb-8 md:mb-10 w-full shrink-0">
                                <h3 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-tight break-words px-2">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <div className="mt-4">
                                    <p className="text-[10px] md:text-xs text-red-600 font-black uppercase tracking-[0.35em] bg-red-50 px-6 py-2.5 rounded-full inline-block border border-red-100">
                                        @{user.username || 'legend'}
                                    </p>
                                </div>
                            </div>

                            {/* Information Rows */}
                            <div className="w-full space-y-4 mb-10 md:mb-12 shrink-0">
                                <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-5 bg-zinc-50 rounded-[1.75rem] border border-zinc-100/50">
                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Artist Since</span>
                                    <span className="text-xs md:text-sm text-zinc-900 font-bold">{memberSince}</span>
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-5 bg-zinc-50 rounded-[1.75rem] border border-zinc-100/50">
                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Zone Status</span>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[11px] md:text-xs text-zinc-900 font-black uppercase tracking-widest">Verified Artist</span>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Button */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-5 md:py-6 bg-zinc-900 text-white font-black uppercase tracking-[0.4em] text-[11px] md:text-xs rounded-[1.75rem] hover:bg-red-600 transition-all shadow-2xl active:scale-[0.97] shrink-0"
                            >
                                Open Account Settings
                            </button>
                        </div>

                        {/* Footer - Spacious Branding */}
                        <div className="p-6 md:p-8 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[9px] md:text-[10px] text-zinc-400 font-black uppercase tracking-[0.7em]">Fuad Editing Zone • Secure Session</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
