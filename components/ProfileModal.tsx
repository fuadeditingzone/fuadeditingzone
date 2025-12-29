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
                    
                    {/* Anchored dropdown - Substantially increased width to 420px */}
                    <motion.div
                        initial={{ opacity: 0, y: -12, scale: 0.95, transformOrigin: 'top right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -12, scale: 0.95 }}
                        className="absolute top-[84px] right-4 md:right-12 w-[calc(100%-2rem)] max-w-[420px] bg-white rounded-[3rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-zinc-100 flex flex-col"
                    >
                        {/* Header - More height and padding */}
                        <div className="px-8 py-6 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-3.5">
                                <UserCircleIcon className="w-6 h-6 text-zinc-900" />
                                <span className="text-sm font-black uppercase tracking-[0.35em] text-zinc-900">Artist Profile</span>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content Area - Luxurious Spacing */}
                        <div className="px-12 py-12 flex flex-col items-center bg-white">
                            {/* Much Larger Profile Image */}
                            <div className="relative mb-10 shrink-0">
                                <div className="p-2.5 bg-white rounded-[2.5rem] shadow-lg ring-1 ring-zinc-100">
                                    <img 
                                        src={user.imageUrl} 
                                        alt="Profile" 
                                        className="relative w-36 h-36 rounded-[2rem] object-cover" 
                                    />
                                </div>
                                <div className="absolute -bottom-1.5 -right-1.5 bg-red-600 text-white p-2.5 rounded-2xl shadow-xl z-10 border-[4px] border-white">
                                    <CheckCircleIcon className="w-5 h-5" />
                                </div>
                            </div>

                            {/* Name & Username - Massive typography */}
                            <div className="text-center mb-10 w-full shrink-0">
                                <h3 className="text-3xl font-black text-zinc-900 uppercase tracking-tighter leading-none px-1">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <div className="mt-5">
                                    <p className="text-[11px] text-red-600 font-black uppercase tracking-[0.35em] bg-red-50 px-6 py-2.5 rounded-full inline-block border border-red-100">
                                        @{user.username || 'legend'}
                                    </p>
                                </div>
                            </div>

                            {/* Information Rows - Bigger containers */}
                            <div className="w-full space-y-4 mb-12 shrink-0">
                                <div className="flex items-center justify-between px-6 py-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100/50">
                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Artist Since</span>
                                    <span className="text-[13px] text-zinc-900 font-bold">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-6 py-5 bg-zinc-50 rounded-[1.5rem] border border-zinc-100/50">
                                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">Zone Role</span>
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[11px] text-zinc-900 font-black uppercase tracking-widest">Verified Artist</span>
                                    </div>
                                </div>
                            </div>

                            {/* Primary Button - Large CTA */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-6 bg-zinc-900 text-white font-black uppercase tracking-[0.4em] text-[12px] rounded-[1.5rem] hover:bg-red-600 transition-all shadow-2xl active:scale-[0.96] shrink-0"
                            >
                                Open Account Settings
                            </button>
                        </div>

                        {/* Footer - Extended */}
                        <div className="p-6 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.7em]">Fuad Editing Zone • Secure Artist Hub</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
