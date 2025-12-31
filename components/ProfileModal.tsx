import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
// Added ChevronRightIcon to imports
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, CopyIcon, InstagramIcon, FacebookIcon, ChevronRightIcon } from './Icons';

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

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; viewingUserId?: string | null }> = ({ isOpen, onClose, viewingUserId }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<'identity' | 'public' | 'social'>('identity');
    const [isSaving, setIsSaving] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [socialState, setSocialState] = useState({ isFollowing: false, friendStatus: 'none' });

    const [profileData, setProfileData] = useState({
        role: 'Client',
        profession: '',
        experience: '',
        bio: '',
        instagram: '',
        twitter: '',
        facebook: ''
    });

    const isViewingOther = !!viewingUserId && viewingUserId !== clerkUser?.id;

    useEffect(() => {
        if (isOpen) {
            const loadId = viewingUserId || clerkUser?.id;
            if (loadId) {
                onValue(ref(db, `users/${loadId}`), (snap) => {
                    const data = snap.val();
                    if (data) {
                        setTargetUser(data);
                        if (data.profile) setProfileData(prev => ({ ...prev, ...data.profile }));
                    }
                });
            }
        }
    }, [isOpen, viewingUserId, clerkUser]);

    useEffect(() => {
        if (!isViewingOther || !clerkUser || !viewingUserId) return;
        const followRef = ref(db, `social/${clerkUser.id}/following/${viewingUserId}`);
        const friendRef = ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`);
        
        onValue(followRef, (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
        onValue(friendRef, (snap) => {
            if (snap.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'accepted' }));
            else setSocialState(prev => ({ ...prev, friendStatus: 'none' }));
        });
    }, [isViewingOther, clerkUser, viewingUserId]);

    const handleAction = async (type: 'follow' | 'friend') => {
        if (!clerkUser || !viewingUserId) return;
        const path = type === 'follow' ? `social/${clerkUser.id}/following/${viewingUserId}` : `social/${clerkUser.id}/requests/sent/${viewingUserId}`;
        await set(ref(db, path), { timestamp: Date.now() });
        if (type === 'friend') setSocialState(prev => ({ ...prev, friendStatus: 'requested' }));
    };

    const copyProfileLink = () => {
        const handle = targetUser?.username || clerkUser?.username;
        if (handle) {
            const fullUrl = `https://fuadeditingzone.pages.dev/@${handle}`;
            navigator.clipboard.writeText(fullUrl);
            setCopyFeedback("Link Copied!");
            setTimeout(() => setCopyFeedback(null), 2000);
        }
    };

    const handleSave = async () => {
        if (!clerkUser) return;
        setIsSaving(true);
        try {
            await update(ref(db, `users/${clerkUser.id}/profile`), profileData);
            setCopyFeedback("Credentials Updated!");
            setTimeout(() => {
                setCopyFeedback(null);
                setIsSaving(false);
            }, 1500);
        } catch (e) { setIsSaving(false); }
    };

    const isOwner = targetUser?.username === OWNER_HANDLE || (!isViewingOther && clerkUser?.username === OWNER_HANDLE);
    const isAdmin = targetUser?.username === ADMIN_HANDLE || (!isViewingOther && clerkUser?.username === ADMIN_HANDLE);
    const isImmune = isOwner || isAdmin;

    if (!isLoaded || !clerkUser) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000000] flex items-center justify-center p-4 overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-2xl" />
                    <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-4xl h-fit max-h-[85vh] bg-[#0a0a0a] rounded-[2.5rem] shadow-2xl border border-white/10 flex flex-col overflow-hidden">
                        
                        <div className="p-6 md:p-8 flex justify-between items-center border-b border-white/5 bg-black flex-shrink-0">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${isOwner ? 'bg-red-600/10 border-red-600/30' : isAdmin ? 'bg-blue-600/10 border-blue-600/30' : 'bg-white/5 border-white/10'}`}>
                                    <UserCircleIcon className={`w-6 h-6 ${isOwner ? 'text-red-600' : isAdmin ? 'text-blue-600' : 'text-zinc-500'}`} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white uppercase tracking-tighter">{isViewingOther ? 'Agent View' : 'Identity Hub'}</h2>
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">FEZ Agent Network</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-red-600 text-zinc-500 hover:text-white transition-all"><CloseIcon className="w-6 h-6" /></button>
                        </div>

                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/5 bg-black/40 p-4 md:p-6 flex flex-row md:flex-col gap-2.5 flex-shrink-0 overflow-x-auto no-scrollbar">
                                <button onClick={() => setActiveTab('identity')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'identity' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}><UserCircleIcon className="w-4 h-4" /> Identity</button>
                                <button onClick={() => setActiveTab('public')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'public' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}><GlobeAltIcon className="w-4 h-4" /> Credentials</button>
                                <button onClick={() => setActiveTab('social')} className={`flex-1 md:flex-none flex items-center gap-3 px-5 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${activeTab === 'social' ? 'bg-red-600 border-red-500 text-white shadow-lg' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}><SparklesIcon className="w-4 h-4" /> Networks</button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 space-y-8 bg-[#080808]">
                                {activeTab === 'identity' && (
                                    <div className="flex flex-col items-center text-center space-y-6">
                                        <div className="relative">
                                            <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 p-1.5 ${isOwner ? 'border-red-600 neon-glow-red shadow-[0_0_30px_rgba(220,38,38,0.4)]' : isAdmin ? 'border-blue-600 neon-glow-blue shadow-[0_0_30px_rgba(37,99,235,0.4)]' : 'border-white/10'}`}>
                                                <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2rem]" alt="" />
                                            </div>
                                            {isImmune && (
                                                <div className={`absolute -top-2 -right-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase text-white shadow-xl ${isOwner ? 'bg-red-600' : 'bg-blue-600'}`}>
                                                    {isOwner ? 'Owner' : 'Admin'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">{isViewingOther ? targetUser?.name : clerkUser.fullName}</h3>
                                            <p className="text-red-500 font-black text-xs md:text-sm uppercase tracking-[0.4em]">@{isViewingOther ? targetUser?.username : clerkUser.username}</p>
                                        </div>
                                        <div className="w-full flex flex-col gap-4">
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 text-left">
                                                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Agent Manifest</p>
                                                <p className="text-zinc-300 text-sm italic">"{profileData.bio || 'Silence is a statement.'}"</p>
                                            </div>
                                            <button onClick={copyProfileLink} className="w-full py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2">
                                                <CopyIcon className="w-4 h-4" /> {copyFeedback || 'Copy Profile Link'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'public' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Class Role</p>
                                                {isViewingOther ? <p className="text-white font-bold">{profileData.role}</p> : (
                                                    <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="bg-transparent text-white font-bold outline-none w-full appearance-none">
                                                        <option value="Client">Client</option>
                                                        <option value="Designer">Designer</option>
                                                        <option value="Editor">Editor</option>
                                                    </select>
                                                )}
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Specialty</p>
                                                {isViewingOther ? <p className="text-white font-bold">{profileData.profession || 'Digital Artist'}</p> : (
                                                    <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} placeholder="Mastery Title" className="bg-transparent text-white font-bold outline-none w-full" />
                                                )}
                                            </div>
                                            <div className="p-5 bg-white/5 rounded-2xl border border-white/5 md:col-span-2">
                                                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Work Experience</p>
                                                {isViewingOther ? <p className="text-white font-bold">{profileData.experience || 'Verified'}</p> : (
                                                    <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} placeholder="Years of Mastery" className="bg-transparent text-white font-bold outline-none w-full" />
                                                )}
                                            </div>
                                        </div>
                                        {!isViewingOther && <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                                            <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">Status Transmission (Bio)</p>
                                            <textarea rows={3} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-transparent text-zinc-300 text-sm outline-none w-full resize-none italic" placeholder="Establish your protocol..." />
                                        </div>}
                                    </div>
                                )}

                                {activeTab === 'social' && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 gap-4">
                                            {/* Social Links Appearance */}
                                            {['instagram', 'twitter', 'facebook'].map(platform => {
                                                const handle = profileData[platform as keyof typeof profileData];
                                                if (isViewingOther && !handle) return null;
                                                return (
                                                    <div key={platform} className="p-5 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors">
                                                                {platform === 'instagram' ? <InstagramIcon className="w-5 h-5" /> : platform === 'facebook' ? <FacebookIcon className="w-5 h-5" /> : <i className="fa-brands fa-x-twitter text-xl"></i>}
                                                            </div>
                                                            <div>
                                                                <p className="text-[8px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-0.5">{platform}</p>
                                                                {isViewingOther ? <p className="text-white font-bold">@{handle}</p> : (
                                                                    <input value={handle} onChange={e => setProfileData({...profileData, [platform]: e.target.value})} placeholder="Handle" className="bg-transparent text-white font-bold outline-none" />
                                                                )}
                                                            </div>
                                                        </div>
                                                        {handle && (
                                                            <a href={platform === 'instagram' ? `https://instagram.com/${handle}` : platform === 'facebook' ? `https://facebook.com/${handle}` : `https://x.com/${handle}`} target="_blank" className="text-red-500 hover:text-red-400 p-2"><ChevronRightIcon className="w-4 h-4" /></a>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {isViewingOther && !isImmune && (
                                            <div className="flex gap-4 pt-4 border-t border-white/5">
                                                <button onClick={() => handleAction('follow')} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-lg hover:bg-red-700'}`}>
                                                    {socialState.isFollowing ? 'Unfollow' : 'Follow'}
                                                </button>
                                                <button onClick={() => handleAction('friend')} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 text-white transition-all">
                                                    {socialState.friendStatus === 'accepted' ? 'Linked' : 'Add Friend'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {!isViewingOther && (
                            <div className="p-6 bg-black border-t border-white/10 flex-shrink-0">
                                <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-xl shadow-xl hover:bg-red-700 active:scale-95 transition-all">
                                    {isSaving ? 'Establishing Protocol...' : 'Update Agent Credentials'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
