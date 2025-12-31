import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, CopyIcon, InstagramIcon, FacebookIcon, ChevronRightIcon, TikTokIcon, BehanceIcon, GalleryIcon } from './Icons';
import { siteConfig } from '../config';

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

type TabType = 'identity' | 'credentials' | 'networks' | 'posts';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; viewingUserId?: string | null }> = ({ isOpen, onClose, viewingUserId }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>('identity');
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
        facebook: '',
        tiktok: '',
        behance: ''
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
            await push(ref(db, `notifications/${clerkUser.id}`), {
              type: 'profile_update',
              fromId: 'system',
              fromName: 'FEZ Protocol',
              fromAvatar: siteConfig.branding.logoUrl,
              text: `Identity profile synchronized. Credentials updated.`,
              timestamp: Date.now(),
              read: false
            });
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

    const SocialIcon = ({ platform, handle }: { platform: string, handle: string }) => {
        if (!handle) return null;
        let Icon = InstagramIcon;
        let url = "";
        switch (platform) {
            case 'instagram': Icon = InstagramIcon; url = `https://instagram.com/${handle}`; break;
            case 'facebook': Icon = FacebookIcon; url = `https://facebook.com/${handle}`; break;
            case 'tiktok': Icon = TikTokIcon; url = `https://tiktok.com/@${handle}`; break;
            case 'behance': Icon = BehanceIcon; url = `https://behance.net/${handle}`; break;
            case 'twitter': Icon = () => <i className="fa-brands fa-x-twitter text-xl"></i>; url = `https://x.com/${handle}`; break;
        }

        return (
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-6 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-red-600/30 transition-all shadow-lg mb-4">
                <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors shadow-inner">
                        <Icon className="w-8 h-8" />
                    </div>
                    <div>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-1">{platform}</p>
                        <p className="text-white font-black text-lg tracking-tight">@{handle}</p>
                    </div>
                </div>
                <ChevronRightIcon className="w-6 h-6 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
        );
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000000] flex items-center justify-center overflow-hidden">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black backdrop-blur-3xl" />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 50 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 50 }} 
                        className="relative w-full h-full md:w-[96%] md:h-[94%] bg-[#050505] md:rounded-[4rem] shadow-[0_0_120px_rgba(0,0,0,1)] border-none md:border md:border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Integrated Header Bar */}
                        <div className="p-6 md:p-12 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/5 z-20 flex-shrink-0">
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${isOwner ? 'bg-red-600/10 border-red-600/30 shadow-[0_0_30px_rgba(220,38,38,0.2)]' : isAdmin ? 'bg-blue-600/10 border-blue-600/30 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/10'}`}>
                                    <UserCircleIcon className={`w-8 h-8 ${isOwner ? 'text-red-600' : isAdmin ? 'text-blue-600' : 'text-zinc-500'}`} />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none truncate">{isViewingOther ? 'Agent Intelligence' : 'Security Core'}</h2>
                                    <p className="text-[10px] md:text-[11px] text-zinc-500 uppercase font-black tracking-[0.5em] mt-2 truncate">Global Registry • Legend Network</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={copyProfileLink} className="hidden md:flex p-4 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5 shadow-inner"><CopyIcon className="w-6 h-6" /></button>
                                <button onClick={onClose} className="p-4 rounded-full bg-white/5 hover:bg-red-600 text-zinc-400 hover:text-white transition-all border border-white/5 shadow-lg group"><CloseIcon className="w-8 h-8 group-hover:scale-110 transition-transform" /></button>
                            </div>
                        </div>

                        {/* Profile Content Layout */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                            {/* Navigation Sidebar */}
                            <div className="w-full md:w-[320px] bg-black/30 border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-12 flex flex-row md:flex-col gap-5 overflow-x-auto no-scrollbar flex-shrink-0">
                                <button onClick={() => setActiveTab('identity')} className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-5 px-8 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'identity' ? 'bg-red-600 border-red-500 text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <UserCircleIcon className="w-6 h-6" /> <span className="hidden md:inline">IDENTITY</span>
                                </button>
                                <button onClick={() => setActiveTab('credentials')} className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-5 px-8 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'credentials' ? 'bg-red-600 border-red-500 text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <GlobeAltIcon className="w-6 h-6" /> <span className="hidden md:inline">CREDENTIALS</span>
                                </button>
                                <button onClick={() => setActiveTab('networks')} className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-5 px-8 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'networks' ? 'bg-red-600 border-red-500 text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <SparklesIcon className="w-6 h-6" /> <span className="hidden md:inline">NETWORKS</span>
                                </button>
                                <button onClick={() => setActiveTab('posts')} className={`flex-1 md:flex-none flex items-center justify-center md:justify-start gap-5 px-8 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all border ${activeTab === 'posts' ? 'bg-red-600 border-red-500 text-white shadow-[0_20px_40px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <GalleryIcon className="w-6 h-6" /> <span className="hidden md:inline">POSTS</span>
                                </button>
                            </div>

                            {/* Main Scrollable Area */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-24 bg-[#080808] min-h-0">
                                <div className="max-w-5xl mx-auto h-full">
                                    {/* IDENTITY TAB */}
                                    {activeTab === 'identity' && (
                                        <div className="space-y-16 flex flex-col items-center md:items-start">
                                            <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20 w-full">
                                                <div className="relative flex-shrink-0 group">
                                                    <div className={`w-48 h-48 md:w-80 md:h-80 rounded-[4rem] md:rounded-[5.5rem] border-[10px] p-3 transition-all duration-1000 group-hover:rotate-3 ${isOwner ? 'border-red-600 shadow-[0_0_60px_rgba(220,38,38,0.3)]' : isAdmin ? 'border-blue-600 shadow-[0_0_60px_rgba(37,99,235,0.3)]' : 'border-white/10 shadow-2xl'}`}>
                                                        <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-[3.2rem] md:rounded-[4.5rem] shadow-inner" alt="" />
                                                    </div>
                                                    {isImmune && (
                                                        <div className={`absolute -top-4 -right-4 px-8 py-3 rounded-2xl text-[12px] font-black uppercase text-white shadow-2xl tracking-[0.3em] ${isOwner ? 'bg-red-600' : 'bg-blue-600'}`}>
                                                            {isOwner ? 'OWNER' : 'ADMIN'}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center md:text-left space-y-6 flex-1 min-w-0">
                                                    <h3 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none break-words">{isViewingOther ? targetUser?.name : clerkUser.fullName}</h3>
                                                    <p className="text-red-500 font-black text-xl md:text-3xl uppercase tracking-[0.5em] opacity-90 truncate">@{isViewingOther ? targetUser?.username : clerkUser.username}</p>
                                                    <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-6">
                                                         <div className="px-8 py-4 bg-white/5 rounded-2xl border border-white/10 text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em] shadow-inner">NEURAL ID: <span className="text-white">#{isViewingOther ? targetUser?.id?.slice(-8).toUpperCase() : clerkUser.id.slice(-8).toUpperCase()}</span></div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 group transition-all hover:bg-white/[0.08] hover:border-red-600/30 shadow-2xl relative overflow-hidden">
                                                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-6 border-b border-white/5 pb-4">Agent Identification Manifest</p>
                                                    {isViewingOther ? (
                                                      <p className="text-zinc-200 text-xl md:text-2xl italic leading-relaxed break-words">"{profileData.bio || 'Silence is the preferred frequency.'}"</p>
                                                    ) : (
                                                      <textarea rows={5} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-transparent text-white text-xl md:text-2xl outline-none w-full resize-none italic custom-scrollbar" placeholder="Establish your protocol..." />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-8">
                                                    <button onClick={copyProfileLink} className="w-full py-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.5em] hover:bg-red-600 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl group">
                                                        <CopyIcon className="w-7 h-7 group-hover:scale-110 transition-transform" /> {copyFeedback || 'COPY PROFILE FREQUENCY'}
                                                    </button>
                                                    <div className="flex-1 p-10 bg-red-600/10 border border-red-600/20 rounded-[3rem] flex flex-col justify-center text-center shadow-2xl">
                                                        <p className="text-[11px] text-red-500 font-black uppercase tracking-[0.5em] mb-4">Security Clearance</p>
                                                        <p className="text-white font-black text-3xl uppercase tracking-[0.2em] neon-glow-red">Verified</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CREDENTIALS TAB */}
                                    {activeTab === 'credentials' && (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 transition-all hover:border-red-600/40 shadow-xl group">
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-4">Deployment Role</p>
                                                    {isViewingOther ? <p className="text-3xl text-white font-black uppercase tracking-tighter group-hover:text-red-500 transition-colors">{profileData.role}</p> : (
                                                        <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="bg-transparent text-3xl text-white font-black uppercase tracking-tighter outline-none w-full appearance-none cursor-pointer">
                                                            <option value="Client">Client</option>
                                                            <option value="Designer">Designer</option>
                                                            <option value="Editor">Editor</option>
                                                        </select>
                                                    )}
                                                </div>
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 transition-all hover:border-red-600/40 shadow-xl group">
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-4">Core Specialty</p>
                                                    {isViewingOther ? <p className="text-3xl text-white font-black uppercase tracking-tighter group-hover:text-red-500 transition-colors">{profileData.profession || 'Digital Artist'}</p> : (
                                                        <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} placeholder="Designation" className="bg-transparent text-3xl text-white font-black uppercase tracking-tighter outline-none w-full placeholder:text-zinc-800" />
                                                    )}
                                                </div>
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 transition-all hover:border-red-600/40 shadow-xl md:col-span-2 group">
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-4">Operational Experience</p>
                                                    {isViewingOther ? <p className="text-3xl text-white font-black uppercase tracking-tighter group-hover:text-red-500 transition-colors">{profileData.experience || 'Verified Legend'}</p> : (
                                                        <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} placeholder="Years of Mastery" className="bg-transparent text-3xl text-white font-black uppercase tracking-tighter outline-none w-full placeholder:text-zinc-800" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-12 bg-[#0c0c0c] border border-white/5 rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><CheckCircleIcon className="w-32 h-32 text-red-600" /></div>
                                                <h4 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-5">
                                                    <SparklesIcon className="w-8 h-8 text-red-600" /> Audit Synchronized
                                                </h4>
                                                <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl font-medium">This agent's digital footprint and professional capabilities have been verified by FEZ Security Protocols. All project interactions are encrypted and tracked via Legend Registry.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* NETWORKS TAB */}
                                    {activeTab === 'networks' && (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 gap-6">
                                                {isViewingOther ? (
                                                    <div className="flex flex-col justify-center min-h-[400px]">
                                                        <SocialIcon platform="instagram" handle={profileData.instagram} />
                                                        <SocialIcon platform="facebook" handle={profileData.facebook} />
                                                        <SocialIcon platform="tiktok" handle={profileData.tiktok} />
                                                        <SocialIcon platform="behance" handle={profileData.behance} />
                                                        <SocialIcon platform="twitter" handle={profileData.twitter} />
                                                        {Object.values(profileData).every(v => v === '' || typeof v !== 'string') && (
                                                          <div className="text-center py-24 bg-white/5 rounded-[3.5rem] border border-white/10 border-dashed flex flex-col items-center justify-center space-y-6">
                                                            <SparklesIcon className="w-16 h-16 text-zinc-700 opacity-20" />
                                                            <p className="text-zinc-600 font-black uppercase text-sm tracking-[0.6em]">No Active Neural Nodes</p>
                                                          </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-8">
                                                        {['instagram', 'facebook', 'tiktok', 'behance', 'twitter'].map(platform => (
                                                            <div key={platform} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center gap-10 group hover:border-red-600/30 transition-all shadow-inner">
                                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 group-focus-within:text-red-500 transition-colors shadow-inner">
                                                                    {platform === 'instagram' && <InstagramIcon className="w-8 h-8" />}
                                                                    {platform === 'facebook' && <FacebookIcon className="w-8 h-8" />}
                                                                    {platform === 'tiktok' && <TikTokIcon className="w-8 h-8" />}
                                                                    {platform === 'behance' && <BehanceIcon className="w-8 h-8" />}
                                                                    {platform === 'twitter' && <i className="fa-brands fa-x-twitter text-3xl"></i>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-2">{platform} Frequency</p>
                                                                    <input 
                                                                      value={(profileData as any)[platform]} 
                                                                      onChange={e => setProfileData({...profileData, [platform]: e.target.value})} 
                                                                      placeholder={`@username`} 
                                                                      className="bg-transparent text-white font-black text-2xl outline-none w-full placeholder:text-zinc-800" 
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            {isViewingOther && !isImmune && (
                                                <div className="flex flex-col sm:flex-row gap-6 pt-12 border-t border-white/5">
                                                    <button onClick={() => handleAction('follow')} className={`flex-1 py-8 rounded-[2.5rem] text-[14px] font-black uppercase tracking-[0.5em] transition-all shadow-2xl ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                                        {socialState.isFollowing ? 'UNFOLLOW' : 'FOLLOW SIGNAL'}
                                                    </button>
                                                    <button onClick={() => handleAction('friend')} className="flex-1 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-[14px] font-black uppercase tracking-[0.5em] hover:bg-white/10 text-white transition-all">
                                                        {socialState.friendStatus === 'accepted' ? 'NEURAL LINKED' : 'ADD AGENT'}
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* POSTS TAB */}
                                    {activeTab === 'posts' && (
                                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-10">
                                            <div className="relative">
                                                <div className="absolute -inset-16 bg-red-600/10 blur-[100px] rounded-full animate-pulse"></div>
                                                <GalleryIcon className="w-32 h-32 text-red-600 relative z-10 opacity-80" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter">Content Feed</h3>
                                                <p className="text-red-500 font-black text-sm md:text-xl uppercase tracking-[0.8em] animate-pulse">Encryption: Transmitting Soon</p>
                                            </div>
                                            <div className="mt-16 grid grid-cols-3 gap-4 w-full max-w-4xl opacity-5 pointer-events-none">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="aspect-square bg-white/10 rounded-3xl border border-white/10 border-dashed"></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Persistent Save Button for Profile Owner */}
                        {!isViewingOther && (
                            <div className="p-8 md:p-16 bg-black border-t border-white/10 z-20 flex-shrink-0">
                                <button onClick={handleSave} disabled={isSaving} className="w-full max-w-3xl mx-auto block py-8 md:py-10 bg-red-600 text-white font-black uppercase tracking-[0.7em] text-[14px] md:text-[16px] rounded-[3rem] shadow-[0_25px_70px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all">
                                    {isSaving ? 'UPLOADING TO REGISTRY...' : 'COMMIT PROTOCOL UPDATES'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};