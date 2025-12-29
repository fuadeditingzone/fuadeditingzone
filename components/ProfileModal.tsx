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
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 10 }}
                        className="relative w-full max-w-[340px] bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-5 flex justify-between items-center border-b border-white/10 shrink-0">
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4 text-white" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Profile Hub</span>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="p-8 flex flex-col items-center overflow-y-auto custom-scrollbar">
                            <div className="relative mb-6 shrink-0">
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="w-20 h-20 rounded-2xl object-cover border-2 border-red-600 shadow-xl" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-lg border border-white/20 shadow-lg">
                                    <CheckCircleIcon className="w-3 h-3" />
                                </div>
                            </div>

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none">{user.fullName || 'Legend Member'}</h3>
                                <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 bg-red-600/10 px-2 py-0.5 rounded-md inline-block">@{user.username || 'user'}</p>
                            </div>

                            <div className="w-full space-y-2 mb-8">
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">Email</span>
                                    <span className="text-[10px] text-white font-bold truncate max-w-[140px]">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">Member Since</span>
                                    <span className="text-[10px] text-white font-bold">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-xl border border-white/5">
                                    <span className="text-[9px] text-white/40 uppercase font-black tracking-widest">Status</span>
                                    <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active</span>
                                </div>
                            </div>

                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[9px] rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
                            >
                                Manage Account
                            </button>
                        </div>

                        <div className="p-4 bg-white/5 border-t border-white/10 text-center shrink-0">
                            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.4em]">Fuad Editing Zone Terminal</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
