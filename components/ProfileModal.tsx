import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push, query, orderByChild, equalTo, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, CopyIcon, InstagramIcon, FacebookIcon, ChevronRightIcon, TikTokIcon, BehanceIcon, GalleryIcon, ChevronLeftIcon, PlayIcon, PhotoManipulationIcon, SendIcon } from './Icons';
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

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; viewingUserId?: string | null; initialTab?: TabType; forceOpenUpload?: boolean }> = ({ isOpen, onClose, viewingUserId, initialTab = 'identity', forceOpenUpload = false }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>(initialTab);
    const [isSaving, setIsSaving] = useState(false);
    const [copyFeedback, setCopyFeedback] = useState<string | null>(null);
    const [targetUser, setTargetUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [socialState, setSocialState] = useState({ isFollowing: false, friendStatus: 'none', followers: 0, following: 0 });

    const [showUploadForm, setShowUploadForm] = useState(forceOpenUpload);
    const [isUploading, setIsUploading] = useState(false);
    const [postTitle, setPostTitle] = useState('');
    const [postCaption, setPostCaption] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            setActiveTab(initialTab);
            setShowUploadForm(forceOpenUpload);
            const loadId = viewingUserId || clerkUser?.id;
            if (loadId) {
                onValue(ref(db, `users/${loadId}`), (snap) => {
                    const data = snap.val();
                    if (data) {
                        setTargetUser(data);
                        if (data.profile) setProfileData(prev => ({ ...prev, ...data.profile }));
                        if (data.username) {
                            window.history.pushState(null, '', `/@${data.username}`);
                        }
                    }
                });
                
                onValue(ref(db, `social/${loadId}/followers`), (snap) => {
                    setSocialState(prev => ({ ...prev, followers: Object.keys(snap.val() || {}).length }));
                });
                onValue(ref(db, `social/${loadId}/following`), (snap) => {
                    setSocialState(prev => ({ ...prev, following: Object.keys(snap.val() || {}).length }));
                });

                const postsQuery = query(ref(db, 'explore_posts'), orderByChild('userId'), equalTo(loadId));
                onValue(postsQuery, (snap) => {
                    const data = snap.val();
                    if (data) {
                        setUserPosts(Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp));
                    } else {
                        setUserPosts([]);
                    }
                });
            }
        }
    }, [isOpen, viewingUserId, clerkUser, initialTab, forceOpenUpload]);

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

    const handleUpload = async () => {
        if (!clerkUser || !postCaption.trim()) return;

        const today = new Date().toISOString().split('T')[0];
        const userPostCountRef = ref(db, `post_limits/${clerkUser.id}/${today}`);
        const currentCountSnap = await get(userPostCountRef);
        const currentCount = currentCountSnap.val() || 0;

        if (currentCount >= 5) {
            alert("Transmission Error: Max 5 posts per day.");
            return;
        }

        setIsUploading(true);
        try {
            let mediaUrl = "";
            let mediaType: 'image' | 'video' | 'text' = 'text';

            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('folder', 'UserPosts');

                const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Upload protocol failed');
                const result = await uploadRes.json();
                mediaUrl = result.url;
                mediaType = selectedFile.type.startsWith('video') ? 'video' : 'image';
            }

            const tags = postCaption.match(/#\w+/g) || [];
            const postData = {
                userId: clerkUser.id,
                userName: clerkUser.username || clerkUser.fullName,
                userAvatar: clerkUser.imageUrl,
                mediaUrl,
                mediaType,
                title: postTitle.trim(),
                caption: postCaption.trim(),
                tags,
                timestamp: Date.now()
            };

            await push(ref(db, 'explore_posts'), postData);
            await set(userPostCountRef, currentCount + 1);
            
            setPostTitle('');
            setPostCaption('');
            setSelectedFile(null);
            setShowUploadForm(false);
        } catch (err: any) {
            console.error(err);
            alert(`Signal Interrupt: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!clerkUser) return;
        setIsSaving(true);
        try {
            await update(ref(db, `users/${clerkUser.id}/profile`), profileData);
            setCopyFeedback("Identity Synchronized!");
            setTimeout(() => {
                setCopyFeedback(null);
                setIsSaving(false);
            }, 1500);
        } catch (e) { 
            setIsSaving(false);
            alert("Failed to synchronize identity.");
        }
    };

    const isVerified = (username: string) => username === OWNER_HANDLE || username === ADMIN_HANDLE;
    const isOwner = targetUser?.username === OWNER_HANDLE;
    const isAdmin = targetUser?.username === ADMIN_HANDLE;

    const renderBio = (text: string) => {
        const parts = text.split(/(@\w+|#\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className="mention-link">{part}</span>;
            } else if (part.startsWith('#')) {
                return <span key={i} className="text-red-500 font-bold">{part}</span>;
            }
            return part;
        });
    };

    if (!isLoaded || !clerkUser) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000000] flex items-center justify-center">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                    
                    <motion.div 
                        initial={{ opacity: 0, y: 50, scale: 0.98 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        exit={{ opacity: 0, y: 50, scale: 0.98 }} 
                        className="relative w-full h-full md:h-[92vh] md:max-w-6xl md:rounded-[3.5rem] bg-[#050505] border-white/5 border-0 md:border flex flex-col overflow-hidden shadow-[0_0_100px_rgba(0,0,0,1)]"
                    >
                        {/* Immersive Header */}
                        <div className="flex-shrink-0 p-4 md:p-8 flex items-center justify-between bg-black/50 border-b border-white/5 z-20 backdrop-blur-xl">
                            <div className="flex items-center gap-4">
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-all">
                                    <ChevronLeftIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
                                </button>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-tight truncate">{targetUser?.username || clerkUser.username}</h2>
                                    {isVerified(targetUser?.username || clerkUser.username) && (
                                        <i className={`fa-solid fa-circle-check text-base md:text-xl ${isOwner ? 'verified-badge-owner' : 'verified-badge-admin'}`}></i>
                                    )}
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2.5 rounded-full hover:bg-red-600 text-white transition-all shadow-xl"><CloseIcon className="w-5 h-5 md:w-7 md:h-7" /></button>
                        </div>

                        {/* Immersive Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 md:p-16 space-y-12 pb-40">
                                {/* Bio Section */}
                                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                                    <div className="relative group flex-shrink-0">
                                        <div className={`w-32 h-32 md:w-52 md:h-52 rounded-full border-4 p-1.5 transition-all ${isOwner ? 'border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)]' : isAdmin ? 'border-blue-600 shadow-[0_0_40px_rgba(0,149,246,0.4)]' : 'border-white/10'}`}>
                                            <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-full" alt="" />
                                        </div>
                                    </div>

                                    <div className="flex-1 text-center md:text-left space-y-6">
                                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-2xl md:text-5xl font-light text-white lowercase">@{targetUser?.username || clerkUser.username}</h3>
                                            </div>
                                            <div className="flex gap-3">
                                                {isViewingOther ? (
                                                    <>
                                                        <button onClick={() => handleAction('follow')} className={`px-8 md:px-10 py-3 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white border border-white/20' : 'bg-red-600 text-white shadow-xl shadow-red-600/20'}`}>
                                                            {socialState.isFollowing ? 'Following' : 'Follow'}
                                                        </button>
                                                        <button onClick={() => handleAction('friend')} className="px-8 md:px-10 py-3 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white hover:bg-white/10 transition-all">Add Friend</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => setActiveTab('identity')} className="px-8 md:px-10 py-3 bg-white/10 hover:bg-white/20 rounded-2xl font-black text-[11px] uppercase tracking-widest text-white transition-all shadow-xl">Edit Protocol</button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-center md:justify-start gap-10 md:gap-16 border-y border-white/5 py-6 md:border-0 md:py-0">
                                            <div className="text-center md:text-left"><p className="text-xl md:text-3xl font-black text-white">{userPosts.length}</p><p className="text-[10px] md:text-[11px] text-zinc-500 uppercase font-black tracking-widest">Posts</p></div>
                                            <div className="text-center md:text-left"><p className="text-xl md:text-3xl font-black text-white">{socialState.followers}</p><p className="text-[10px] md:text-[11px] text-zinc-500 uppercase font-black tracking-widest">Followers</p></div>
                                            <div className="text-center md:text-left"><p className="text-xl md:text-3xl font-black text-white">{socialState.following}</p><p className="text-[10px] md:text-[11px] text-zinc-500 uppercase font-black tracking-widest">Following</p></div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-lg md:text-2xl font-black text-white">{targetUser?.name || clerkUser.fullName}</p>
                                            <p className="text-red-500 text-xs md:text-sm font-bold uppercase tracking-widest">{profileData.role} • {profileData.profession || 'Creative Mind'}</p>
                                            <p className="text-zinc-300 text-sm md:text-lg leading-relaxed max-w-2xl italic">{renderBio(profileData.bio || 'Silence is a frequency.')}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Persistent Navigation */}
                                <div className="flex justify-center border-t border-white/5 pt-4 sticky top-0 bg-[#050505] z-10 overflow-x-auto no-scrollbar backdrop-blur-xl">
                                    {(['posts', 'identity', 'credentials', 'networks'] as TabType[]).map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-12 py-5 text-[10px] md:text-[12px] font-black uppercase tracking-[0.3em] relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-zinc-600 hover:text-zinc-400 transition-colors'}`}>
                                            {tab === 'posts' ? 'Portfolio' : tab === 'credentials' ? 'Work Experience' : tab}
                                            {activeTab === tab && <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Detailed Tab Content */}
                                <div className="min-h-[500px]">
                                    {activeTab === 'posts' && (
                                        <div className="space-y-12">
                                            {!isViewingOther && (
                                                <div className="flex justify-center">
                                                    {!showUploadForm ? (
                                                        <button 
                                                            onClick={() => setShowUploadForm(true)}
                                                            className="flex items-center gap-4 bg-red-600 text-white font-black py-5 px-14 rounded-3xl uppercase text-[11px] tracking-[0.3em] shadow-[0_20px_50px_rgba(220,38,38,0.3)] hover:bg-red-700 transition-all hover:scale-105"
                                                        >
                                                            <SparklesIcon className="w-5 h-5" /> Upload Post
                                                        </button>
                                                    ) : (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                                                            className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[3rem] p-8 space-y-6 shadow-2xl"
                                                        >
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[11px] font-black text-white uppercase tracking-widest">New Transmission</span>
                                                                <button onClick={() => setShowUploadForm(false)} className="p-1 hover:bg-white/10 rounded-full transition-all"><CloseIcon className="w-5 h-5 text-zinc-500" /></button>
                                                            </div>
                                                            <input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Project Name (Optional)" className="w-full bg-black border border-white/10 rounded-xl p-5 text-sm text-white outline-none focus:border-red-600 transition-all shadow-inner" />
                                                            <textarea value={postCaption} onChange={e => setPostCaption(e.target.value)} placeholder="intel & #tags... Use @mentions" className="w-full bg-black border border-white/10 rounded-xl p-5 text-sm text-white outline-none resize-none h-32 focus:border-red-600 transition-all shadow-inner" />
                                                            <div className="flex gap-3">
                                                                <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                                                                <button onClick={() => fileInputRef.current?.click()} className={`flex-1 flex items-center justify-center gap-3 p-5 rounded-2xl border transition-all text-[11px] font-black uppercase ${selectedFile ? 'bg-green-600/20 text-green-500 border-green-600/30' : 'bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10'}`}>
                                                                    <PhotoManipulationIcon className="w-5 h-5" /> {selectedFile ? 'Ready' : 'Choose Media'}
                                                                </button>
                                                                <button disabled={isUploading || !postCaption} onClick={handleUpload} className="flex-1 bg-red-600 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-[11px] disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl shadow-red-600/20">
                                                                    {isUploading ? 'Sending...' : 'Publish'}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-1.5 md:gap-4">
                                                {userPosts.length === 0 ? (
                                                    <div className="col-span-full py-32 text-center flex flex-col items-center gap-6 opacity-20">
                                                        <GalleryIcon className="w-20 h-20" />
                                                        <p className="text-sm font-black uppercase tracking-[0.5em]">No Assets Found</p>
                                                    </div>
                                                ) : (
                                                    userPosts.map((post, i) => (
                                                        <div key={i} className="aspect-square bg-white/5 rounded-xl md:rounded-2xl overflow-hidden group relative cursor-pointer border border-white/5 shadow-lg">
                                                            {post.mediaType === 'video' ? (
                                                                <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                                            ) : post.mediaType === 'image' ? (
                                                                <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center p-4 bg-[#0a0a0a]">
                                                                    <p className="text-[9px] text-zinc-600 uppercase font-black tracking-widest text-center line-clamp-4">{post.caption}</p>
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4 text-center">
                                                                <p className="text-[10px] md:text-[12px] font-black text-white uppercase tracking-tighter line-clamp-2">{post.title || 'Broadcast'}</p>
                                                                <div className="flex gap-4 mt-3">
                                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-red-500"><i className="fa-solid fa-heart"></i> {Object.keys(post.likes || {}).length}</div>
                                                                    <div className="flex items-center gap-1.5 text-[9px] font-black text-white"><i className="fa-solid fa-comment"></i> {Object.keys(post.comments || {}).length}</div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'identity' && (
                                        <div className="space-y-10 max-w-3xl mx-auto">
                                            <div className="p-10 md:p-14 bg-white/5 rounded-[3rem] border border-white/10 shadow-inner relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-2 h-full bg-red-600 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-[0.4em] mb-6">Master Bio Identity</p>
                                                {isViewingOther ? (
                                                    <p className="text-white text-base md:text-2xl italic leading-relaxed font-light">"{renderBio(profileData.bio || 'Frequency established.')}"</p>
                                                ) : (
                                                    <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-transparent text-white text-base md:text-2xl w-full resize-none outline-none italic custom-scrollbar font-light h-64" placeholder="Update your identity signal... Use @mentions" />
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'credentials' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                                            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 shadow-lg">
                                                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-4">Operator Class</p>
                                                {!isViewingOther ? (
                                                    <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="bg-black text-white font-black w-full outline-none p-4 rounded-xl border border-white/5 cursor-pointer">
                                                        <option value="Client">Client</option>
                                                        <option value="Designer">Designer</option>
                                                        <option value="Editor">Editor</option>
                                                    </select>
                                                ) : <p className="text-white text-xl font-black uppercase tracking-tighter">{profileData.role}</p>}
                                            </div>
                                            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 shadow-lg">
                                                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-4">Primary Mastery</p>
                                                {!isViewingOther ? (
                                                    <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} className="bg-black text-white font-black w-full outline-none p-4 rounded-xl border border-white/5" placeholder="Specialization" />
                                                ) : <p className="text-white text-xl font-black uppercase tracking-tighter">{profileData.profession || 'Unclassified'}</p>}
                                            </div>
                                            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 shadow-lg md:col-span-2">
                                                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-4">Work Experience Log</p>
                                                {!isViewingOther ? (
                                                    <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} className="bg-black text-white font-black w-full outline-none p-4 rounded-xl border border-white/5" placeholder="Detailed History..." />
                                                ) : <p className="text-white text-xl font-black">{profileData.experience || 'Verified Veteran'}</p>}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'networks' && (
                                        <div className="space-y-6 max-w-3xl mx-auto">
                                            {['instagram', 'facebook', 'tiktok', 'behance', 'twitter'].map(platform => {
                                                const handle = (profileData as any)[platform];
                                                if (isViewingOther && !handle) return null;
                                                return (
                                                    <div key={platform} className="p-8 bg-white/5 rounded-[2rem] border border-white/10 flex items-center justify-between group hover:border-red-600/30 transition-all shadow-xl">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center text-red-600 border border-white/5 group-hover:scale-110 transition-transform"><SparklesIcon className="w-6 h-6" /></div>
                                                            <div className="min-w-0">
                                                                <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest mb-1">{platform}</p>
                                                                {!isViewingOther ? (
                                                                    <input value={handle} onChange={e => setProfileData({...profileData, [platform]: e.target.value})} className="bg-transparent text-white font-black outline-none w-full text-lg" placeholder="@handle" />
                                                                ) : <p className="text-white text-lg font-black truncate tracking-tight">@{handle}</p>}
                                                            </div>
                                                        </div>
                                                        {handle && isViewingOther && <ChevronRightIcon className="w-6 h-6 text-red-500 flex-shrink-0 group-hover:translate-x-2 transition-transform" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Immersive Footer Controls */}
                        {!isViewingOther && (activeTab !== 'posts') && (
                            <div className="p-6 md:px-16 border-t border-white/5 bg-black/90 backdrop-blur-2xl absolute bottom-0 left-0 right-0 z-30 flex items-center justify-center">
                                <button 
                                    onClick={handleSave} 
                                    disabled={isSaving}
                                    className="w-full max-w-md py-5 bg-red-600 text-white font-black uppercase tracking-[0.5em] text-[12px] rounded-3xl shadow-[0_20px_50px_rgba(220,38,38,0.4)] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                                >
                                    {isSaving ? 'Synchronizing Intelligence...' : copyFeedback ? copyFeedback : 'Update Identity Protocol'}
                                    {!isSaving && !copyFeedback && <CheckCircleIcon className="w-5 h-5" />}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};