import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push, query, orderByChild, equalTo, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { 
  CloseIcon, GlobeAltIcon, ChevronLeftIcon, InstagramIcon, FacebookIcon, 
  YouTubeIcon, TikTokIcon, BehanceIcon, GalleryIcon, CopyIcon
} from './Icons';
import { siteConfig } from '../config';

const firebaseConfig = {
  databaseURL: "https://fuad-editing-zone-default-rtdb.firebaseio.com/",
  apiKey: "AIzaSyCC3wbQp5713OqHlf1jLZabA0VClDstfKY",
  projectId: "fuad-editing-zone",
  messagingSenderId: "832389657221",
  appId: "1:1032345523456:web:123456789",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

const NETWORK_CONFIGS: Record<string, { icon: any; baseUrl: string }> = {
    'Facebook': { icon: FacebookIcon, baseUrl: 'https://facebook.com/' },
    'Instagram': { icon: InstagramIcon, baseUrl: 'https://instagram.com/' },
    'YouTube': { icon: YouTubeIcon, baseUrl: 'https://youtube.com/@' },
    'TikTok': { icon: TikTokIcon, baseUrl: 'https://tiktok.com/@' },
    'Behance': { icon: BehanceIcon, baseUrl: 'https://behance.net/' }
};

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  viewingUserId?: string | null;
  onOpenModal?: (items: any[], index: number) => void;
  onMessageUser?: (userId: string) => void;
  onShowProfile?: (userId: string, username?: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, viewingUserId, onOpenModal, onMessageUser, onShowProfile }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [targetUser, setTargetUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [userListMode, setUserListMode] = useState<'followers' | 'following' | null>(null);
    const [resolvedUserList, setResolvedUserList] = useState<any[]>([]);
    const [showCopyToast, setShowCopyToast] = useState(false);
    
    const [socialState, setSocialState] = useState({ 
      isFollowing: false, 
      friendStatus: 'none', 
      followers: [] as string[], 
      following: [] as string[] 
    });

    const currentProfileId = viewingUserId || clerkUser?.id;
    const isMyOwnProfile = clerkUser?.id === currentProfileId;
    const isViewingOther = !!viewingUserId && !isMyOwnProfile;

    useEffect(() => {
        if (isOpen && currentProfileId) {
            const userRef = ref(db, `users/${currentProfileId}`);
            const unsubUser = onValue(userRef, (snap) => {
                const data = snap.val() || {};
                setTargetUser(data);
                const initializedData = {
                    ...data,
                    profile: {
                        bio: 'Identity synchronized.',
                        origin: 'Location Hidden',
                        profession: 'Visual Architecture',
                        skills: ['VFX Master', 'Graphic Design'],
                        networks: [
                            { name: 'Facebook', handle: '' }, { name: 'Instagram', handle: '' },
                            { name: 'YouTube', handle: '' }, { name: 'TikTok', handle: '' }, { name: 'Behance', handle: '' }
                        ],
                        ...data.profile
                    }
                };
                if (!isEditing) setEditData(initializedData);
            });

            const unsubFollowers = onValue(ref(db, `social/${currentProfileId}/followers`), (snap) => {
              setSocialState(prev => ({ ...prev, followers: snap.exists() ? Object.keys(snap.val()) : [] }));
            });
            const unsubFollowing = onValue(ref(db, `social/${currentProfileId}/following`), (snap) => {
              setSocialState(prev => ({ ...prev, following: snap.exists() ? Object.keys(snap.val()) : [] }));
            });

            const postsQuery = query(ref(db, 'explore_posts'), orderByChild('userId'), equalTo(currentProfileId));
            const unsubPosts = onValue(postsQuery, (snap) => {
                const data = snap.val();
                setUserPosts(data ? Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) : []);
            });

            return () => { unsubUser(); unsubFollowers(); unsubFollowing(); unsubPosts(); };
        }
    }, [isOpen, currentProfileId, isEditing]);

    useEffect(() => {
        if (userListMode && isOpen) {
            const listIds = userListMode === 'followers' ? socialState.followers : socialState.following;
            const fetchList = async () => {
                const results = await Promise.all(listIds.map(async (id) => {
                    const snap = await get(ref(db, `users/${id}`));
                    return { id, ...snap.val() };
                }));
                setResolvedUserList(results);
            };
            fetchList();
        }
    }, [userListMode, socialState.followers, socialState.following, isOpen]);

    useEffect(() => {
        if (!isViewingOther || !clerkUser || !viewingUserId) return;
        const unsubFol = onValue(ref(db, `social/${clerkUser.id}/following/${viewingUserId}`), (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
        const unsubFri = onValue(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`), (snap) => {
            if (snap.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'accepted' }));
            else {
              onValue(ref(db, `social/${clerkUser.id}/requests/sent/${viewingUserId}`), (s1) => {
                if (s1.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'requested' }));
                else {
                    onValue(ref(db, `social/${clerkUser.id}/requests/received/${viewingUserId}`), (s2) => {
                        if (s2.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'pending' }));
                        else setSocialState(prev => ({ ...prev, friendStatus: 'none' }));
                    });
                }
              });
            }
        });
        return () => { unsubFol(); unsubFri(); };
    }, [isViewingOther, clerkUser, viewingUserId]);

    const handleAction = async (type: 'follow' | 'friend') => {
        if (!clerkUser || !viewingUserId) return;
        if (type === 'follow') {
            const path = `social/${clerkUser.id}/following/${viewingUserId}`;
            const fPath = `social/${viewingUserId}/followers/${clerkUser.id}`;
            if (socialState.isFollowing) {
                await remove(ref(db, path));
                await remove(ref(db, fPath));
            } else {
                await set(ref(db, path), true);
                await set(ref(db, fPath), true);
                await push(ref(db, `notifications/${viewingUserId}`), { 
                    type: 'follow', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false 
                });
            }
        } else {
            if (socialState.friendStatus === 'accepted') {
                if (window.confirm(`Unfriend @${targetUser?.username}?`)) {
                    await remove(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`));
                    await remove(ref(db, `social/${viewingUserId}/friends/${clerkUser.id}`));
                }
            } else if (socialState.friendStatus === 'pending') {
                await remove(ref(db, `social/${clerkUser.id}/requests/received/${viewingUserId}`));
                await remove(ref(db, `social/${viewingUserId}/requests/sent/${clerkUser.id}`));
                await set(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`), true);
                await set(ref(db, `social/${viewingUserId}/friends/${clerkUser.id}`), true);
                await push(ref(db, `notifications/${viewingUserId}`), { 
                    type: 'friend_accepted', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false 
                });
            } else if (socialState.friendStatus === 'none') {
                await set(ref(db, `social/${clerkUser.id}/requests/sent/${viewingUserId}`), { timestamp: Date.now() });
                await set(ref(db, `social/${clerkUser.id}/requests/received/${clerkUser.id}`), { timestamp: Date.now() });
                await push(ref(db, `notifications/${viewingUserId}`), { 
                    type: 'friend_request', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false 
                });
            }
        }
    };

    const handleSaveProfile = async () => {
        if (isMyOwnProfile) {
            await update(ref(db, `users/${clerkUser?.id}`), editData);
            setIsEditing(false);
        }
    };

    const handleCopyProfileLink = () => {
        const username = targetUser?.username || clerkUser?.username || currentProfileId;
        const url = `${window.location.origin}/@${username}`;
        navigator.clipboard.writeText(url);
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 2000);
    };

    const handleSwitchToOtherProfile = (id: string, username: string) => {
        onShowProfile?.(id, username);
        setUserListMode(null);
    };

    const getVerifiedBadge = (u: string) => (u === OWNER_HANDLE ? <i className="fa-solid fa-circle-check verified-badge-owner ml-1 text-sm"></i> : u === ADMIN_HANDLE ? <i className="fa-solid fa-circle-check verified-badge-admin ml-1 text-sm"></i> : null);

    if (!isLoaded || !clerkUser || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000000] flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black backdrop-blur-3xl" />
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.95 }} 
                    className="relative w-full h-full bg-[#050505] flex flex-col overflow-hidden"
                >
                    {/* Full Screen Header */}
                    <div className="px-6 py-5 md:px-12 md:py-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => userListMode ? setUserListMode(null) : onClose()} className="p-2 rounded-full hover:bg-white/5 transition-all text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                            <div className="flex items-center">
                                <h2 className="text-lg md:text-2xl font-black text-white uppercase tracking-widest truncate max-w-[200px] md:max-w-md">{targetUser?.username || clerkUser.username}</h2>
                                {getVerifiedBadge(targetUser?.username || clerkUser.username)}
                                <button onClick={handleCopyProfileLink} className="ml-4 p-2 bg-white/5 hover:bg-red-600/20 rounded-xl text-zinc-500 hover:text-red-500 transition-all border border-white/5" title="Copy Profile URL">
                                    <CopyIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {isMyOwnProfile && <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'}`}>{isEditing ? 'Sync Changes' : 'Edit Identity'}</button>}
                            <button onClick={onClose} className="p-2 bg-red-600 rounded-full text-white shadow-lg hover:scale-110 transition-transform"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence>
                            {showCopyToast && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">Signal Copied</motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {userListMode && (
                                <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="absolute inset-0 z-[60] bg-[#050505] p-6 md:p-12 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                                        <h3 className="text-xl font-black text-white uppercase tracking-[0.3em]">{userListMode} Data</h3>
                                        <button onClick={() => setUserListMode(null)} className="p-2 bg-white/5 rounded-full text-zinc-400 hover:text-white"><CloseIcon className="w-6 h-6" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {resolvedUserList.map((u, i) => (
                                            <div key={i} onClick={() => handleSwitchToOtherProfile(u.id, u.username)} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl cursor-pointer hover:bg-red-600/5 hover:border-red-600/20 transition-all">
                                                <img src={u.avatar || u.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                                                <div className="min-w-0">
                                                    <p className="text-white font-bold text-sm uppercase truncate">{u.name}</p>
                                                    <p className="text-zinc-500 font-medium text-xs">@{u.username}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
                            {/* Profile Header Block */}
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
                                <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-4 p-1 flex-shrink-0 ${targetUser?.username === OWNER_HANDLE ? 'border-red-600 shadow-[0_0_40px_rgba(255,0,0,0.2)]' : targetUser?.username === ADMIN_HANDLE ? 'border-blue-600 shadow-[0_0_40px_rgba(59,130,246,0.2)]' : 'border-white/10'}`}>
                                    <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2.2rem]" alt="" />
                                </div>
                                <div className="flex-1 text-center md:text-left pt-4">
                                    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                                        <h3 className="text-2xl md:text-4xl font-black text-white tracking-tighter">@{targetUser?.username || clerkUser.username}</h3>
                                        <div className="flex gap-3">
                                            {isViewingOther ? (
                                                <><button onClick={() => handleAction('follow')} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl'}`}>{socialState.isFollowing ? 'Following' : 'Follow User'}</button>
                                                  <button onClick={() => handleAction('friend')} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${socialState.friendStatus === 'accepted' ? 'bg-green-600/20 text-green-500 border border-green-600/30' : 'bg-white/5 border border-white/10 text-white'}`}>{socialState.friendStatus === 'accepted' ? 'Friends' : socialState.friendStatus === 'pending' ? 'Accept' : socialState.friendStatus === 'requested' ? 'Pending' : 'Sync Connection'}</button>
                                                  <button onClick={() => onMessageUser?.(viewingUserId!)} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white hover:bg-white/10">Message</button></>
                                            ) : (!isEditing && <button onClick={() => setIsEditing(true)} className="px-8 py-2.5 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white border border-white/10 hover:bg-white/20 transition-all">Edit Identity</button>)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-center md:justify-start gap-12 mb-8 border-y border-white/5 py-6">
                                        <div className="text-center md:text-left"><p className="text-2xl font-black text-white leading-tight font-display">{userPosts.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Master Posts</p></div>
                                        <button onClick={() => setUserListMode('followers')} className="text-center md:text-left hover:opacity-80 transition-opacity"><p className="text-2xl font-black text-white leading-tight font-display">{socialState.followers.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Followers</p></button>
                                        <button onClick={() => setUserListMode('following')} className="text-center md:text-left hover:opacity-80 transition-opacity"><p className="text-2xl font-black text-white leading-tight font-display">{socialState.following.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Following</p></button>
                                    </div>

                                    <div className="space-y-4">
                                        {isEditing ? (
                                            <><input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Full Display Identity" className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold text-sm outline-none focus:border-red-600 mb-2" />
                                              <textarea value={editData.profile?.bio || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, bio: e.target.value}})} placeholder="Describe your creative essence..." className="w-full bg-black border border-white/10 rounded-xl p-4 text-zinc-400 text-sm italic outline-none h-24 resize-none focus:border-red-600" /></>
                                        ) : (
                                            <><p className="text-lg font-black text-white uppercase tracking-tight">{targetUser?.name || clerkUser.fullName}</p>
                                              <p className="text-zinc-400 text-base font-light italic leading-relaxed">"{targetUser?.profile?.bio || 'Fuad Editing Zone active member.'}"</p></>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                    <h4 className="text-xs font-black text-red-600 uppercase tracking-[0.4em]">Protocol Details</h4>
                                    <div className="space-y-4 text-sm uppercase tracking-widest font-bold">
                                        <div className="flex items-center gap-4"><span className="text-zinc-500 w-24">Location:</span> {isEditing ? <input value={editData.profile?.origin} onChange={e => setEditData({...editData, profile: {...editData.profile, origin: e.target.value}})} className="bg-transparent border-b border-white/20 outline-none text-white flex-1" /> : <span className="text-white">{targetUser?.profile?.origin || 'Encrypted'}</span>}</div>
                                        <div className="flex items-center gap-4"><span className="text-zinc-500 w-24">Expertise:</span> {isEditing ? <input value={editData.profile?.profession} onChange={e => setEditData({...editData, profile: {...editData.profile, profession: e.target.value}})} className="bg-transparent border-b border-white/20 outline-none text-white flex-1" /> : <span className="text-white">{targetUser?.profile?.profession || 'Digital Creator'}</span>}</div>
                                    </div>
                                    <div className="pt-4">
                                        <span className="text-[10px] text-red-600 font-black uppercase tracking-widest block mb-4">Core Capabilities</span>
                                        <div className="flex flex-wrap gap-2">
                                            {(isEditing ? (editData.profile?.skills || []) : (targetUser?.profile?.skills || [])).map((s: string, i: number) => (
                                                <span key={i} className="px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-[10px] font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">{s} {isEditing && <button onClick={() => setEditData({...editData, profile: {...editData.profile, skills: editData.profile.skills.filter((_:any,idx:number)=>idx!==i)}})} className="text-red-600 hover:scale-125 transition-transform font-black">×</button>}</span>
                                            ))}
                                            {isEditing && <button onClick={() => { const s = window.prompt("New Capability Signal:"); if(s) setEditData({...editData, profile: {...editData.profile, skills: [...(editData.profile.skills||[]), s]}}); }} className="text-red-600 text-[10px] font-black hover:underline">+ ADD SKILL</button>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-white/5 p-8 rounded-[2rem] border border-white/5">
                                    <div className="flex justify-between items-center"><h4 className="text-xs font-black text-red-600 uppercase tracking-[0.4em]">External Links</h4>{isMyOwnProfile && isEditing && <button onClick={() => { const name = window.prompt("Target (Facebook, Instagram, YouTube, TikTok, Behance):"); if (name && NETWORK_CONFIGS[name]) setEditData({...editData, profile: {...editData.profile, networks: [...(editData.profile.networks || []), { name, handle: '' }]}}); }} className="text-[10px] text-zinc-500 hover:text-red-600 font-black">+ ADD NETWORK</button>}</div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(isEditing ? (editData.profile?.networks || []) : (targetUser?.profile?.networks || [])).map((net: any, i: number) => {
                                            const cfg = NETWORK_CONFIGS[net.name] || { icon: GlobeAltIcon, baseUrl: '' };
                                            return isEditing ? (<div key={i} className="bg-black/30 border border-white/10 rounded-xl p-4"><p className="text-[9px] text-zinc-600 uppercase font-black mb-1">{net.name}</p><input value={net.handle} onChange={e => { const n = [...editData.profile.networks]; n[i].handle = e.target.value.replace('@',''); setEditData({...editData, profile: {...editData.profile, networks: n}}); }} placeholder="@handle" className="bg-transparent text-sm font-bold text-white w-full outline-none" /></div>) : (net.handle && <a key={i} href={`${cfg.baseUrl}${net.handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-red-600/10 hover:border-red-600/20 transition-all group"><cfg.icon className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" /><span className="text-sm font-bold text-zinc-400 group-hover:text-white transition-colors">@{net.handle}</span></a>);
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 pt-10 border-t border-white/5">
                                <h4 className="text-lg font-black text-white uppercase tracking-[0.4em] text-center font-display">Archived Master Works</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {userPosts.map((post, i) => (
                                        <div key={i} onClick={() => onOpenModal?.(userPosts, i)} className="aspect-square bg-white/5 rounded-3xl overflow-hidden group relative cursor-pointer border border-white/5 shadow-xl">
                                            {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center">
                                                <div className="flex gap-4 text-xs font-black text-white uppercase tracking-widest">
                                                    <span className="text-red-500">♥ {Object.keys(post.likes || {}).length}</span>
                                                    <span>💬 {Object.keys(post.comments || {}).length}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {userPosts.length === 0 && <div className="col-span-full py-20 text-center opacity-10"><GalleryIcon className="w-16 h-16 mx-auto mb-4" /><p className="text-sm font-black uppercase tracking-[0.4em]">Empty Transmission Data</p></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};