import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon } from './Icons';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, isLoaded } = useUser();

    // 7-day modification restriction logic
    const canModify = useMemo(() => {
        if (!user?.createdAt) return false;
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const accountAge = Date.now() - new Date(user.createdAt).getTime();
        return accountAge >= sevenDaysMs;
    }, [user]);

    if (!isLoaded || !user) return null;

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'New Member';

    const handleManageAccount = () => {
        if (!canModify) return;
        // Trigger the internal Clerk UserButton dropdown programmatically
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
                    {/* Darker backdrop - NO blur as requested for clarity */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/70"
                    />
                    
                    {/* Centered Modal Content - ENLARGED FOR ZERO CLIPPING */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-[580px] bg-white rounded-[4.5rem] shadow-[0_80px_200px_rgba(0,0,0,0.8)] border border-red-600/20 flex flex-col overflow-hidden max-h-[94vh]"
                    >
                        {/* Selected Legend Header */}
                        <div className="px-14 py-12 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-6">
                                <UserCircleIcon className="w-10 h-10 text-zinc-900" />
                                <span className="text-base md:text-lg font-black uppercase tracking-[0.5em] text-zinc-900">Artist Profile</span>
                            </div>
                            <button onClick={onClose} className="p-5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors border border-transparent hover:border-zinc-200">
                                <CloseIcon className="w-9 h-9" />
                            </button>
                        </div>

                        {/* Profile Body - LUXURY SPACIOUSNESS */}
                        <div className="px-14 md:px-24 py-16 md:py-24 flex flex-col items-center bg-white overflow-y-auto custom-scrollbar">
                            {/* Larger Avatar Display */}
                            <div className="relative mb-16 shrink-0">
                                <div className="p-5 bg-white rounded-[4.5rem] shadow-3xl ring-2 ring-red-600/10 scale-110">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="relative w-44 h-44 md:w-52 md:h-52 rounded-[3.8rem] object-cover" 
                                    />
                                </div>
                                <div className="absolute -bottom-4 -right-4 bg-red-600 text-white p-5 rounded-[1.8rem] shadow-4xl z-10 border-[10px] border-white">
                                    <CheckCircleIcon className="w-10 h-10" />
                                </div>
                            </div>

                            {/* Info Section - ULTRA SPACIOUS */}
                            <div className="text-center mb-16 w-full shrink-0">
                                <h3 className="text-4xl md:text-5xl font-black text-zinc-900 uppercase tracking-tighter leading-none break-words px-6 mb-8">
                                    {user.fullName || 'FEZ Artist'}
                                </h3>
                                <div>
                                    <p className="text-[14px] md:text-base text-red-600 font-black uppercase tracking-[0.6em] bg-red-50 px-12 py-5 rounded-full inline-block border-2 border-red-100 shadow-sm">
                                        @{user.username || 'selected_legend'}
                                    </p>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div className="w-full space-y-6 mb-16 shrink-0">
                                <div className="flex items-center justify-between px-10 py-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                                    <span className="text-[11px] text-zinc-400 uppercase font-black tracking-widest">Verification Date</span>
                                    <span className="text-base text-zinc-900 font-black">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-10 py-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                                    <span className="text-[11px] text-zinc-400 uppercase font-black tracking-widest">Zone Status</span>
                                    <div className="flex items-center gap-4">
                                        <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.6)]"></div>
                                        <span className="text-[14px] text-zinc-900 font-black uppercase tracking-[0.2em]">Secure Access</span>
                                    </div>
                                </div>
                            </div>

                            {/* Modification Guard */}
                            <div className="w-full shrink-0">
                                {canModify ? (
                                    <button 
                                        onClick={handleManageAccount}
                                        className="w-full py-9 md:py-11 bg-zinc-900 text-white font-black uppercase tracking-[0.7em] text-[14px] md:text-base rounded-[2.5rem] hover:bg-red-600 transition-all shadow-[0_40px_80px_rgba(0,0,0,0.4)] active:scale-[0.97]"
                                    >
                                        Update Preferences
                                    </button>
                                ) : (
                                    <div className="w-full p-8 md:p-12 bg-red-50/50 rounded-[3rem] border-2 border-red-100 text-center space-y-4">
                                        <div className="flex items-center justify-center gap-3 text-red-600">
                                            <SparklesIcon className="w-6 h-6 animate-spin-slow" />
                                            <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em]">Identity Locked</span>
                                        </div>
                                        <p className="text-[10px] md:text-[12px] text-zinc-500 font-medium leading-relaxed uppercase tracking-[0.5em] px-4">
                                            Zone Policy: Verification details cannot be modified during the first 7 days.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Footnote */}
                        <div className="p-12 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[11px] text-zinc-400 font-black uppercase tracking-[1.2em]">Fuad Ahmed • Artist Central Secure</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};