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
                    {/* Very light backdrop to keep website visible */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/5 backdrop-blur-[2px]"
                    />
                    
                    {/* Anchored to top-right below the profile icon */}
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95, transformOrigin: 'top right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-[70px] right-6 md:right-10 w-full max-w-[320px] bg-white rounded-[2rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] border border-zinc-100 flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-4 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4 text-zinc-900" />
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-900">Account Hub</span>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="px-6 py-6 flex flex-col items-center bg-white">
                            {/* Profile Image */}
                            <div className="relative mb-5 shrink-0">
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="relative w-20 h-20 rounded-[1.75rem] object-cover border-4 border-white shadow-lg ring-1 ring-zinc-100" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-lg shadow-md z-10 border-2 border-white">
                                    <CheckCircleIcon className="w-3.5 h-3.5" />
                                </div>
                            </div>

                            {/* Name & Username */}
                            <div className="text-center mb-6 w-full shrink-0">
                                <h3 className="text-xl font-black text-zinc-900 uppercase tracking-tight leading-none truncate px-2">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <p className="text-[9px] text-red-600 font-black uppercase tracking-[0.2em] mt-2 bg-red-50 px-3 py-1 rounded-full inline-block border border-red-100">
                                    @{user.username || 'legend'}
                                </p>
                            </div>

                            {/* Detail Snippets */}
                            <div className="w-full space-y-2 mb-6 shrink-0">
                                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Joined</span>
                                    <span className="text-[10px] text-zinc-900 font-bold">{memberSince}</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-100">
                                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Status</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[9px] text-zinc-900 font-black uppercase">Verified Artist</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Action Button */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-3.5 bg-zinc-900 text-white font-black uppercase tracking-[0.3em] text-[9px] rounded-xl hover:bg-red-600 transition-all shadow-lg active:scale-95 shrink-0"
                            >
                                Manage Account
                            </button>
                        </div>

                        {/* Footer */}
                        <div className="p-3 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[7px] text-zinc-400 font-black uppercase tracking-[0.4em]">Fuad Editing Zone • Secure Session</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
