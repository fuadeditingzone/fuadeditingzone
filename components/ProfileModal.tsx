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
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-red-600/30 transition-all">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-red-500 transition-colors shadow-inner">
                        <Icon className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-1">{platform}</p>
                        <p className="text-white font-black text-sm tracking-tight">@{handle}</p>
                    </div>
                </div>
                <ChevronRightIcon className="w-5 h-5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
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
                        className="relative w-full h-full md:w-[95%] md:h-[90%] bg-[#050505] md:rounded-[4rem] shadow-[0_0_100px_rgba(0,0,0,1)] border-none md:border md:border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* Custom Header Bar */}
                        <div className="p-6 md:p-10 flex justify-between items-center bg-black/40 backdrop-blur-md border-b border-white/5 z-20">
                            <div className="flex items-center gap-5">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${isOwner ? 'bg-red-600/10 border-red-600/30 shadow-[0_0_20px_rgba(220,38,38,0.2)]' : isAdmin ? 'bg-blue-600/10 border-blue-600/30 shadow-[0_0_20px_rgba(37,99,235,0.2)]' : 'bg-white/5 border-white/10'}`}>
                                    <UserCircleIcon className={`w-7 h-7 ${isOwner ? 'text-red-600' : isAdmin ? 'text-blue-600' : 'text-zinc-500'}`} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter leading-none">{isViewingOther ? 'Public Protocol' : 'Neural Core'}</h2>
                                    <p className="text-[10px] text-zinc-500 uppercase font-black tracking-[0.4em] mt-1.5">Selected Legend Agent Registry</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={copyProfileLink} className="hidden md:flex p-3 rounded-full bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all border border-white/5"><CopyIcon className="w-5 h-5" /></button>
                                <button onClick={onClose} className="p-3 rounded-full hover:bg-red-600 text-zinc-400 hover:text-white transition-all"><CloseIcon className="w-7 h-7" /></button>
                            </div>
                        </div>

                        {/* Layout Content */}
                        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                            {/* Tabs Sidebar */}
                            <div className="w-full md:w-80 bg-black/20 border-b md:border-b-0 md:border-r border-white/5 p-6 md:p-10 flex flex-row md:flex-col gap-4 overflow-x-auto no-scrollbar">
                                <button onClick={() => setActiveTab('identity')} className={`flex-1 md:flex-none flex items-center gap-4 px-6 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab === 'identity' ? 'bg-red-600 border-red-500 text-white shadow-[0_15px_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <UserCircleIcon className="w-5 h-5" /> IDENTITY
                                </button>
                                <button onClick={() => setActiveTab('credentials')} className={`flex-1 md:flex-none flex items-center gap-4 px-6 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab === 'credentials' ? 'bg-red-600 border-red-500 text-white shadow-[0_15px_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <GlobeAltIcon className="w-5 h-5" /> CREDENTIALS
                                </button>
                                <button onClick={() => setActiveTab('networks')} className={`flex-1 md:flex-none flex items-center gap-4 px-6 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab === 'networks' ? 'bg-red-600 border-red-500 text-white shadow-[0_15px_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <SparklesIcon className="w-5 h-5" /> NETWORKS
                                </button>
                                <button onClick={() => setActiveTab('posts')} className={`flex-1 md:flex-none flex items-center gap-4 px-6 py-5 rounded-[1.8rem] text-[11px] font-black uppercase tracking-widest transition-all border ${activeTab === 'posts' ? 'bg-red-600 border-red-500 text-white shadow-[0_15px_30px_rgba(220,38,38,0.3)]' : 'bg-white/5 border-transparent text-zinc-500 hover:bg-white/10'}`}>
                                    <GalleryIcon className="w-5 h-5" /> POSTS
                                </button>
                            </div>

                            {/* Detailed Panels */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-20 bg-[#080808]">
                                {activeTab === 'identity' && (
                                    <div className="max-w-4xl mx-auto space-y-12">
                                        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
                                            <div className="relative group">
                                                <div className={`w-40 h-40 md:w-64 md:h-64 rounded-[3.5rem] md:rounded-[4.5rem] border-8 p-2 transition-transform duration-700 group-hover:scale-105 ${isOwner ? 'border-red-600 neon-glow-red shadow-[0_0_40px_rgba(220,38,38,0.4)]' : isAdmin ? 'border-blue-600 neon-glow-blue shadow-[0_0_40px_rgba(37,99,235,0.4)]' : 'border-white/10'}`}>
                                                    <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-[3rem] md:rounded-[3.8rem]" alt="" />
                                                </div>
                                                {isImmune && (
                                                    <div className={`absolute -top-3 -right-3 px-5 py-2 rounded-xl text-[10px] font-black uppercase text-white shadow-2xl tracking-widest ${isOwner ? 'bg-red-600' : 'bg-blue-600'}`}>
                                                        {isOwner ? 'OWNER' : 'ADMIN'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center md:text-left space-y-4">
                                                <h3 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">{isViewingOther ? targetUser?.name : clerkUser.fullName}</h3>
                                                <p className="text-red-500 font-black text-lg md:text-2xl uppercase tracking-[0.4em] opacity-80">@{isViewingOther ? targetUser?.username : clerkUser.username}</p>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-4">
                                                     <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Protocol ID: <span className="text-white">#{isViewingOther ? targetUser?.id?.slice(-6) : clerkUser.id.slice(-6)}</span></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group transition-all hover:bg-white/[0.07] hover:border-red-600/20">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-4">Transmission Bio</p>
                                                {isViewingOther ? (
                                                  <p className="text-zinc-300 text-lg italic leading-relaxed">"{profileData.bio || 'Silence is the primary signal.'}"</p>
                                                ) : (
                                                  <textarea rows={4} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-transparent text-white text-lg outline-none w-full resize-none italic custom-scrollbar" placeholder="Enter identity manifest..." />
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-6">
                                                <button onClick={copyProfileLink} className="w-full py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.4em] hover:bg-red-600 hover:text-white hover:border-red-500 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl">
                                                    <CopyIcon className="w-5 h-5" /> {copyFeedback || 'COPY IDENTITY LINK'}
                                                </button>
                                                <div className="flex-1 p-8 bg-red-600/5 border border-red-600/10 rounded-[2.5rem] flex flex-col justify-center text-center">
                                                    <p className="text-[9px] text-red-500 font-black uppercase tracking-[0.4em] mb-2">Neural Status</p>
                                                    <p className="text-white font-black text-xl uppercase tracking-widest">Authorized</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'credentials' && (
                                    <div className="max-w-4xl mx-auto space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transition-all hover:border-red-600/30">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-3">Deployment Role</p>
                                                {isViewingOther ? <p className="text-2xl text-white font-black uppercase tracking-tighter">{profileData.role}</p> : (
                                                    <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="bg-transparent text-2xl text-white font-black uppercase tracking-tighter outline-none w-full appearance-none">
                                                        <option value="Client">Client</option>
                                                        <option value="Designer">Designer</option>
                                                        <option value="Editor">Editor</option>
                                                    </select>
                                                )}
                                            </div>
                                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transition-all hover:border-red-600/30">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-3">Mastery Specialty</p>
                                                {isViewingOther ? <p className="text-2xl text-white font-black uppercase tracking-tighter">{profileData.profession || 'Digital Artist'}</p> : (
                                                    <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} placeholder="Mastery Designation" className="bg-transparent text-2xl text-white font-black uppercase tracking-tighter outline-none w-full placeholder:text-zinc-800" />
                                                )}
                                            </div>
                                            <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 transition-all hover:border-red-600/30 md:col-span-2">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-3">Work Experience</p>
                                                {isViewingOther ? <p className="text-2xl text-white font-black uppercase tracking-tighter">{profileData.experience || 'Verified Legend'}</p> : (
                                                    <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} placeholder="Years of Operational Data" className="bg-transparent text-2xl text-white font-black uppercase tracking-tighter outline-none w-full placeholder:text-zinc-800" />
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-10 bg-red-600/10 border border-red-600/20 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-10"><CheckCircleIcon className="w-20 h-20 text-red-600" /></div>
                                            <h4 className="text-xl font-black text-white uppercase tracking-widest mb-3 flex items-center gap-3">
                                                <SparklesIcon className="w-6 h-6 text-red-600" /> Security Verification
                                            </h4>
                                            <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl font-medium">Agent profile has been audited and synchronized with FEZ Global Registry. Identity is protected under Selected Legend protocols.</p>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'networks' && (
                                    <div className="max-w-3xl mx-auto space-y-10">
                                        <div className="grid grid-cols-1 gap-6">
                                            {isViewingOther ? (
                                                <>
                                                    <SocialIcon platform="instagram" handle={profileData.instagram} />
                                                    <SocialIcon platform="facebook" handle={profileData.facebook} />
                                                    <SocialIcon platform="tiktok" handle={profileData.tiktok} />
                                                    <SocialIcon platform="behance" handle={profileData.behance} />
                                                    <SocialIcon platform="twitter" handle={profileData.twitter} />
                                                    {Object.values(profileData).every(v => v === '' || typeof v !== 'string') && (
                                                      <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border border-white/5 border-dashed">
                                                        <SparklesIcon className="w-12 h-12 text-zinc-700 mx-auto mb-4 opacity-20" />
                                                        <p className="text-zinc-600 font-black uppercase text-xs tracking-[0.4em]">No neural frequencies detected.</p>
                                                      </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="space-y-6">
                                                    {['instagram', 'facebook', 'tiktok', 'behance', 'twitter'].map(platform => (
                                                        <div key={platform} className="p-6 bg-white/5 rounded-[2rem] border border-white/5 flex items-center gap-6 group hover:border-red-600/20 transition-all">
                                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 group-focus-within:text-red-500 transition-colors">
                                                                {platform === 'instagram' && <InstagramIcon className="w-7 h-7" />}
                                                                {platform === 'facebook' && <FacebookIcon className="w-7 h-7" />}
                                                                {platform === 'tiktok' && <TikTokIcon className="w-7 h-7" />}
                                                                {platform === 'behance' && <BehanceIcon className="w-7 h-7" />}
                                                                {platform === 'twitter' && <i className="fa-brands fa-x-twitter text-2xl"></i>}
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-1.5">{platform} Protocol</p>
                                                                <input 
                                                                  value={(profileData as any)[platform]} 
                                                                  onChange={e => setProfileData({...profileData, [platform]: e.target.value})} 
                                                                  placeholder={`@username`} 
                                                                  className="bg-transparent text-white font-black text-lg outline-none w-full placeholder:text-zinc-800" 
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {isViewingOther && !isImmune && (
                                            <div className="flex gap-6 pt-10 border-t border-white/5">
                                                <button onClick={() => handleAction('follow')} className={`flex-1 py-6 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] transition-all shadow-2xl ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                                    {socialState.isFollowing ? 'UNFOLLOW' : 'FOLLOW SIGNAL'}
                                                </button>
                                                <button onClick={() => handleAction('friend')} className="flex-1 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.4em] hover:bg-white/10 text-white transition-all">
                                                    {socialState.friendStatus === 'accepted' ? 'NEURAL LINKED' : 'ADD FRIEND'}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'posts' && (
                                    <div className="max-w-6xl mx-auto h-full flex flex-col items-center justify-center text-center">
                                        <div className="relative mb-10">
                                            <div className="absolute -inset-10 bg-red-600/10 blur-[80px] rounded-full animate-pulse"></div>
                                            <SparklesIcon className="w-24 h-24 text-red-600 relative z-10" />
                                        </div>
                                        <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">Content Feed</h3>
                                        <p className="text-red-500 font-black text-sm md:text-lg uppercase tracking-[0.6em] animate-pulse">Posting & Uploading Coming Soon</p>
                                        <div className="mt-16 grid grid-cols-3 gap-2 w-full opacity-10">
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="aspect-square bg-white/10 rounded-2xl border border-white/5 border-dashed"></div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Save Trigger for Profile Owner */}
                        {!isViewingOther && (
                            <div className="p-8 md:p-12 bg-black border-t border-white/10 z-20">
                                <button onClick={handleSave} disabled={isSaving} className="w-full max-w-2xl mx-auto block py-6 md:py-8 bg-red-600 text-white font-black uppercase tracking-[0.6em] text-[12px] md:text-[14px] rounded-[2rem] shadow-[0_20px_60px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all">
                                    {isSaving ? 'SYNCHRONIZING...' : 'COMMIT PROTOCOL UPDATES'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};