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
                    
                    {/* Anchored smaller dropdown */}
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96, transformOrigin: 'top right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        className="absolute top-[68px] right-4 md:right-8 w-full max-w-[270px] bg-white rounded-[1.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-zinc-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-3 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-1.5">
                                <UserCircleIcon className="w-3.5 h-3.5 text-zinc-900" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-900">Account Hub</span>
                            </div>
                            <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-3 h-3" />
                            </button>
                        </div>

                        {/* Content Area - Optimized Spacing */}
                        <div className="px-5 py-5 flex flex-col items-center bg-white">
                            {/* Smaller Profile Image */}
                            <div className="relative mb-4 shrink-0">
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="relative w-16 h-16 rounded-[1.25rem] object-cover border-[3px] border-white shadow-md ring-1 ring-zinc-100" 
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 bg-red-600 text-white p-0.5 rounded shadow-sm z-10 border border-white">
                                    <CheckCircleIcon className="w-2.5 h-2.5" />
                                </div>
                            </div>

                            {/* Name & Username */}
                            <div className="text-center mb-5 w-full shrink-0 px-2">
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight leading-tight truncate">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <p className="text-[8px] text-red-600 font-black uppercase tracking-[0.2em] mt-1.5 bg-red-50 px-2.5 py-0.5 rounded-full inline-block border border-red-100">
                                    @{user.username || 'legend'}
                                </p>
                            </div>

                            {/* Minimalist Detail Snippets */}
                            <div className="w-full space-y-1.5 mb-5 shrink-0">
                                <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-50">
                                    <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">Joined</span>
                                    <span className="text-[9px] text-zinc-900 font-bold">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-50">
                                    <span className="text-[7px] text-zinc-400 uppercase font-black tracking-widest">Status</span>
                                    <div className="flex items-center gap-1">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[8px] text-zinc-900 font-black uppercase">Artist</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Action Button */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-3 bg-zinc-900 text-white font-black uppercase tracking-[0.2em] text-[8px] rounded-lg hover:bg-red-600 transition-all shadow-md active:scale-95 shrink-0"
                            >
                                Manage Account
                            </button>
                        </div>

                        {/* Smaller Footer */}
                        <div className="p-2.5 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[6px] text-zinc-400 font-black uppercase tracking-[0.4em]">FEZ Zone • Secure</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
