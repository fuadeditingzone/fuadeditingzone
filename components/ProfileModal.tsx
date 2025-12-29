import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, EmailIcon, GlobeAltIcon } from './Icons';

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
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-lg"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="relative w-full max-w-md bg-[#0d0d0d] border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 flex justify-between items-center border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <UserCircleIcon className="w-5 h-5 text-red-600" />
                                <span className="text-xs font-black uppercase tracking-[0.2em] text-white">Profile Hub</span>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8 flex flex-col items-center text-center">
                            <div className="relative mb-6">
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="w-24 h-24 rounded-2xl object-cover border-2 border-red-600 shadow-xl" 
                                />
                                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-1 rounded-lg">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </div>
                            </div>

                            <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{user.fullName || 'Legend Member'}</h3>
                            <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-6">@{user.username || 'user'}</p>

                            <div className="w-full space-y-3 mb-8">
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <EmailIcon className="w-3.5 h-3.5 text-zinc-500" />
                                        <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Email</span>
                                    </div>
                                    <span className="text-[11px] text-white font-medium truncate max-w-[150px]">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <div className="flex items-center gap-2">
                                        <GlobeAltIcon className="w-3.5 h-3.5 text-zinc-500" />
                                        <span className="text-[11px] text-zinc-400 uppercase font-bold tracking-wider">Joined</span>
                                    </div>
                                    <span className="text-[11px] text-white font-medium">{memberSince}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                                Manage Account
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-white/5 text-center">
                            <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.3em]">Fuad Editing Zone Terminal</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
