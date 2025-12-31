import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, ChatBubbleIcon } from './Icons';

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
    'VFX Editor', 'Motion Designer', 'YouTuber', 'Photo Artist', 
    'Logo Designer', '3D Modeler', 'Video Editor', 'Graphic Designer', 'Thumbnail Artist'
];

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { user, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<'identity' | 'public' | 'comms'>('identity');
    const [isSaving, setIsSaving] = useState(false);
    const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
    const [profSearch, setProfSearch] = useState('');

    const [profileData, setProfileData] = useState({
        role: 'Client',
        profession: '',
        experience: '',
        bio: '',
        chatPassword: '',
        allowMessages: true,
        showOnline: true,
        hideSocialStats: false
    });

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (user) {
                const profileRef = ref(db, `users/${user.id}/profile`);
                onValue(profileRef, (snap) => {
                    const data = snap.val();
                    if (data) {
                        setProfileData(prev => ({ ...prev, ...data }));
                        setProfSearch(data.profession || '');
                    }
                });
            }
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen, user]);

    if (!isLoaded || !user) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await update(ref(db, `users/${user.id}/profile`), profileData);
            await update(ref(db, `users/${user.id}`), { 
                name: user.fullName || user.username, 
                avatar: user.imageUrl, 
                username: user.username 
            });
            setTimeout(() => setIsSaving(false), 800);
        } catch (err) { setIsSaving(false); }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 md:p-6 overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-xl" />
                    
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 30 }} className="relative w-full max-w-4xl h-full md:h-[85vh] bg-[#080808] md:rounded-[3.5rem] shadow-[0_80px_200px_rgba(0,0,0,1)] border border-white/10 flex flex-col overflow-hidden min-h-0">
                        <div className="px-8 py-8 flex justify-between items-center border-b border-white/5 bg-black/40 flex-shrink-0">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-600/20 flex-shrink-0"><UserCircleIcon className="w-6 h-6 text-red-600" /></div>
                                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white">Profile Control</h2>
                            </div>
                            <button onClick={onClose} className="p-3 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-all active:scale-90"><CloseIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-6 flex flex-row md:flex-col gap-2 flex-shrink-0">
                                <button onClick={() => setActiveTab('identity')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'identity' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><CheckCircleIcon className="w-4 h-4" /> Identity</button>
                                <button onClick={() => setActiveTab('public')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest ${activeTab === 'public' ? 'bg-red-600 text-white shadow-lg' : 'text-gray-500 hover:bg-white/5'}`}><GlobeAltIcon className="w-4 h-4" /> Details</button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 bg-black/40 min-h-0">
                                {activeTab === 'identity' && (
                                    <div className="flex flex-col items-center text-center space-y-8 max-w-2xl mx-auto">
                                        <div className="relative">
                                            <div className="w-40 h-40 rounded-[2.5rem] overflow-hidden border-4 border-red-600/30 p-1 bg-black shadow-2xl"><img src={user.imageUrl} className="w-full h-full object-cover rounded-[2rem]" alt="" /></div>
                                            <div className="absolute -bottom-2 -right-2 bg-red-600 text-white p-3 rounded-xl border-4 border-[#080808]"><CheckCircleIcon className="w-6 h-6" /></div>
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{user.fullName || 'User'}</h3>
                                            <p className="text-red-500 font-black text-sm uppercase tracking-[0.4em]">@{user.username}</p>
                                        </div>
                                        <div className="w-full p-8 bg-white/5 rounded-3xl border border-white/5">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Account Managed via Clerk Security</p>
                                            <p className="text-xs text-white font-medium">{user.primaryEmailAddress?.emailAddress}</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'public' && (
                                    <div className="space-y-8 max-w-2xl mx-auto">
                                        <div>
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block ml-1">Account Role</label>
                                            <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none transition-all shadow-inner">
                                                <option value="Client">Client</option>
                                                <option value="Designer">Designer</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="relative">
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block ml-1">Work Experience (Years)</label>
                                                <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value.replace(/[^0-9]/g, '')})} placeholder="Years of Experience" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none transition-all shadow-inner" />
                                            </div>
                                            <div className="relative">
                                                <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block ml-1">Core Profession</label>
                                                <input type="text" value={profileData.profession} onFocus={() => setIsProfDropdownOpen(true)} onChange={e => { setProfileData({...profileData, profession: e.target.value}); setProfSearch(e.target.value); }} placeholder="Search or Type..." className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none transition-all shadow-inner" />
                                                <AnimatePresence>
                                                    {isProfDropdownOpen && (
                                                        <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0}} className="absolute left-0 right-0 top-full mt-2 bg-[#111] border border-white/10 rounded-xl overflow-hidden z-50 shadow-2xl max-h-[180px] overflow-y-auto custom-scrollbar">
                                                            {RECOMMENDED_PROFESSIONS.filter(p => p.toLowerCase().includes(profSearch.toLowerCase())).map(p => (
                                                                <button key={p} onClick={() => { setProfileData({...profileData, profession: p}); setProfSearch(p); setIsProfDropdownOpen(false); }} className="w-full text-left px-5 py-3 text-xs text-gray-400 hover:bg-red-600 hover:text-white border-b border-white/5 last:border-0">{p}</button>
                                                            ))}
                                                            <button type="button" onClick={() => setIsProfDropdownOpen(false)} className="w-full text-center py-2 bg-black text-[8px] text-gray-500 uppercase font-black">Close</button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block ml-1">Professional Bio</label>
                                            <textarea rows={4} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="Professional summary..." className="w-full bg-white/5 border border-white/10 rounded-3xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none resize-none transition-all shadow-inner" />
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-2xl">
                                            <div>
                                                <h4 className="text-white text-xs font-bold uppercase tracking-widest">Public Social Stats</h4>
                                                <p className="text-[9px] text-gray-500 uppercase font-medium">Show followers/following counts to others</p>
                                            </div>
                                            <button 
                                                onClick={() => setProfileData({...profileData, hideSocialStats: !profileData.hideSocialStats})}
                                                className={`w-12 h-6 rounded-full transition-all relative ${profileData.hideSocialStats ? 'bg-gray-700' : 'bg-red-600'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${profileData.hideSocialStats ? 'left-1' : 'left-7'}`}></div>
                                            </button>
                                        </div>

                                        <div>
                                            <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-3 block ml-1">Chat History Lock (Password)</label>
                                            <input type="password" value={profileData.chatPassword} onChange={e => setProfileData({...profileData, chatPassword: e.target.value})} placeholder="Set password to protect your DMs" className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 px-6 text-sm text-white focus:border-red-600 outline-none transition-all shadow-inner" />
                                        </div>

                                        <button onClick={handleSave} disabled={isSaving} className="w-full py-6 bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
                                            {isSaving ? <><SparklesIcon className="w-4 h-4 animate-spin" /> Syncing...</> : 'Apply Professional Signature'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};