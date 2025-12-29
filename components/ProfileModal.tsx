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
                        initial={{ scale: 0.98, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.98, opacity: 0, y: 20 }}
                        className="relative w-full max-w-[340px] bg-white rounded-[2.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.4)] flex flex-col max-h-[85vh]"
                    >
                        {/* Header - Light Header */}
                        <div className="p-5 flex justify-between items-center border-b border-zinc-100 shrink-0 bg-zinc-50/50">
                            <div className="flex items-center gap-2">
                                <UserCircleIcon className="w-4 h-4 text-zinc-900" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-900">Member ID</span>
                            </div>
                            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-900 transition-colors">
                                <CloseIcon className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Content Area - White Background */}
                        <div className="px-6 py-8 flex flex-col items-center overflow-y-auto custom-scrollbar flex-1 bg-white">
                            {/* Profile Image */}
                            <div className="relative mb-6 shrink-0">
                                <div className="absolute -inset-4 bg-red-600/10 blur-2xl rounded-full"></div>
                                <img 
                                    src={user.imageUrl} 
                                    alt="Profile" 
                                    className="relative w-24 h-24 rounded-[2rem] object-cover border-4 border-white shadow-xl ring-1 ring-zinc-200" 
                                />
                                <div className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1 rounded-xl shadow-lg z-10 border-2 border-white">
                                    <CheckCircleIcon className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Name & Username */}
                            <div className="text-center mb-8 w-full shrink-0">
                                <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight leading-none truncate">
                                    {user.fullName || 'FEZ Member'}
                                </h3>
                                <p className="text-[10px] text-red-600 font-black uppercase tracking-[0.2em] mt-3 bg-red-50 px-4 py-1.5 rounded-full inline-block border border-red-100">
                                    @{user.username || 'legend'}
                                </p>
                            </div>

                            {/* Information Cards - Using light zinc for contrast */}
                            <div className="w-full space-y-3 mb-8 shrink-0">
                                <div className="flex flex-col gap-1 px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-red-200 transition-colors">
                                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Network Email</span>
                                    <span className="text-[11px] text-zinc-900 font-bold truncate">{user.primaryEmailAddress?.emailAddress}</span>
                                </div>
                                <div className="flex flex-col gap-1 px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-red-200 transition-colors">
                                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Enrollment Date</span>
                                    <span className="text-[11px] text-zinc-900 font-bold">Initiated {memberSince}</span>
                                </div>
                                <div className="flex flex-col gap-1 px-5 py-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:border-red-200 transition-colors">
                                    <span className="text-[8px] text-zinc-400 uppercase font-black tracking-widest">Zone Permission</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
                                        <span className="text-[10px] text-zinc-900 font-black uppercase tracking-widest">Verified Artist</span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Action Button */}
                            <button 
                                onClick={handleManageAccount}
                                className="w-full py-4 bg-zinc-900 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl hover:bg-red-600 transition-all shadow-xl active:scale-95 shrink-0"
                            >
                                Manage Account
                            </button>
                        </div>

                        {/* Footer - Light Footer */}
                        <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center shrink-0">
                            <p className="text-[8px] text-zinc-400 font-black uppercase tracking-[0.5em]">Identity Secured • Fuad Editing Zone</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
