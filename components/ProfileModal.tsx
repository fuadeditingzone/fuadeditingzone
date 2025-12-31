import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, CopyIcon, InstagramIcon, FacebookIcon, ChevronRightIcon, TikTokIcon, BehanceIcon, GalleryIcon, ChevronLeftIcon } from './Icons';
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
    const [socialState, setSocialState] = useState({ isFollowing: false, friendStatus: 'none', followers: 0, following: 0 });

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
                
                // Fetch stats
                onValue(ref(db, `social/${loadId}/followers`), (snap) => {
                    setSocialState(prev => ({ ...prev, followers: Object.keys(snap.val() || {}).length }));
                });
                onValue(ref(db, `social/${loadId}/following`), (snap) => {
                    setSocialState(prev => ({ ...prev, following: Object.keys(snap.val() || {}).length }));
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
            <a href={url} target="_blank" rel="noopener noreferrer" className="p-6 bg-white/5 border border-white/5 rounded-[1.5rem] flex items-center justify-between group hover:border-red-600/30 transition-all shadow-xl mb-4">
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
                        className="relative w-full h-full md:w-[98%] md:h-[96%] bg-[#050505] md:rounded-[4rem] shadow-[0_0_120px_rgba(0,0,0,1)] border-none md:border md:border-white/10 flex flex-col overflow-hidden"
                    >
                        {/* HEADER: INSTAGRAM STYLE */}
                        <div className="p-6 md:px-20 md:py-10 flex items-center bg-black/40 backdrop-blur-md border-b border-white/5 z-20 flex-shrink-0">
                            <button onClick={onClose} className="mr-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all">
                                <ChevronLeftIcon className="w-7 h-7" />
                            </button>
                            <div className="flex-1 truncate">
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight truncate">
                                    {isViewingOther ? (targetUser?.username || 'Profile') : (clerkUser.username || 'My Profile')}
                                </h2>
                            </div>
                            <div className="flex items-center gap-4">
                                <button onClick={copyProfileLink} className="p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-all"><CopyIcon className="w-6 h-6" /></button>
                                <button onClick={onClose} className="p-3 rounded-full bg-white/5 hover:bg-red-600 text-white transition-all"><CloseIcon className="w-6 h-6" /></button>
                            </div>
                        </div>

                        {/* PROFILE TOP SECTION */}
                        <div className="flex-shrink-0 bg-[#080808] p-8 md:px-24 md:py-16 border-b border-white/5">
                            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-20">
                                <div className="relative group">
                                    <div className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 p-1.5 transition-all duration-700 ${isOwner ? 'border-red-600' : isAdmin ? 'border-blue-600' : 'border-white/10'}`}>
                                        <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-full" alt="" />
                                    </div>
                                    {isImmune && (
                                        <div className={`absolute -top-1 -right-1 px-3 py-1 rounded-lg text-[8px] font-black uppercase text-white shadow-xl ${isOwner ? 'bg-red-600' : 'bg-blue-600'}`}>
                                            {isOwner ? 'Owner' : 'Admin'}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-6">
                                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                                        <h3 className="text-3xl md:text-4xl font-light text-white lowercase tracking-tight">
                                            {isViewingOther ? targetUser?.username : clerkUser.username}
                                        </h3>
                                        <div className="flex gap-2">
                                            {isViewingOther ? (
                                                <>
                                                    <button onClick={() => handleAction('follow')} className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl hover:bg-red-700'}`}>
                                                        {socialState.isFollowing ? 'Following' : 'Follow'}
                                                    </button>
                                                    <button className="px-8 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all">Message</button>
                                                </>
                                            ) : (
                                                <button onClick={() => setActiveTab('identity')} className="px-8 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase tracking-widest text-white transition-all">Edit Profile</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center md:justify-start gap-10 md:gap-16">
                                        <div className="text-center md:text-left">
                                            <p className="text-xl font-black text-white">0</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Posts</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-xl font-black text-white">{socialState.followers}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Followers</p>
                                        </div>
                                        <div className="text-center md:text-left">
                                            <p className="text-xl font-black text-white">{socialState.following}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Following</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <p className="text-lg font-black text-white">{isViewingOther ? targetUser?.name : clerkUser.fullName}</p>
                                        <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest">{profileData.role} • {profileData.profession || 'Creative Enthusiast'}</p>
                                        <p className="text-zinc-300 text-sm leading-relaxed max-w-lg font-medium">{profileData.bio || 'This agent has not broadcasted a bio yet.'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* TAB NAVIGATION: INSTAGRAM STYLE */}
                        <div className="flex-1 flex flex-col overflow-hidden bg-black">
                            <div className="flex justify-center border-b border-white/5 bg-black/40">
                                {(['identity', 'credentials', 'networks', 'posts'] as TabType[]).map(tab => (
                                    <button 
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-8 md:px-12 py-5 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}`}
                                    >
                                        {tab}
                                        {activeTab === tab && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
                                    </button>
                                ))}
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-10 md:p-24">
                                <div className="max-w-5xl mx-auto">
                                    {/* IDENTITY & BIO EDITING */}
                                    {activeTab === 'identity' && (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 shadow-2xl">
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-6 border-b border-white/5 pb-4">Agent Manifest</p>
                                                    {isViewingOther ? (
                                                      <p className="text-zinc-200 text-xl italic leading-relaxed break-words">"{profileData.bio || 'Silence is the preferred frequency.'}"</p>
                                                    ) : (
                                                      <textarea rows={5} value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-transparent text-white text-xl outline-none w-full resize-none italic custom-scrollbar" placeholder="Establish your protocol..." />
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-8 justify-center">
                                                     <div className="p-10 bg-red-600/10 border border-red-600/20 rounded-[3rem] text-center">
                                                        <p className="text-[11px] text-red-500 font-black uppercase tracking-[0.5em] mb-2">Protocol Access</p>
                                                        <p className="text-white font-black text-3xl uppercase">Verified</p>
                                                     </div>
                                                     <button onClick={copyProfileLink} className="w-full py-8 bg-white/5 border border-white/10 rounded-[2.5rem] text-[12px] font-black uppercase tracking-[0.5em] hover:bg-red-600 transition-all flex items-center justify-center gap-4">
                                                        <CopyIcon className="w-6 h-6" /> {copyFeedback || 'Copy Profile Link'}
                                                     </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* CREDENTIALS */}
                                    {activeTab === 'credentials' && (
                                        <div className="space-y-12">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 shadow-xl group">
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-4">Deployment Role</p>
                                                    {isViewingOther ? <p className="text-3xl text-white font-black uppercase">{profileData.role}</p> : (
                                                        <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="bg-transparent text-3xl text-white font-black uppercase outline-none w-full appearance-none cursor-pointer">
                                                            <option value="Client">Client</option>
                                                            <option value="Designer">Designer</option>
                                                            <option value="Editor">Editor</option>
                                                        </select>
                                                    )}
                                                </div>
                                                <div className="p-10 bg-white/5 rounded-[3rem] border border-white/10 shadow-xl group">
                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-4">Core Specialty</p>
                                                    {isViewingOther ? <p className="text-3xl text-white font-black uppercase">{profileData.profession || 'Generalist'}</p> : (
                                                        <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} placeholder="Mastery Designation" className="bg-transparent text-3xl text-white font-black uppercase outline-none w-full" />
                                                    )}
                                                </div>
                                            </div>
                                            <div className="p-12 bg-[#0c0c0c] border border-white/5 rounded-[4rem] text-center relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-12 opacity-5"><CheckCircleIcon className="w-32 h-32 text-red-600" /></div>
                                                <h4 className="text-2xl font-black text-white uppercase tracking-[0.2em] mb-6">Credential Status</h4>
                                                <p className="text-zinc-400 text-lg leading-relaxed max-w-3xl mx-auto font-medium">Synchronized with Legend Registry. Digital footprint audited by FEZ Protocol.</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* NETWORKS */}
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
                                                            <p className="text-zinc-600 font-black uppercase text-sm tracking-[0.6em]">No Frequencies Detected</p>
                                                          </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="space-y-8">
                                                        {['instagram', 'facebook', 'tiktok', 'behance', 'twitter'].map(platform => (
                                                            <div key={platform} className="p-8 bg-white/5 rounded-[2.5rem] border border-white/10 flex items-center gap-10 group hover:border-red-600/30 transition-all shadow-inner">
                                                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-zinc-600 group-focus-within:text-red-500 transition-colors">
                                                                    {platform === 'instagram' && <InstagramIcon className="w-8 h-8" />}
                                                                    {platform === 'facebook' && <FacebookIcon className="w-8 h-8" />}
                                                                    {platform === 'tiktok' && <TikTokIcon className="w-8 h-8" />}
                                                                    {platform === 'behance' && <BehanceIcon className="w-8 h-8" />}
                                                                    {platform === 'twitter' && <i className="fa-brands fa-x-twitter text-3xl"></i>}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.5em] mb-2">{platform} Frequency</p>
                                                                    <input value={(profileData as any)[platform]} onChange={e => setProfileData({...profileData, [platform]: e.target.value})} placeholder={`@username`} className="bg-transparent text-white font-black text-2xl outline-none w-full" />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* POSTS */}
                                    {activeTab === 'posts' && (
                                        <div className="flex flex-col items-center justify-center text-center py-20">
                                            <div className="relative mb-12">
                                                <div className="absolute -inset-16 bg-red-600/10 blur-[100px] rounded-full animate-pulse"></div>
                                                <GalleryIcon className="w-32 h-32 text-red-600 relative z-10 opacity-80" />
                                            </div>
                                            <h3 className="text-5xl font-black text-white uppercase tracking-tighter mb-4">Content Feed</h3>
                                            <p className="text-red-500 font-black text-lg uppercase tracking-[0.8em] animate-pulse">Available Soon</p>
                                            <div className="mt-20 grid grid-cols-3 gap-6 w-full max-w-4xl opacity-5 pointer-events-none">
                                                {[...Array(6)].map((_, i) => (
                                                    <div key={i} className="aspect-square bg-white/10 rounded-3xl border border-white/10 border-dashed"></div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* PERSISTENT SAVE TRIGGER */}
                        {!isViewingOther && (
                            <div className="p-8 md:p-12 bg-black border-t border-white/10 z-20 flex-shrink-0">
                                <button onClick={handleSave} disabled={isSaving} className="w-full max-w-3xl mx-auto block py-8 bg-red-600 text-white font-black uppercase tracking-[0.7em] text-sm rounded-[3rem] shadow-[0_25px_70px_rgba(220,38,38,0.4)] hover:bg-red-700 active:scale-95 transition-all">
                                    {isSaving ? 'Synchronizing...' : 'Save Profile Settings'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};