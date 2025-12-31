import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, ChatBubbleIcon, CopyIcon } from './Icons';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};

if (!getApps().length) initializeApp(firebaseConfig);
const db = getDatabase();

const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

const RECOMMENDED_PROFESSIONS = [
    'VFX Editor', 'Motion Designer', 'YouTuber', 'Photo Artist', 
    'Logo Designer', '3D Modeler', 'Video Editor', 'Graphic Designer', 'Thumbnail Artist'
];

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; viewingUserId?: string | null }> = ({ isOpen, onClose, viewingUserId }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<'identity' | 'public' | 'social'>('identity');
    const [isSaving, setIsSaving] = useState(false);
    const [isProfDropdownOpen, setIsProfDropdownOpen] = useState(false);
    const [profSearch, setProfSearch] = useState('');
    const [copyFeedback, setCopyFeedback] = useState(false);
    const [targetUser, setTargetUser] = useState<any>(null);

    const [profileData, setProfileData] = useState({
        role: 'Client',
        profession: '',
        experience: '',
        bio: '',
        chatPassword: '',
        allowMessages: true,
        showOnline: true,
        hideSocialStats: false,
        instagram: '',
        twitter: '',
        facebook: ''
    });

    const isViewingOther = !!viewingUserId && viewingUserId !== clerkUser?.id;

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            const loadId = viewingUserId || clerkUser?.id;
            if (loadId) {
                onValue(ref(db, `users/${loadId}`), (snap) => {
                    const data = snap.val();
                    if (data) {
                        setTargetUser(data);
                        if (data.profile) {
                            setProfileData(prev => ({ ...prev, ...data.profile }));
                            setProfSearch(data.profile.profession || '');
                        }
                    }
                });
            }
        } else {
            document.body.style.overflow = 'unset';
            setTargetUser(null);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, viewingUserId, clerkUser]);

    if (!isLoaded || !clerkUser) return null;

    const handleSave = async () => {
        if (isViewingOther) return;
        setIsSaving(true);
        try {
            await update(ref(db, `users/${clerkUser.id}/profile`), profileData);
            await update(ref(db, `users/${clerkUser.id}`), { 
                name: clerkUser.fullName || clerkUser.username, 
                avatar: clerkUser.imageUrl, 
                username: clerkUser.username 
            });
            setTimeout(() => setIsSaving(false), 800);
        } catch (err) { setIsSaving(false); }
    };

    const copyUsername = () => {
        const uname = targetUser?.username || clerkUser?.username;
        if (uname) {
            navigator.clipboard.writeText(uname);
            setCopyFeedback(true);
            setTimeout(() => setCopyFeedback(false), 2000);
        }
    };

    const isOwner = targetUser?.username === OWNER_HANDLE || (!isViewingOther && clerkUser.username === OWNER_HANDLE);
    const isAdmin = targetUser?.username === ADMIN_HANDLE || (!isViewingOther && clerkUser.username === ADMIN_HANDLE);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 md:p-10 overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-4xl h-fit max-h-[90dvh] bg-[#080808] rounded-[2.5rem] md:rounded-[3.5rem] shadow-[0_50px_150px_rgba(0,0,0,1)] border border-white/10 flex flex-col overflow-hidden">
                        
                        <div className="px-6 py-6 md:px-8 md:py-8 flex justify-between items-center border-b border-white/5 bg-black/40 flex-shrink-0">
                            <div className="flex items-center gap-4 md:gap-5">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-red-600/10 flex items-center justify-center border border-red-600/20 flex-shrink-0"><i className="fa-solid fa-user-gear text-lg md:text-xl text-red-600"></i></div>
                                <div>
                                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-tighter text-white leading-none">{isViewingOther ? 'Agent Signal' : 'My Terminal'}</h2>
                                    <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-bold tracking-[0.3em] mt-1.5 md:mt-2">Identity Matrix</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-red-600 text-gray-400 hover:text-white transition-all active:scale-90"><CloseIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                            {!isViewingOther && (
                                <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/20 p-4 md:p-6 flex flex-row md:flex-col gap-2.5 flex-shrink-0 overflow-x-auto no-scrollbar">
                                    <button onClick={() => setActiveTab('identity')} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'identity' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}><UserCircleIcon className="w-4 h-4" /> Identity</button>
                                    <button onClick={() => setActiveTab('public')} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'public' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}><GlobeAltIcon className="w-4 h-4" /> Credentials</button>
                                    <button onClick={() => setActiveTab('social')} className={`flex-1 md:flex-none flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4 rounded-2xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'social' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'}`}><i className="fa-solid fa-share-nodes w-4"></i> Networks</button>
                                </div>
                            )}

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-12 bg-black/40 min-h-0">
                                <div className="flex flex-col items-center text-center space-y-8 md:space-y-10 max-w-2xl mx-auto animate-fade-in">
                                    <div className="relative group">
                                        <div className={`absolute -inset-4 blur-2xl rounded-full opacity-30 ${isOwner ? 'bg-red-600' : isAdmin ? 'bg-blue-600' : 'bg-red-600/10'}`}></div>
                                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] md:rounded-[3rem] overflow-hidden border-4 p-1.5 bg-black shadow-2xl relative flex-shrink-0 ${isOwner ? 'border-red-600 neon-glow-red' : isAdmin ? 'border-blue-600 neon-glow-blue' : 'border-red-600/30'}`}>
                                            <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2.2rem] md:rounded-[2.5rem]" alt="" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 bg-red-600 text-white p-2 md:p-3 rounded-xl border-4 border-[#080808] shadow-2xl"><CheckCircleIcon className="w-4 h-4 md:w-6 md:h-6" /></div>
                                    </div>
                                    <div className="w-full">
                                        <h3 className="text-2xl md:text-5xl font-black text-white uppercase tracking-tighter mb-2 break-words leading-tight">{isViewingOther ? targetUser?.name : (clerkUser.fullName || 'Verified User')}</h3>
                                        <div className="flex items-center justify-center gap-3">
                                            <p className={`font-black text-xs md:text-base uppercase tracking-[0.4em] md:tracking-[0.5em] ${isOwner ? 'text-red-500' : isAdmin ? 'text-blue-500' : 'text-red-500'} opacity-80`}>@{isViewingOther ? targetUser?.username : clerkUser.username}</p>
                                            <button onClick={copyUsername} className="p-2 bg-white/5 rounded-lg hover:bg-red-600 text-gray-400 hover:text-white transition-all"><CopyIcon className="w-4 h-4" /></button>
                                        </div>
                                        {copyFeedback && <p className="text-[9px] text-green-500 font-bold uppercase mt-2 animate-pulse">Copied to Clipboard</p>}
                                    </div>

                                    {(activeTab === 'identity' || isViewingOther) && (
                                        <div className="w-full space-y-6">
                                            {profileData.bio && (
                                                <div className="p-6 bg-white/5 rounded-3xl border border-white/5 text-left italic text-gray-300 text-sm">
                                                    "{profileData.bio}"
                                                </div>
                                            )}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5 text-left group hover:border-red-600/20 transition-all">
                                                    <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 md:mb-2">Specialty</p>
                                                    <p className="text-[11px] md:text-sm text-white font-bold truncate">{profileData.profession || 'Creative Agent'}</p>
                                                </div>
                                                <div className="p-4 md:p-6 bg-white/5 rounded-2xl md:rounded-3xl border border-white/5 text-left group hover:border-red-600/20 transition-all">
                                                    <p className="text-[8px] md:text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1 md:mb-2">Experience</p>
                                                    <p className="text-[11px] md:text-sm text-white font-bold truncate">{profileData.experience ? `${profileData.experience} Years` : 'Classified'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!isViewingOther && activeTab === 'public' && (
                                        <div className="w-full space-y-6 text-left">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Identity Class</label>
                                                    <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value as any})} className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 px-5 md:px-6 text-[12px] md:text-sm text-white focus:border-red-600 outline-none transition-all appearance-none">
                                                        <option value="Client">Client</option>
                                                        <option value="Designer">Designer</option>
                                                        <option value="Editor">Editor</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Work Experience</label>
                                                    <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value.replace(/[^0-9]/g, '')})} placeholder="Mastery Years" className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 px-5 md:px-6 text-[12px] md:text-sm text-white focus:border-red-600 outline-none transition-all shadow-inner" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Bio</label>
                                                <textarea rows={3} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} placeholder="Establish your presence..." className="w-full bg-white/5 border border-white/10 rounded-2xl md:rounded-3xl py-4 md:py-5 px-5 md:px-6 text-[12px] md:text-sm text-white focus:border-red-600 outline-none resize-none transition-all shadow-inner" />
                                            </div>
                                        </div>
                                    )}

                                    {!isViewingOther && activeTab === 'social' && (
                                        <div className="w-full space-y-5 text-left">
                                            <div className="space-y-2">
                                                <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">Instagram</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-red-600 font-black">@</span>
                                                    <input value={profileData.instagram} onChange={e => setProfileData({...profileData, instagram: e.target.value})} placeholder="Handle" className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-10 md:pl-12 pr-5 md:pr-6 text-[12px] md:text-sm text-white focus:border-red-600 outline-none" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[9px] md:text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-1">X / Twitter</label>
                                                <div className="relative">
                                                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-red-600 font-black">@</span>
                                                    <input value={profileData.twitter} onChange={e => setProfileData({...profileData, twitter: e.target.value})} placeholder="Handle" className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-4 md:py-5 pl-10 md:pl-12 pr-5 md:pr-6 text-[12px] md:text-sm text-white focus:border-red-600 outline-none" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {!isViewingOther && (
                            <div className="p-6 md:p-8 bg-black border-t border-white/10 flex-shrink-0">
                                <button onClick={(e) => { e.stopPropagation(); handleSave(); }} disabled={isSaving} className="w-full py-4 md:py-6 bg-red-600 text-white font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-[9px] md:text-[11px] rounded-xl md:rounded-2xl shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 md:gap-4 hover:bg-red-700 disabled:opacity-50">
                                    {isSaving ? <><SparklesIcon className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> Neural Syncing...</> : 'Establish Identity Signature'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};