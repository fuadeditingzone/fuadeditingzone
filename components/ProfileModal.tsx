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
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.98, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 15 }}
                        className="relative w-full max-w-[340px] bg-white/10 backdrop-blur-3xl border border-white/30 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
                    >
                        {/* Header - Fixed */}
                        <div className="p-5 flex justify-between items-center border-b border-white/10 shrink-0 bg-black/20">
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4 text-white" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Identity Hub</span>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Content - Perfect No-Clip Padding */}
                        <div className="px-6 py-8 flex flex-col items-center overflow-y-auto custom-scrollbar flex-1">
                            {/* Profile Image with Glow */}
                            <div className="relative mb-8 shrink-0">
                                <div className="absolute -inset-4 bg-red-600/20 blur-2xl rounded-full"></div>
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="relative w-20 h-20 rounded-[1.8rem] object-cover border-2 border-white shadow-2xl" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-white text-red-600 p-1 rounded-lg shadow-lg z-10">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {/* Name Info */}
                            <div className="text-center mb-8 w-full shrink-0 px-2">
                                <h3 className="text-xl font-black text-white uppercase tracking-tight leading-none truncate drop-shadow-md">
                                    {user.fullName || 'Legend Member'}
                                </h3>
                                <p className="text-[10px] text-white font-black uppercase tracking-widest mt-3 bg-red-600 px-4 py-1.5 rounded-full inline-block shadow-lg">
                                    @{user.username || 'user'}
                                </p>
                            </div>

                            {/* Details Grid - Using dark cards for contrast/readability */}
                            <div className="w-full space-y-3 mb-8 shrink-0">
                                <div className="flex flex-col gap-1 px-5 py-4 bg-black/40 rounded-2xl border border-white/10 group hover:border-white/30 transition-colors">
                                    <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Email Address</span>
                                    <span className="text-[11px] text-white font-bold truncate">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                                <div className="flex flex-col gap-1 px-5 py-4 bg-black/40 rounded-2xl border border-white/10 group hover:border-white/30 transition-colors">
                                    <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Enrollment</span>
                                    <span className="text-[11px] text-white font-bold">Member Since {memberSince}</span>
                                </div>
                                <div className="flex flex-col gap-1 px-5 py-4 bg-black/40 rounded-2xl border border-white/10 group hover:border-white/30 transition-colors">
                                    <span className="text-[8px] text-white/50 uppercase font-black tracking-widest">Zone Status</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                        <span className="text-[10px] text-white font-black uppercase tracking-widest">Authorized</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button - White for the "White Appearance" */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-4 bg-white text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95 shrink-0"
                            >
                                Manage Account
                            </button>
                        </div>

                        {/* Footer - Fixed */}
                        <div className="p-4 bg-black/30 border-t border-white/10 text-center shrink-0">
                            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.5em]">Fuad Editing Zone Terminal</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
