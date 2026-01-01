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

    const getVerifiedBadge = (u: string) => (u === OWNER_HANDLE ? <i className="fa-solid fa-circle-check verified-badge-owner ml-1 text-xs"></i> : u === ADMIN_HANDLE ? <i className="fa-solid fa-circle-check verified-badge-admin ml-1 text-xs"></i> : null);

    if (!isLoaded || !clerkUser || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000000] flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative w-full h-full md:h-fit md:max-h-[90vh] md:max-w-2xl md:rounded-[2rem] bg-[#050505] border-white/5 border-0 md:border flex flex-col overflow-hidden shadow-2xl">
                    
                    <div className="p-3 md:p-5 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <button onClick={() => userListMode ? setUserListMode(null) : onClose()} className="p-1 rounded-full hover:bg-white/5 transition-all text-white"><ChevronLeftIcon className="w-4 h-4" /></button>
                            <div className="flex items-center">
                                <h2 className="text-xs font-black text-white uppercase tracking-widest truncate max-w-[120px]">{targetUser?.username || clerkUser.username}</h2>
                                {getVerifiedBadge(targetUser?.username || clerkUser.username)}
                                <button onClick={handleCopyProfileLink} className="ml-2 p-1.5 bg-white/5 hover:bg-red-600/20 rounded-lg text-zinc-500 hover:text-red-500 transition-all border border-white/5" title="Copy Protocol URL">
                                    <CopyIcon className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {isMyOwnProfile && <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-3 py-1 rounded-lg font-bold text-[8px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'}`}>{isEditing ? 'Sync' : 'Edit'}</button>}
                            <button onClick={onClose} className="p-1.5 bg-red-600 rounded-full text-white shadow-lg"><CloseIcon className="w-3.5 h-3.5" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence>
                            {showCopyToast && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] bg-white text-black px-4 py-1.5 rounded-full font-black text-[8px] uppercase tracking-widest shadow-xl">Signal Copied</motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {userListMode && (
                                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 50 }} className="absolute inset-0 z-[60] bg-[#050505] p-5 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-3">
                                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">{userListMode}</h3>
                                        <button onClick={() => setUserListMode(null)} className="p-1.5 bg-white/5 rounded-full text-zinc-400 hover:text-white"><CloseIcon className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {resolvedUserList.map((u, i) => (
                                            <div key={i} onClick={() => handleSwitchToOtherProfile(u.id, u.username)} className="flex items-center gap-3 p-2 bg-white/5 border border-white/5 rounded-lg cursor-pointer hover:bg-red-600/5 hover:border-red-600/20 transition-all">
                                                <img src={u.avatar || u.imageUrl} className="w-8 h-8 rounded object-cover" alt="" />
                                                <div className="min-w-0"><p className="text-white font-bold text-[10px] uppercase truncate">{u.name}</p><p className="text-zinc-500 font-medium text-[8px]">@{u.username}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-4 md:p-6 space-y-5">
                            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                                <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.4rem] border-2 p-0.5 flex-shrink-0 ${targetUser?.username === OWNER_HANDLE ? 'border-red-600/50' : targetUser?.username === ADMIN_HANDLE ? 'border-blue-600/50' : 'border-white/10'}`}>
                                    <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[1.2rem]" alt="" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
                                        <h3 className="text-base font-light text-white">@{targetUser?.username || clerkUser.username}</h3>
                                        <div className="flex gap-2">
                                            {isViewingOther ? (
                                                <><button onClick={() => handleAction('follow')} className={`px-3 py-1 rounded-lg font-bold text-[7px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-md'}`}>{socialState.isFollowing ? 'Following' : 'Follow'}</button>
                                                  <button onClick={() => handleAction('friend')} className={`px-3 py-1 rounded-lg font-bold text-[7px] uppercase tracking-widest transition-all ${socialState.friendStatus === 'accepted' ? 'bg-green-600/20 text-green-500 border border-green-600/30' : 'bg-white/5 border border-white/10 text-white'}`}>{socialState.friendStatus === 'accepted' ? 'Friends' : socialState.friendStatus === 'pending' ? 'Accept' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}</button>
                                                  <button onClick={() => onMessageUser?.(viewingUserId!)} className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg font-bold text-[7px] uppercase tracking-widest text-white hover:bg-white/10">Message</button></>
                                            ) : (!isEditing && <button onClick={() => setIsEditing(true)} className="px-3 py-1 bg-white/10 rounded-lg font-bold text-[7px] uppercase tracking-widest text-white">Edit Profile</button>)}
                                        </div>
                                    </div>
                                    <div className="flex justify-center md:justify-start gap-4 mb-2">
                                        <div className="text-center md:text-left"><p className="text-sm font-bold text-white leading-tight">{userPosts.length}</p><p className="text-[6px] text-zinc-500 uppercase font-black">Posts</p></div>
                                        <button onClick={() => setUserListMode('followers')} className="text-center md:text-left hover:opacity-80 transition-opacity"><p className="text-sm font-bold text-white leading-tight">{socialState.followers.length}</p><p className="text-[6px] text-zinc-500 uppercase font-black">Followers</p></button>
                                        <button onClick={() => setUserListMode('following')} className="text-center md:text-left hover:opacity-80 transition-opacity"><p className="text-sm font-bold text-white leading-tight">{socialState.following.length}</p><p className="text-[6px] text-zinc-500 uppercase font-black">Following</p></button>
                                    </div>
                                    <div className="space-y-0.5">
                                        {isEditing ? (
                                            <><input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Display Identity" className="w-full bg-black border border-white/10 rounded px-2 py-1 text-white font-medium text-[10px] outline-none focus:border-red-600 mb-1" />
                                              <textarea value={editData.profile?.bio || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, bio: e.target.value}})} placeholder="Bio..." className="w-full bg-black border border-white/10 rounded px-2 py-1 text-zinc-400 text-[9px] italic outline-none h-10 resize-none" /></>
                                        ) : (
                                            <><p className="text-[10px] font-bold text-white uppercase tracking-wider">{targetUser?.name || clerkUser.fullName}</p>
                                              <p className="text-zinc-400 text-[9px] font-light italic leading-snug truncate">"{targetUser?.profile?.bio || 'Active.'}"</p></>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-[8px] uppercase tracking-widest font-black">
                                    <div className="flex items-center gap-1.5"><span className="text-red-600">Location:</span> {isEditing ? <input value={editData.profile?.origin} onChange={e => setEditData({...editData, profile: {...editData.profile, origin: e.target.value}})} className="bg-transparent border-b border-white/10 outline-none text-white w-16" /> : <span className="text-white">{targetUser?.profile?.origin || 'Hidden'}</span>}</div>
                                    <div className="flex items-center gap-1.5"><span className="text-red-600">Expertise:</span> {isEditing ? <input value={editData.profile?.profession} onChange={e => setEditData({...editData, profile: {...editData.profile, profession: e.target.value}})} className="bg-transparent border-b border-white/10 outline-none text-white w-16" /> : <span className="text-white">{targetUser?.profile?.profession || 'Artist'}</span>}</div>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                    <span className="text-[8px] text-red-600 font-black uppercase tracking-widest mr-1">Skills:</span>
                                    {(isEditing ? (editData.profile?.skills || []) : (targetUser?.profile?.skills || [])).map((s: string, i: number) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-[7px] font-medium text-zinc-400 flex items-center gap-1">{s} {isEditing && <button onClick={() => setEditData({...editData, profile: {...editData.profile, skills: editData.profile.skills.filter((_:any,idx:number)=>idx!==i)}})} className="text-red-600">×</button>}</span>
                                    ))}
                                    {isEditing && <button onClick={() => { const s = window.prompt("Capability:"); if(s) setEditData({...editData, profile: {...editData.profile, skills: [...(editData.profile.skills||[]), s]}}); }} className="text-red-600 text-[7px] font-black">+ ADD</button>}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center"><h4 className="text-[8px] font-black text-red-600 uppercase tracking-widest">Connect</h4>{isMyOwnProfile && isEditing && <button onClick={() => { const name = window.prompt("Facebook, Instagram, YouTube, TikTok, Behance:"); if (name && NETWORK_CONFIGS[name]) setEditData({...editData, profile: {...editData.profile, networks: [...(editData.profile.networks || []), { name, handle: '' }]}}); }} className="text-[7px] text-zinc-500 hover:text-red-600">+ ADD</button>}</div>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {(isEditing ? (editData.profile?.networks || []) : (targetUser?.profile?.networks || [])).map((net: any, i: number) => {
                                        const cfg = NETWORK_CONFIGS[net.name] || { icon: GlobeAltIcon, baseUrl: '' };
                                        return isEditing ? (<div key={i} className="bg-black/30 border border-white/10 rounded-lg p-1.5"><p className="text-[6px] text-zinc-600">{net.name}</p><input value={net.handle} onChange={e => { const n = [...editData.profile.networks]; n[i].handle = e.target.value.replace('@',''); setEditData({...editData, profile: {...editData.profile, networks: n}}); }} className="bg-transparent text-[8px] text-white w-full outline-none" /></div>) : (net.handle && <a key={i} href={`${cfg.baseUrl}${net.handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 p-1.5 bg-white/5 rounded-lg border border-white/5 hover:bg-red-600/10 transition-all"><cfg.icon className="w-2.5 h-2.5 text-zinc-500" /><span className="text-[7px] text-zinc-400 truncate">@{net.handle}</span></a>);
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2 pt-3 border-t border-white/5">
                                <h4 className="text-[8px] font-black text-white uppercase tracking-[0.3em] text-center">Master Works</h4>
                                <div className="grid grid-cols-3 gap-1">
                                    {userPosts.map((post, i) => (
                                        <div key={i} onClick={() => onOpenModal?.(userPosts, i)} className="aspect-square bg-white/5 rounded-md overflow-hidden group relative cursor-pointer border border-white/5 shadow-sm">
                                            {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center"><div className="flex gap-2 text-[7px] font-bold text-white"><span className="text-red-500">♥ {Object.keys(post.likes || {}).length}</span><span>💬 {Object.keys(post.comments || {}).length}</span></div></div>
                                        </div>
                                    ))}
                                    {userPosts.length === 0 && <div className="col-span-3 py-8 text-center opacity-10"><GalleryIcon className="w-6 h-6 mx-auto mb-1" /><p className="text-[7px] font-black uppercase tracking-[0.4em]">Empty Frequency</p></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};