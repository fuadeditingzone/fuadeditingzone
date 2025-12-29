import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, EmailIcon, GlobeAltIcon } from './Icons';

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
    const [view, setView] = useState<'overview' | 'settings'>('overview');

    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

    useEffect(() => {
        if (user) {
            setNewUsername(user.username || '');
            checkCooldown();
        }
    }, [user, isOpen]);

    const checkCooldown = () => {
        if (!user) return;
        const lastUpdateStr = user.unsafeMetadata?.lastUsernameUpdate as string;
        const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr).getTime() : (user.createdAt ? new Date(user.createdAt).getTime() : Date.now());
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
            setView('overview');
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
                setView('overview');
            }, 1500);
        } catch (err: any) {
            setErrorMessage(err.errors?.[0]?.message || "Identity sync failed. Alias might be taken.");
            setStatus('error');
        }
    };

    if (!isLoaded || !user) return null;

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently Joined';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/95 backdrop-blur-2xl"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_120px_rgba(220,38,38,0.25)] flex flex-col max-h-[calc(100dvh-40px)]"
                    >
                        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-red-600 to-transparent opacity-60"></div>
                        
                        {/* Header - Fixed */}
                        <div className="p-8 md:p-10 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-600/10 rounded-2xl flex items-center justify-center border border-red-600/20">
                                    <UserCircleIcon className="w-7 h-7 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">Profile Hub</h2>
                                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">Fuad Editing Zone</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8 md:p-12 custom-scrollbar space-y-10">
                            <AnimatePresence mode="wait">
                                {view === 'overview' ? (
                                    <motion.div 
                                        key="overview"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-10"
                                    >
                                        <div className="flex flex-col md:flex-row items-center gap-8 bg-white/5 p-8 rounded-[2rem] border border-white/5 shadow-inner">
                                            <div className="relative group shrink-0">
                                                <div className="absolute -inset-2 bg-red-600/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <img 
                                                    src={user.imageUrl} 
                                                    alt="User Profile" 
                                                    className="w-28 h-28 md:w-36 md:h-36 rounded-[2rem] object-cover relative z-10 border-2 border-red-600 shadow-2xl" 
                                                />
                                                <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg z-20 border border-white/20">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                </div>
                                            </div>
                                            
                                            <div className="text-center md:text-left flex-1 space-y-4 min-w-0">
                                                <div>
                                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight truncate">{user.fullName || 'Legend Guest'}</h3>
                                                    <div className="flex flex-wrap justify-center md:justify-start items-center gap-3 mt-1">
                                                        <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">@{user.username || 'unidentified'}</span>
                                                        <span className="w-1 h-1 bg-white/20 rounded-full"></span>
                                                        <span className="text-gray-400 text-[10px] font-black uppercase tracking-widest truncate">Member since {memberSince}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-black/60 rounded-xl border border-white/10">
                                                        <EmailIcon className="w-3.5 h-3.5 text-gray-500" />
                                                        <span className="text-[11px] text-white font-bold truncate max-w-[200px]">{user.primaryEmailAddress?.emailAddress}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
                                            <button 
                                                onClick={() => setView('settings')}
                                                className="group p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-red-600/30 rounded-2xl text-left transition-all shadow-lg"
                                            >
                                                <SparklesIcon className="w-6 h-6 text-red-600 mb-4 group-hover:rotate-12 transition-transform" />
                                                <h4 className="text-white font-black text-sm uppercase tracking-wider">Change Alias</h4>
                                                <p className="text-gray-300 text-[10px] mt-1 font-medium">Update your terminal username and identifier.</p>
                                            </button>
                                            
                                            <button 
                                                onClick={() => {
                                                    const btn = document.querySelector('.cl-userButtonTrigger') as HTMLElement;
                                                    if (btn) {
                                                        onClose();
                                                        btn.click();
                                                    }
                                                }}
                                                className="group p-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl text-left transition-all shadow-lg"
                                            >
                                                <GlobeAltIcon className="w-6 h-6 text-gray-400 mb-4 group-hover:scale-110 transition-transform" />
                                                <h4 className="text-white font-black text-sm uppercase tracking-wider">Account Security</h4>
                                                <p className="text-gray-300 text-[10px] mt-1 font-medium">Manage emails, passwords, and active sessions.</p>
                                            </button>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        key="settings"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-8"
                                    >
                                        <div className="space-y-3">
                                            <label className="text-[10px] uppercase font-black text-gray-300 tracking-[0.3em] ml-1">Terminal Alias (Username)</label>
                                            <div className="relative">
                                                <input 
                                                    type="text"
                                                    value={newUsername}
                                                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                                                    disabled={!!cooldownRemaining || status === 'updating'}
                                                    placeholder="new_alias"
                                                    className={`w-full bg-black/40 border border-white/10 rounded-2xl px-7 py-5 text-sm text-white focus:border-red-600 focus:bg-black outline-none transition-all placeholder:text-gray-800 ${!!cooldownRemaining ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                                />
                                                {!!cooldownRemaining && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600/10 border border-red-600/30 px-4 py-1.5 rounded-full">
                                                        <span className="text-[8px] font-black text-red-500 uppercase tracking-widest">Security Lock: {cooldownRemaining}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1 leading-relaxed">
                                                {!!cooldownRemaining 
                                                    ? "IDENTITY SECURE: ALIAS CHANGES ARE LOCKED FOR 7 DAYS AFTER THE LAST UPDATE."
                                                    : "CHOOSE YOUR UNIQUE TERMINAL TAG. UPDATES ARE RATE-LIMITED TO ONCE PER WEEK."}
                                            </p>
                                        </div>

                                        {status === 'error' && (
                                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-red-600/10 border border-red-600/20 rounded-2xl text-center">
                                                <p className="text-[11px] text-red-500 font-black uppercase tracking-widest">{errorMessage}</p>
                                            </motion.div>
                                        )}

                                        <div className="flex gap-4 pb-4">
                                            <button 
                                                onClick={() => setView('overview')}
                                                className="flex-1 py-4 text-gray-300 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors"
                                            >
                                                Back to Profile
                                            </button>
                                            <button 
                                                onClick={handleUpdateUsername}
                                                disabled={!!cooldownRemaining || status === 'updating' || newUsername === user.username}
                                                className={`flex-[2] btn-angular py-4 flex items-center justify-center gap-3 transition-all ${!!cooldownRemaining || newUsername === user.username ? 'bg-gray-900 text-gray-700 cursor-not-allowed border border-white/5' : 'bg-red-600 hover:bg-red-700 text-white font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_15px_30px_rgba(220,38,38,0.3)]'}`}
                                            >
                                                {status === 'updating' ? <SparklesIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                                                <span>{status === 'updating' ? 'Syncing...' : 'Update Alias'}</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        
                        {/* Footer - Fixed */}
                        <div className="p-6 bg-black/80 backdrop-blur-md border-t border-white/10 text-center shrink-0">
                            <p className="text-[8px] text-gray-400 font-black uppercase tracking-[0.5em]">Identity verification provided by Clerk.dev • FEZ Core</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};