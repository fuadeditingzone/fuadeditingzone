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

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New Member';

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
                <div className="fixed inset-0 z-[50000]">
                    {/* Transparent backdrop - NO blur */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/5"
                    />
                    
                    {/* Anchored dropdown - Increased max-width for a "Bigger" layout */}
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96, transformOrigin: 'top right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        className="absolute top-[76px] right-4 md:right-8 w-[calc(100%-2rem)] max-w-[360px] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_90px_rgba(0,0,0,0.22)] border border-zinc-100 flex flex-col"
                    >
                        {/* Header - More padding */}
                        <div className="px-6 py-5 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-3">
                                <UserCircleIcon className="w-5 h-5 text-zinc-900" />
                                <span className="text-xs font-black uppercase tracking-[0.3em] text-zinc-900">Artist Profile</span>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Area - Much more spacious */}
                        <div className="px-10 py-10 flex flex-col items-center bg-white">
                            {/* Larger Profile Image */}
                            <div className="relative mb-8 shrink-0">
                                <div className="p-2 bg-white rounded-[2rem] shadow-md ring-1 ring-zinc-100">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="relative w-28 h-28 rounded-[1.5rem] object-cover" 
                                    />
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-2 rounded-xl shadow-xl z-10 border-[3px] border-white">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Name & Username - Larger typography */}
                            <div className="text-center mb-8 w-full shrink-0">
                                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none line-clamp-2 px-1">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <div className="mt-4">
                                    <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.3em] bg-red-50 px-5 py-2 rounded-full inline-block border border-red-100">
                                        @{user.username || 'legend'}
                                    </p>
                                </div>
                            </div>

                            {/* Information Rows - Larger targets */}
                            <div className="w-full space-y-3 mb-10 shrink-0">
                                <div className="flex items-center justify-between px-5 py-4 bg-zinc-50 rounded-[1.25rem] border border-zinc-100/50">
                                    <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Account Created</span>
                                    <span className="text-[11px] text-zinc-900 font-bold">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-5 py-4 bg-zinc-50 rounded-[1.25rem] border border-zinc-100/50">
                                    <span className="text-[9px] text-zinc-400 uppercase font-black tracking-widest">Pro Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-zinc-900 font-black uppercase tracking-widest">Verified Artist</span>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Button - More prominent */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-5 bg-zinc-900 text-white font-black uppercase tracking-[0.35em] text-[11px] rounded-[1.25rem] hover:bg-red-600 transition-all shadow-xl active:scale-[0.96] shrink-0"
                            >
                                Open Account Settings
                            </button>
                        </div>

                        {/* Footer - More spacing */}
                        <div className="p-5 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.6em]">Fuad Editing Zone • Secure Artist Access</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
