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
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-6">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 10 }}
                        className="relative w-full max-w-[340px] bg-zinc-950/60 backdrop-blur-2xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
                    >
                        {/* Compact Header */}
                        <div className="p-5 flex justify-between items-center border-b border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Identity</span>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-zinc-500 hover:text-white transition-colors">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Minimalist Content */}
                        <div className="p-8 flex flex-col items-center">
                            <div className="relative mb-5">
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="w-20 h-20 rounded-2xl object-cover border border-red-600 shadow-xl" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-lg">
                                    <CheckCircleIcon className="w-3 h-3" />
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">{user.fullName || 'Legend'}</h3>
                                <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest mt-1">@{user.username || 'fez_user'}</p>
                            </div>

                            <div className="w-full space-y-2 mb-8">
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Email</span>
                                    <span className="text-[10px] text-white font-bold truncate max-w-[120px]">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Join Date</span>
                                    <span className="text-[10px] text-white font-bold">{memberSince}</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-3.5 bg-white text-black font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"
                            >
                                Settings Terminal
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
