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

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

const RECOMMENDED_PROFESSIONS = [
    'VFX Editor', 'Photo Manipulation Artist', 'YouTube Thumbnail Designer', 
    'Logo Designer', 'Motion Graphics Artist', '3D Modeler', 'Video Editor'
];

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

    // Profession Dropdown State
    const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
    const [profSearch, setProfSearch] = useState('');

    const [profileData, setProfileData] = useState({
        role: 'Client',
        profession: '',
        experience: '',
        bio: '',
        allowMessages: true,
        showOnline: true
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && user) {
            const profileRef = ref(db, `users/${user.id}/profile`);
            const unsubscribe = onValue(profileRef, (snap) => {
                const data = snap.val();
                if (data) {
                    setProfileData(prev => ({ ...prev, ...data }));
                    setProfSearch(data.profession || '');
                }
            });
            return () => unsubscribe();
        }
    }, [isOpen, user]);

    const filteredProfessions = useMemo(() => {
        return RECOMMENDED_PROFESSIONS.filter(p => p.toLowerCase().includes(profSearch.toLowerCase()));
    }, [profSearch]);

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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60000] flex items-center justify-center p-0 md:p-6 overflow-hidden">
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
                                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">User Profile</h2>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-[0.3em]">Account Hub</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-all">
                                <CloseIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 md:p-6 flex flex-row md:flex-col gap-2 shrink-0 overflow-x-auto no-scrollbar">
                                <button onClick={() => setActiveTab('identity')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'identity' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><CheckCircleIcon className="w-4 h-4" /> Identity</button>
                                <button onClick={() => setActiveTab('public')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'public' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><GlobeAltIcon className="w-4 h-4" /> Public Profile</button>
                                <button onClick={() => setActiveTab('comms')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'comms' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><ChatBubbleIcon className="w-4 h-4" /> Message Settings</button>
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
                                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user.fullName || 'User'}</h3>
                                                <p className="text-red-500 font-black text-xs uppercase tracking-[0.4em]">@{user.username}</p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {activeTab === 'public' && (
                                        <motion.div key="pub" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-2xl mx-auto">
                                            <div>
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Account Role</label>
                                                <select 
                                                    value={profileData.role} 
                                                    onChange={e => setProfileData({...profileData, role: e.target.value as any})}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none transition-all"
                                                >
                                                    <option value="Client">Client (Seeking Services)</option>
                                                    <option value="Designer">Designer (Creative Professional)</option>
                                                    <option value="Editor">Video Editor (Professional Editor)</option>
                                                </select>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="relative">
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Core Profession</label>
                                                    <input 
                                                        type="text"
                                                        value={profileData.profession}
                                                        onFocus={() => setIsProfDropdownOpen(true)}
                                                        onChange={e => {
                                                            setProfileData({...profileData, profession: e.target.value});
                                                            setProfSearch(e.target.value);
                                                        }}
                                                        placeholder="Search or Type..."
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none"
                                                    />
                                                    <AnimatePresence>
                                                        {isProfDropdownOpen && (
                                                            <motion.div initial={{opacity:0, y:5}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute left-0 right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[200px] overflow-y-auto custom-scrollbar">
                                                                {filteredProfessions.map(p => (
                                                                    <button key={p} type="button" onClick={() => { setProfileData({...profileData, profession: p}); setProfSearch(p); setIsProfDropdownOpen(false); }} className="w-full text-left px-5 py-3 text-xs text-gray-300 hover:bg-red-600 hover:text-white transition-colors border-b border-white/5 last:border-0">{p}</button>
                                                                ))}
                                                                <button type="button" onClick={() => setIsProfDropdownOpen(false)} className="w-full text-center py-2 bg-black text-[8px] text-gray-500 uppercase font-black">Close Selection</button>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Work Experience (Years)</label>
                                                    <input 
                                                        value={profileData.experience}
                                                        onChange={e => setProfileData({...profileData, experience: e.target.value.replace(/[^0-9]/g, '')})}
                                                        placeholder="e.g. 5"
                                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-[0.4em] mb-3 block ml-1">Professional Bio</label>
                                                <textarea 
                                                    rows={4}
                                                    value={profileData.bio}
                                                    onChange={e => setProfileData({...profileData, bio: e.target.value})}
                                                    placeholder="Describe your creative background..."
                                                    className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none resize-none"
                                                />
                                            </div>

                                            <button 
                                                onClick={handleSavePublic}
                                                disabled={isSaving}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isSaving ? <><SparklesIcon className="w-4 h-4 animate-spin" /> Saving Changes...</> : 'Save Public Profile'}
                                            </button>
                                        </motion.div>
                                    )}

                                    {activeTab === 'comms' && (
                                        <motion.div key="comm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8 max-w-2xl mx-auto">
                                            <div className="space-y-4">
                                                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Direct Messaging</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Allow others to message you privately.</p>
                                                    </div>
                                                    <button onClick={() => setProfileData({...profileData, allowMessages: !profileData.allowMessages})} className={`w-14 h-8 rounded-full relative p-1 ${profileData.allowMessages ? 'bg-red-600' : 'bg-gray-800'}`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${profileData.allowMessages ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                    </button>
                                                </div>

                                                <div className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-black text-white uppercase tracking-widest mb-1">Status Visibility</h4>
                                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Show online status to community members.</p>
                                                    </div>
                                                    <button onClick={() => setProfileData({...profileData, showOnline: !profileData.showOnline})} className={`w-14 h-8 rounded-full relative p-1 ${profileData.showOnline ? 'bg-red-600' : 'bg-gray-800'}`}>
                                                        <div className={`w-6 h-6 bg-white rounded-full transition-transform ${profileData.showOnline ? 'translate-x-6' : 'translate-x-0'}`}></div>
                                                    </button>
                                                </div>
                                            </div>

                                            <button 
                                                onClick={handleSavePublic}
                                                disabled={isSaving}
                                                className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.6em] text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                                            >
                                                {isSaving ? <><SparklesIcon className="w-4 h-4 animate-spin" /> Syncing Preferences...</> : 'Save Preferences'}
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>

                        <div className="p-8 bg-black/40 border-t border-white/5 text-center shrink-0">
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-[1em]">Fuad Ahmed • Marketplace Operations</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};