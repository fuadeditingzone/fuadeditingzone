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
                    {/* Transparent backdrop - NO blur */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40"
                    />
                    
                    {/* Centered Modal Content - Designed for clarity and no clipping */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[460px] bg-white rounded-[3rem] shadow-[0_50px_150px_rgba(0,0,0,0.6)] border border-zinc-100 flex flex-col overflow-hidden max-h-[90vh]"
                    >
                        {/* Elegant Header */}
                        <div className="px-10 py-7 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-4">
                                <UserCircleIcon className="w-6 h-6 text-zinc-900" />
                                <span className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-zinc-900">Artist Profile</span>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Profile Body - Spacious Layout */}
                        <div className="px-10 md:px-14 py-12 md:py-16 flex flex-col items-center bg-white overflow-y-auto custom-scrollbar">
                            {/* Avatar Display */}
                            <div className="relative mb-12 shrink-0">
                                <div className="p-3 bg-white rounded-[3rem] shadow-2xl ring-1 ring-zinc-100">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="relative w-36 h-36 md:w-44 md:h-44 rounded-[2.5rem] object-cover" 
                                    />
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-3 rounded-2xl shadow-3xl z-10 border-[6px] border-white">
                                    <CheckCircleIcon className="w-6 h-6" />
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="text-center mb-12 w-full shrink-0">
                                <h3 className="text-3xl md:text-4xl font-black text-zinc-900 uppercase tracking-tighter leading-none break-words px-4">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <div className="mt-5">
                                    <p className="text-[11px] md:text-xs text-red-600 font-black uppercase tracking-[0.4em] bg-red-50 px-8 py-3 rounded-full inline-block border border-red-100">
                                        @{user.username || 'artist'}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="w-full space-y-5 mb-14 shrink-0">
                                <div className="flex items-center justify-between px-8 py-6 bg-zinc-50 rounded-[2rem] border border-zinc-100/80">
                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Artist Since</span>
                                    <span className="text-sm text-zinc-900 font-bold">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-8 py-6 bg-zinc-50 rounded-[2rem] border border-zinc-100/80">
                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Zone Access</span>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[11px] text-zinc-900 font-black uppercase tracking-widest">Premium Active</span>
                                    </div>
                                </div>
                            </div>

                            {/* Control Button */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-6 md:py-7 bg-zinc-900 text-white font-black uppercase tracking-[0.5em] text-[11px] md:text-xs rounded-[2rem] hover:bg-red-600 transition-all shadow-2xl active:scale-[0.98] shrink-0"
                            >
                                Update Preferences
                            </button>
                        </div>

                        {/* Footnote */}
                        <div className="p-8 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.8em]">Fuad Editing Zone • Artist Central</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};