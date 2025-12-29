
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon } from './Icons';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, isLoaded } = useUser();
    const [newUsername, setNewUsername] = useState('');
    const [status, setStatus] = useState<'idle' | 'updating' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    useEffect(() => {
        if (user) {
            setNewUsername(user.username || '');
            checkCooldown();
        }
    }, [user, isOpen]);

    const checkCooldown = () => {
        if (!user) return;

        // Clerk's createdAt is the initial marker. 
        // We store custom updates in unsafeMetadata to avoid needing a backend proxy for publicMetadata.
        const lastUpdateStr = user.unsafeMetadata?.lastUsernameUpdate as string;
        const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr).getTime() : new Date(user.createdAt!).getTime();
        const now = Date.now();
        const diff = now - lastUpdate;

        if (diff < ONE_WEEK_MS) {
            const remaining = ONE_WEEK_MS - diff;
            const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
            const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            setCooldownRemaining(`${days}d ${hours}h`);
        } else {
            setCooldownRemaining(null);
        }
    };

    const handleUpdateUsername = async () => {
        if (!user || !!cooldownRemaining) return;
        if (newUsername === user.username) {
            onClose();
            return;
        }

        setStatus('updating');
        setErrorMessage('');

        try {
            await user.update({
                username: newUsername,
                unsafeMetadata: {
                    ...user.unsafeMetadata,
                    lastUsernameUpdate: new Date().toISOString()
                }
            });
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                onClose();
            }, 2000);
        } catch (err: any) {
            console.error("Username update error:", err);
            setErrorMessage(err.errors?.[0]?.message || "Failed to update identity. The username might be taken.");
            setStatus('error');
        }
    };

    if (!isLoaded || !user) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_0_80px_rgba(220,38,38,0.15)]"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-red-600/10 rounded-full flex items-center justify-center border border-red-600/20">
                                        <UserCircleIcon className="w-6 h-6 text-red-600" />
                                    </div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">Identity Management</h2>
                                </div>
                                <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                    <CloseIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em] ml-1">Terminal Alias (Username)</label>
                                    <div className="relative">
                                        <input 
                                            type="text"
                                            value={newUsername}
                                            onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                            disabled={!!cooldownRemaining || status === 'updating'}
                                            placeholder="new_alias"
                                            className={`w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-red-600 focus:bg-black outline-none transition-all placeholder:text-gray-800 ${!!cooldownRemaining ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                        />
                                        {!!cooldownRemaining && (
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600/10 border border-red-600/30 px-3 py-1 rounded-full">
                                                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Locked: {cooldownRemaining}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest px-1">
                                        {!!cooldownRemaining 
                                            ? "Security Lock Active: Identites can only be cycled once per week."
                                            : "Choose your unique tag. Changes trigger a 7-day security lockout."}
                                    </p>
                                </div>

                                {status === 'error' && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-600/10 border border-red-600/20 rounded-xl">
                                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest leading-tight">{errorMessage}</p>
                                    </motion.div>
                                )}

                                {status === 'success' ? (
                                    <div className="py-4 flex flex-col items-center gap-3">
                                        <CheckCircleIcon className="w-10 h-10 text-green-500" />
                                        <span className="text-xs font-black text-white uppercase tracking-widest">Identity Secure</span>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={handleUpdateUsername}
                                        disabled={!!cooldownRemaining || status === 'updating' || newUsername === user.username}
                                        className={`w-full btn-angular py-4 flex items-center justify-center gap-3 transition-all ${!!cooldownRemaining || newUsername === user.username ? 'bg-gray-900 text-gray-700 cursor-not-allowed border border-white/5' : 'bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_15px_30px_rgba(220,38,38,0.3)]'}`}
                                    >
                                        {status === 'updating' ? (
                                            <>
                                                <SparklesIcon className="w-4 h-4 animate-spin" />
                                                <span>Syncing...</span>
                                            </>
                                        ) : (
                                            <>
                                                <SparklesIcon className="w-4 h-4" />
                                                <span>Update Alias</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 text-center">
                                <p className="text-[8px] text-gray-600 font-black uppercase tracking-[0.4em]">Fuad Editing Zone Secure Authentication</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
