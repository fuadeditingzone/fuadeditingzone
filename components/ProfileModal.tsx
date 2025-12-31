import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { 
    CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, 
    ChevronRightIcon, ChatBubbleIcon, GlobeAltIcon, BriefcaseIcon 
} from './Icons';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "1032345523456",
  appId: "1:1032345523456:web:123456789",
};

// Initialize Firebase safely
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type TabType = 'identity' | 'public' | 'comms';

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>('identity');
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form States for Firebase Profile
    const [profileData, setProfileData] = useState({
        role: 'Client',
        profession: '',
        experience: '',
        bio: '',
        allowMessages: true,
        showOnline: true
    });

    // Fetch existing profile data from Firebase
    useEffect(() => {
        if (isOpen && user) {
            const profileRef = ref(db, `users/${user.id}/profile`);
            const unsubscribe = onValue(profileRef, (snap) => {
                const data = snap.val();
                if (data) {
                    setProfileData(prev => ({ ...prev, ...data }));
                }
            });
            return () => unsubscribe();
        }
    }, [isOpen, user]);

    // 7-day modification restriction for CLERK core data
    const canModifyClerk = useMemo(() => {
        if (!user?.createdAt) return false;
        const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
        const accountAge = Date.now() - new Date(user.createdAt).getTime();
        return accountAge >= sevenDaysMs;
    }, [user]);

    if (!isLoaded || !user) return null;

    const handleSavePublic = async () => {
        setIsSaving(true);
        try {
            await update(ref(db, `users/${user.id}/profile`), profileData);
            await update(ref(db, `users/${user.id}`), {
                name: user.fullName || user.username,
                avatar: user.imageUrl,
                username: user.username
            });
            setTimeout(() => setIsSaving(false), 800);
        } catch (err) {
            console.error(err);
            setIsSaving(false);
        }
    };

    const handleCopyUsername = () => {
        const username = user.username || 'selected_legend';
        navigator.clipboard.writeText(username);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleManageAccount = () => {
        if (!canModifyClerk) return;
        const btn = document.querySelector('.cl-userButtonTrigger') as HTMLElement;
        if (btn) {
            onClose();
            btn.click();
        }
    };

    const memberSince = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'New Member';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[50000] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30 }}
                        className="relative w-full max-w-4xl h-full md:h-[85vh] bg-[#080808] md:rounded-[3.5rem] shadow-[0_80px_200px_rgba(0,0,0,1)] border-t md:border border-white/10 flex flex-col overflow-hidden"
                    >
                        <div className="px-8 py-8 md:px-12 flex justify-between items-center border-b border-white/5 bg-black/40 shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-600/20">
                                    <UserCircleIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">Command Center</h2>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Agent ID: {user.username}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-all">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 md:p-6 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto no-scrollbar">
                                <button 
                                    onClick={() => setActiveTab('identity')}
                                    className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'identity' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}
                                >
                                    <CheckCircleIcon className="w-4 h-4" /> Identity
                                </button>
                                <button 
                                    onClick={() => setActiveTab('public')}
                                    className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'public' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}
                                >
                                    <GlobeAltIcon className="w-4 h-4" /> Public Profile
                                </button>
                                <button 
                                    onClick={() => setActiveTab('comms')}
                                    className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'comms' ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-gray-500 hover:bg-white/5'}`}
                                >
                                    <ChatBubbleIcon className="w-4 h-4" /> Comms Gear
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-black/40">
                                <AnimatePresence mode="wait">
                                    {activeTab === 'identity' && (
                                        <motion.div key="id" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 max-w-2xl mx-auto">
                                            <div className="flex flex-col items-center text-center">
                                                <div className="relative mb-8">
                                                    <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border-4 border-red-600/30 p-1 bg-black shadow-2xl">
                                                        <img src={user.imageUrl} className="w-full h-full object-cover rounded-[2rem]" alt="" />
                                                    </div>
                                                    <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-2.5 rounded-xl border-4 border-[#080808]">
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user.fullName || 'FEZ Artist'}</h3>
                                                <button onClick={handleCopyUsername} className="text-red-500 font-black text-xs uppercase tracking-[0.4em] bg-red-600/5 px-6 py-2 rounded-full border border-red-600/20 hover:bg-red-600/10 transition-all">
                                                    @{user.username} {copied ? '• COPIED' : ''}
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Verification Level</p>
                                                    <p className="text-sm font-black text-white uppercase">Selected Legend • Gold</p>
                                                </div>
                                                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                                                    <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Joined Sector</p>
                                                    <p className="text-sm font-black text-white uppercase">{memberSince}</p>
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-white/5">
                                                {canModifyClerk ? (
                                                    <button onClick={handleManageAccount} className="w-full py-6 bg-white text-black font-black uppercase tracking-[0.5em] text-[10px] rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl">Manage Clerk Account</button>
                                                ) : (
                                                    <div className="p-6 bg-red-600/5 border border-red-600/20 rounded-2xl text-center">
                                                        <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Account modification restricted for 7 days post-verification.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'public' && (
                                        <motion.div key="pub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-2xl mx-auto">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Identity Role</label>
                                                <select 
                                                    value={profileData.role} 
                                                    onChange={e => setProfileData({...profileData, role: e.target.value as any})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none transition-all"
                                                >
                                                    <option value="Client">Client (Mission Giver)</option>
                                                    <option value="Designer">Designer (Creative Entity)</option>
                                                    <option value="Editor">VFX Editor (Visual Master)</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Core Profession</label>
                                                    <input 
                                                        value={profileData.profession}
                                                        onChange={e => setProfileData({...profileData, profession: e.target.value})}
                                                        placeholder="e.g. AMV Creator"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Experience Rank</label>
                                                    <input 
                                                        value={profileData.experience}
                                                        onChange={e => setProfileData({...profileData, experience: e.target.value})}
                                                        placeholder="e.g. 4 Years"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Neural Signature (Bio)</label>
                                                <textarea 
                                                    rows={4}
                                                    value={profileData.bio}
                                                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                                                    placeholder="Describe your creative presence..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none resize-none"
                                                />
                                            </div>

                                            <button 
                                                onClick={handleSavePublic}
                                                disabled={isSaving}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isSaving ? <><SparklesIcon className="w-4 h-4 animate-spin" /> Syncing Neural Grid...</> : 'Apply Public Identity'}
                                            </button>
                                        </motion.div>
                                    )}

                                    {activeTab === 'comms' && (
                                        <motion.div key="comm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-2xl mx-auto">
                                            <div className="space-y-4">
                                                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Direct Signal Reception</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Allow other agents to message you privately.</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setProfileData({...profileData, allowMessages: !profileData.allowMessages})}
                                                        className={`w-14 h-8 rounded-full transition-all relative p-1 ${profileData.allowMessages ? 'bg-red-600' : 'bg-gray-800'}`}
                                                    >
                                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${profileData.allowMessages ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                    </button>
                                                </div>

                                                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Online Presence Toggle</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Show your online status on the global grid.</p>
                                                    </div>
                                                    <button 
                                                        onClick={() => setProfileData({...profileData, showOnline: !profileData.showOnline})}
                                                        className={`w-14 h-8 rounded-full transition-all relative p-1 ${profileData.showOnline ? 'bg-red-600' : 'bg-gray-800'}`}
                                                    >
                                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${profileData.showOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="bg-red-600/5 border border-red-600/20 p-8 rounded-[2.5rem] flex items-start gap-4">
                                                <SparklesIcon className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                                                <p className="text-[11px] text-gray-400 font-medium leading-relaxed">
                                                    Your communication settings directly affect how the <span className="text-red-500 font-bold">Neural Preview</span> notifications work for you and other sector agents. 
                                                </p>
                                            </div>

                                            <button 
                                                onClick={handleSavePublic}
                                                disabled={isSaving}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isSaving ? <><SparklesIcon className="w-4 h-4 animate-spin" /> Syncing Gears...</> : 'Save Comms Config'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="p-8 bg-black/40 border-t border-white/5 text-center shrink-0">
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[1em]">Fuad Ahmed • Artist Central Command</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};