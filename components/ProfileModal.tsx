import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push, query, orderByChild, equalTo } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
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

    // Upload state
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
                        // Update Browser URL
                        window.history.pushState(null, '', `/@${data.username}`);
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
        
        // Protect Admin Logic
        if (targetUser?.username === OWNER_HANDLE || targetUser?.username === ADMIN_HANDLE) {
            if (type === 'friend' && socialState.friendStatus === 'requested') return;
        }

        const path = type === 'follow' ? `social/${clerkUser.id}/following/${viewingUserId}` : `social/${clerkUser.id}/requests/sent/${viewingUserId}`;
        await set(ref(db, path), { timestamp: Date.now() });
        if (type === 'friend') setSocialState(prev => ({ ...prev, friendStatus: 'requested' }));
    };

    const handleUpload = async () => {
        if (!clerkUser || !selectedFile || !postTitle.trim()) return;
        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('folder', 'UserPosts');

            // Set Protocol URL
            const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', {
                method: 'POST',
                body: formData
            });

            const result = await uploadRes.json();
            if (!uploadRes.ok) throw new Error(result.error || 'Upload failed');
            
            const { url } = result;
            const tags = postCaption.match(/#\w+/g) || [];

            const postData = {
                userId: clerkUser.id,
                userName: clerkUser.fullName || clerkUser.username,
                userAvatar: clerkUser.imageUrl,
                mediaUrl: url,
                mediaType: selectedFile.type.startsWith('video') ? 'video' : 'image',
                title: postTitle.trim(),
                caption: postCaption.trim(),
                tags: tags,
                timestamp: Date.now()
            };

            await push(ref(db, 'explore_posts'), postData);
            
            setPostTitle('');
            setPostCaption('');
            setSelectedFile(null);
            setShowUploadForm(false);
        } catch (err: any) {
            console.error(err);
            alert(`Worker Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!clerkUser) return;
        setIsSaving(true);
        try {
            await update(ref(db, `users/${clerkUser.id}/profile`), profileData);
            setCopyFeedback("Saved!");
            setTimeout(() => {
                setCopyFeedback(null);
                setIsSaving(false);
            }, 1500);
        } catch (e) { 
            setIsSaving(false);
            alert("Sync Failed.");
        }
    };

    const isOwner = targetUser?.username === OWNER_HANDLE || (!isViewingOther && clerkUser?.username === OWNER_HANDLE);
    const isAdmin = targetUser?.username === ADMIN_HANDLE || (!isViewingOther && clerkUser?.username === ADMIN_HANDLE);

    if (!isLoaded || !clerkUser) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000000] flex items-center justify-center p-2 md:p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                        animate={{ opacity: 1, scale: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
                        className="relative w-full max-w-5xl h-full max-h-[92vh] bg-[#050505] rounded-[2rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl"
                    >
                        {/* Instagram Header */}
                        <div className="flex-shrink-0 p-4 md:p-6 md:px-12 flex items-center bg-black border-b border-white/5 z-20">
                            <button onClick={onClose} className="mr-4 md:mr-6 p-2 rounded-full hover:bg-white/5 transition-all text-white">
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                            <div className="flex-1 truncate">
                                <h2 className="text-base md:text-xl font-black text-white uppercase tracking-tight truncate">{targetUser?.username || clerkUser.username}</h2>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-red-600 text-white transition-all"><CloseIcon className="w-5 h-5" /></button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="p-6 md:p-12 space-y-8 pb-32">
                                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                                    <div className="relative group flex-shrink-0">
                                        <div className={`w-28 h-28 md:w-40 md:h-40 rounded-full border-4 p-1.5 transition-all ${isOwner ? 'border-red-600' : isAdmin ? 'border-blue-600' : 'border-white/10'}`}>
                                            <img src={isViewingOther ? targetUser?.avatar : clerkUser.imageUrl} className="w-full h-full object-cover rounded-full" />
                                        </div>
                                        {(isOwner || isAdmin) && <span className={`absolute -top-1 -right-1 px-3 py-1 rounded-lg text-[8px] font-black uppercase text-white ${isOwner ? 'bg-red-600' : 'bg-blue-600'}`}>{isOwner ? 'Owner' : 'Admin'}</span>}
                                    </div>

                                    <div className="flex-1 text-center md:text-left space-y-4">
                                        <div className="flex flex-col md:flex-row items-center gap-4">
                                            <h3 className="text-xl md:text-3xl font-light text-white lowercase">@{targetUser?.username || clerkUser.username}</h3>
                                            <div className="flex gap-2">
                                                {isViewingOther ? (
                                                    <>
                                                        <button onClick={() => handleAction('follow')} className={`px-5 md:px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white'}`}>
                                                            {socialState.isFollowing ? 'Following' : 'Follow'}
                                                        </button>
                                                        <button onClick={() => handleAction('friend')} className="px-5 md:px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white">
                                                            {socialState.friendStatus === 'accepted' ? 'Friends' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => setActiveTab('identity')} className="px-5 md:px-6 py-2 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white">Edit Profile</button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-center md:justify-start gap-8 md:gap-12">
                                            <div><p className="text-lg font-black text-white">{userPosts.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black">Posts</p></div>
                                            <div><p className="text-lg font-black text-white">{socialState.followers}</p><p className="text-[10px] text-zinc-500 uppercase font-black">Followers</p></div>
                                            <div><p className="text-lg font-black text-white">{socialState.following}</p><p className="text-[10px] text-zinc-500 uppercase font-black">Following</p></div>
                                        </div>

                                        <div className="space-y-1">
                                            <p className="text-lg font-black text-white">{targetUser?.name || clerkUser.fullName}</p>
                                            <p className="text-zinc-500 text-xs font-bold uppercase">{profileData.role} • {profileData.profession || 'Creative'}</p>
                                            <p className="text-zinc-300 text-sm leading-relaxed max-w-lg">{profileData.bio || 'Silence is a frequency.'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs Navigation */}
                                <div className="flex justify-center border-t border-white/5 pt-4 sticky top-0 bg-[#050505] z-10 overflow-x-auto no-scrollbar">
                                    {(['identity', 'credentials', 'networks', 'posts'] as TabType[]).map(tab => (
                                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-10 py-4 text-[10px] font-black uppercase tracking-widest relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-zinc-600'}`}>
                                            {tab === 'posts' ? 'Posts' : tab === 'credentials' ? 'Skills' : tab}
                                            {activeTab === tab && <motion.div layoutId="profileTabLine" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />}
                                        </button>
                                    ))}
                                </div>

                                {/* Tab Content Container */}
                                <div className="min-h-[400px]">
                                    {activeTab === 'posts' && (
                                        <div className="space-y-8">
                                            {!isViewingOther && (
                                                <div className="flex justify-center">
                                                    {!showUploadForm ? (
                                                        <button onClick={() => setShowUploadForm(true)} className="flex items-center gap-3 bg-red-600 text-white font-black py-4 px-10 rounded-2xl uppercase text-[10px] tracking-widest shadow-2xl">
                                                            <SparklesIcon className="w-4 h-4" /> Upload Post
                                                        </button>
                                                    ) : (
                                                        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-[10px] font-black text-white uppercase">New Protocol</span>
                                                                <button onClick={() => setShowUploadForm(false)} className="p-1 hover:bg-white/10 rounded-full text-zinc-500"><CloseIcon className="w-4 h-4" /></button>
                                                            </div>
                                                            <input value={postTitle} onChange={e => setPostTitle(e.target.value)} placeholder="Project Title" className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white outline-none focus:border-red-600 transition-all" />
                                                            <textarea value={postCaption} onChange={e => setPostCaption(e.target.value)} placeholder="Caption & #tags..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-sm text-white outline-none resize-none h-24 focus:border-red-600 transition-all" />
                                                            <div className="flex gap-2">
                                                                <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                                                                <button onClick={() => fileInputRef.current?.click()} className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border transition-all text-[10px] font-black uppercase ${selectedFile ? 'bg-green-600/20 text-green-500' : 'bg-white/5 border-white/10 text-zinc-400'}`}>
                                                                    <PhotoManipulationIcon className="w-4 h-4" /> {selectedFile ? 'Ready' : 'Choose Media'}
                                                                </button>
                                                                <button disabled={isUploading || !selectedFile || !postTitle} onClick={handleUpload} className="flex-1 bg-red-600 text-white p-4 rounded-xl font-black uppercase tracking-widest text-[10px] disabled:opacity-50">
                                                                    {isUploading ? 'Uploading...' : 'Upload Post'}
                                                                </button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="grid grid-cols-3 gap-1 md:gap-4">
                                                {userPosts.length === 0 ? (
                                                    <div className="col-span-3 py-20 text-center opacity-20 flex flex-col items-center gap-4">
                                                        <GalleryIcon className="w-16 h-16" />
                                                        <p className="text-[10px] font-black uppercase">No Media Signals</p>
                                                    </div>
                                                ) : (
                                                    userPosts.map((post, i) => (
                                                        <div key={i} className="aspect-square bg-white/5 rounded-lg overflow-hidden group relative border border-white/5">
                                                            {post.mediaType === 'video' ? (
                                                                <video src={post.mediaUrl} className="w-full h-full object-cover" />
                                                            ) : <img src={post.mediaUrl} className="w-full h-full object-cover" />}
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center">
                                                                <p className="text-[8px] md:text-[10px] font-black text-white uppercase line-clamp-2">{post.title}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'identity' && (
                                        <div className="space-y-6 max-w-2xl mx-auto">
                                            <div className="p-8 bg-white/5 rounded-[2rem] border border-white/10 shadow-inner">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-4">Bio Identity</p>
                                                {!isViewingOther ? (
                                                    <textarea value={profileData.bio} onChange={e => setProfileData({...profileData, bio: e.target.value})} className="bg-transparent text-white text-base md:text-lg w-full resize-none outline-none italic custom-scrollbar" rows={6} placeholder="How do you want the zone to see you?" />
                                                ) : <p className="text-white text-base md:text-lg italic leading-relaxed">"{profileData.bio || '...'}"</p>}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'credentials' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase mb-2">Category</p>
                                                {!isViewingOther ? (
                                                    <select value={profileData.role} onChange={e => setProfileData({...profileData, role: e.target.value})} className="bg-transparent text-white font-black w-full outline-none appearance-none cursor-pointer">
                                                        <option value="Client">Client</option>
                                                        <option value="Designer">Designer</option>
                                                        <option value="Editor">Editor</option>
                                                    </select>
                                                ) : <p className="text-white font-black">{profileData.role}</p>}
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase mb-2">Expertise</p>
                                                {!isViewingOther ? (
                                                    <input value={profileData.profession} onChange={e => setProfileData({...profileData, profession: e.target.value})} className="bg-transparent text-white font-black w-full outline-none" placeholder="Mastery Name" />
                                                ) : <p className="text-white font-black">{profileData.profession || 'Specialist'}</p>}
                                            </div>
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 md:col-span-2">
                                                <p className="text-[10px] text-zinc-500 font-black uppercase mb-2">Work Experience</p>
                                                {!isViewingOther ? (
                                                    <input value={profileData.experience} onChange={e => setProfileData({...profileData, experience: e.target.value})} className="bg-transparent text-white font-black w-full outline-none" placeholder="Years or level..." />
                                                ) : <p className="text-white font-black">{profileData.experience || 'Verified Operator'}</p>}
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeTab === 'networks' && (
                                        <div className="space-y-4 max-w-2xl mx-auto">
                                            {['instagram', 'facebook', 'tiktok', 'behance', 'twitter'].map(platform => {
                                                const handle = (profileData as any)[platform];
                                                if (isViewingOther && !handle) return null;
                                                return (
                                                    <div key={platform} className="p-6 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-red-500"><SparklesIcon className="w-5 h-5" /></div>
                                                            <div>
                                                                <p className="text-[10px] text-zinc-500 font-black uppercase">{platform}</p>
                                                                {!isViewingOther ? (
                                                                    <input value={handle} onChange={e => setProfileData({...profileData, [platform]: e.target.value})} className="bg-transparent text-white font-black outline-none" placeholder="@username" />
                                                                ) : <p className="text-white font-black">@{handle}</p>}
                                                            </div>
                                                        </div>
                                                        {handle && isViewingOther && <ChevronRightIcon className="w-5 h-5 text-red-500" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sticky Footer */}
                        {!isViewingOther && activeTab !== 'posts' && (
                            <div className="p-6 border-t border-white/10 bg-black absolute bottom-0 left-0 right-0 z-30">
                                <button onClick={handleSave} disabled={isSaving} className="w-full py-4 bg-red-600 text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl shadow-2xl transition-all disabled:opacity-50">
                                    {isSaving ? 'Syncing...' : copyFeedback ? copyFeedback : 'Save Global Profile'}
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};