import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push, query, orderByChild, equalTo, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { 
  CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, 
  CopyIcon, InstagramIcon, FacebookIcon, ChevronRightIcon, TikTokIcon, 
  BehanceIcon, GalleryIcon, ChevronLeftIcon, PlayIcon, PhotoManipulationIcon, 
  SendIcon, YouTubeIcon, BriefcaseIcon, ThumbnailIcon, VfxIcon, EyeIcon, ChatBubbleIcon
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
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, viewingUserId, onOpenModal, onMessageUser }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [targetUser, setTargetUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<any>({});
    const [userListMode, setUserListMode] = useState<'followers' | 'following' | null>(null);
    const [resolvedUserList, setResolvedUserList] = useState<any[]>([]);
    
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
                        bio: 'Identity synchronized with the FEZ network.',
                        origin: 'Location Hidden',
                        profession: 'Visual Architecture',
                        skills: ['VFX Master', 'Graphic Design'],
                        networks: [
                            { name: 'Facebook', handle: '' },
                            { name: 'Instagram', handle: '' },
                            { name: 'YouTube', handle: '' },
                            { name: 'TikTok', handle: '' },
                            { name: 'Behance', handle: '' }
                        ],
                        ...data.profile
                    }
                };
                
                if (!isEditing) setEditData(initializedData);
            });

            onValue(ref(db, `social/${currentProfileId}/followers`), (snap) => {
              const data = snap.val() || {};
              setSocialState(prev => ({ ...prev, followers: Object.keys(data) }));
            });
            onValue(ref(db, `social/${currentProfileId}/following`), (snap) => {
              const data = snap.val() || {};
              setSocialState(prev => ({ ...prev, following: Object.keys(data) }));
            });

            const postsQuery = query(ref(db, 'explore_posts'), orderByChild('userId'), equalTo(currentProfileId));
            onValue(postsQuery, (snap) => {
                const data = snap.val();
                setUserPosts(data ? Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) : []);
            });
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
        onValue(ref(db, `social/${clerkUser.id}/following/${viewingUserId}`), (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
        onValue(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`), (snap) => {
            if (snap.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'accepted' }));
            else {
              onValue(ref(db, `social/${clerkUser.id}/requests/sent/${viewingUserId}`), (s1) => {
                if (s1.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'requested' }));
                else {
                    onValue(ref(db, `social/${clerkUser.id}/requests/received/${viewingUserId}`), (s2) => {
                        setSocialState(prev => ({ ...prev, friendStatus: s2.exists() ? 'pending' : 'none' }));
                    });
                }
              });
            }
        });
    }, [isViewingOther, clerkUser, viewingUserId]);

    const handleAction = async (type: 'follow' | 'friend') => {
        if (!clerkUser || !viewingUserId) return;
        if (type === 'follow') {
            const path = `social/${clerkUser.id}/following/${viewingUserId}`;
            const followerPath = `social/${viewingUserId}/followers/${clerkUser.id}`;
            if (socialState.isFollowing) {
                await remove(ref(db, path));
                await remove(ref(db, followerPath));
            } else {
                await set(ref(db, path), true);
                await set(ref(db, followerPath), true);
                await push(ref(db, `notifications/${viewingUserId}`), {
                    type: 'follow', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false
                });
            }
        } else {
            if (socialState.friendStatus === 'accepted') {
                if (window.confirm(`Unfriend @${targetUser?.username}?`)) {
                    await remove(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`));
                    await remove(ref(db, `social/${viewingUserId}/friends/${clerkUser.id}`));
                    setSocialState(prev => ({ ...prev, friendStatus: 'none' }));
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
                await set(ref(db, `social/${viewingUserId}/requests/received/${clerkUser.id}`), { timestamp: Date.now() });
                await push(ref(db, `notifications/${viewingUserId}`), {
                    type: 'friend_request', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false
                });
            }
        }
    };

    const handleSaveProfile = async () => {
        if (!isMyOwnProfile) return;
        await update(ref(db, `users/${clerkUser?.id}`), editData);
        setIsEditing(false);
    };

    const getVerifiedBadge = (username: string) => {
        if (username === OWNER_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-owner ml-1 text-sm"></i>;
        if (username === ADMIN_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-admin ml-1 text-sm"></i>;
        return null;
    };

    if (!isLoaded || !clerkUser || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000000] flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="relative w-full h-full md:h-[94vh] md:max-w-4xl md:rounded-[3rem] bg-[#050505] border-white/5 border-0 md:border flex flex-col overflow-hidden shadow-2xl">
                    
                    {/* Header */}
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => userListMode ? setUserListMode(null) : onClose()} className="p-2 rounded-full hover:bg-white/5 transition-all text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                            <div className="flex items-center">
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">{targetUser?.username || clerkUser.username}</h2>
                                {getVerifiedBadge(targetUser?.username || clerkUser.username)}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {isMyOwnProfile && (
                                <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white shadow-xl' : 'bg-white/5 text-zinc-400 hover:text-white'}`}>
                                    {isEditing ? 'Sync Changes' : 'Edit Profile'}
                                </button>
                            )}
                            <button onClick={onClose} className="p-3 bg-red-600 rounded-full text-white shadow-xl"><CloseIcon className="w-5 h-5" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <AnimatePresence>
                            {userListMode && (
                                <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 100 }} className="absolute inset-0 z-[60] bg-[#050505] p-8">
                                    <div className="flex items-center gap-4 mb-10">
                                        <button onClick={() => setUserListMode(null)} className="p-2 rounded-full bg-white/5 text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-widest">{userListMode}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {resolvedUserList.map((u, i) => (
                                            <div key={i} className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl">
                                                <img src={u.avatar || u.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white font-black uppercase text-sm truncate">{u.name}</p>
                                                    <p className="text-zinc-500 font-bold text-[10px] uppercase">@{u.username}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="p-6 md:p-10 space-y-12">
                            {/* Profile Info Row */}
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                                <div className={`w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] border-4 p-1.5 flex-shrink-0 ${targetUser?.username === OWNER_HANDLE ? 'border-red-600 shadow-[0_0_20px_rgba(255,0,0,0.3)]' : targetUser?.username === ADMIN_HANDLE ? 'border-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : 'border-white/10'}`}>
                                    <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2rem]" alt="" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
                                        <h3 className="text-2xl font-light text-white lowercase">@{targetUser?.username || clerkUser.username}</h3>
                                        <div className="flex gap-2">
                                            {isViewingOther ? (
                                                <>
                                                    <button onClick={() => handleAction('follow')} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl shadow-red-600/20'}`}>
                                                        {socialState.isFollowing ? 'Following' : 'Follow'}
                                                    </button>
                                                    <button onClick={() => handleAction('friend')} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${socialState.friendStatus === 'accepted' ? 'bg-green-600/20 text-green-500 border border-green-600/30' : 'bg-white/5 border border-white/10 text-white'}`}>
                                                        {socialState.friendStatus === 'accepted' ? 'Friends' : socialState.friendStatus === 'pending' ? 'Accept' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}
                                                    </button>
                                                    <button onClick={() => onMessageUser?.(viewingUserId!)} className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white flex items-center gap-2 hover:bg-white/10">
                                                        <ChatBubbleIcon className="w-4 h-4" /> Message
                                                    </button>
                                                </>
                                            ) : (
                                                !isEditing && <button onClick={() => setIsEditing(true)} className="px-8 py-2.5 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white">Edit Profile</button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-center md:justify-start gap-10 mb-6">
                                        <div className="text-center md:text-left"><p className="text-xl font-black text-white">{userPosts.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Posts</p></div>
                                        <button onClick={() => setUserListMode('followers')} className="text-center md:text-left"><p className="text-xl font-black text-white">{socialState.followers.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Followers</p></button>
                                        <button onClick={() => setUserListMode('following')} className="text-center md:text-left"><p className="text-xl font-black text-white">{socialState.following.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Following</p></button>
                                    </div>
                                    <div className="space-y-3">
                                        {isEditing ? (
                                            <>
                                                <input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Operator Identity" className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-white font-black uppercase outline-none focus:border-red-600" />
                                                <textarea value={editData.profile?.bio || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, bio: e.target.value}})} placeholder="Signature Status..." className="w-full bg-black border border-white/10 rounded-xl px-4 py-2.5 text-zinc-400 text-xs italic outline-none h-20 resize-none" />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-sm font-black text-white uppercase tracking-wider">{targetUser?.name || clerkUser.fullName}</p>
                                                <p className="text-zinc-400 text-xs italic leading-relaxed">"{targetUser?.profile?.bio || 'No active status signal.'}"</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Identity Section */}
                            <div className="bg-white/5 rounded-[2rem] border border-white/5 p-8 space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-5">
                                        <h4 className="text-3xl font-black text-red-500 uppercase tracking-tight">Geographical Origin</h4>
                                        {isEditing ? (
                                            <input value={editData.profile?.origin || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, origin: e.target.value}})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                                        ) : (
                                            <p className="text-white font-bold text-lg">{targetUser?.profile?.origin || 'Location Classified'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-5">
                                        <h4 className="text-3xl font-black text-red-500 uppercase tracking-tight">Core Focus</h4>
                                        {isEditing ? (
                                            <input value={editData.profile?.profession || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, profession: e.target.value}})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white text-sm" />
                                        ) : (
                                            <p className="text-white font-bold text-lg">{targetUser?.profile?.profession || 'Visual Artist'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-8 pt-10 border-t border-white/5">
                                    <h4 className="text-3xl font-black text-red-500 uppercase tracking-tight">Professional Skillset</h4>
                                    <div className="flex flex-wrap gap-3">
                                        {(isEditing ? (editData.profile?.skills || []) : (targetUser?.profile?.skills || [])).map((s: string, i: number) => (
                                            <span key={i} className="px-5 py-3 bg-black border border-white/10 rounded-xl text-[10px] font-black text-zinc-300 uppercase tracking-widest flex items-center gap-2">
                                                {s} {isEditing && <button onClick={() => setEditData({...editData, profile: {...editData.profile, skills: editData.profile.skills.filter((_:any,idx:number)=>idx!==i)}})} className="text-red-500 font-bold ml-1 hover:text-white transition-colors">×</button>}
                                            </span>
                                        ))}
                                        {isEditing && <button onClick={() => { const s = window.prompt("Enter core capability:"); if(s) setEditData({...editData, profile: {...editData.profile, skills: [...(editData.profile.skills||[]), s]}}); }} className="px-5 py-3 bg-red-600/10 border border-red-600/20 text-red-500 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all">+ Add New Skill</button>}
                                    </div>
                                </div>

                                <div className="space-y-8 pt-10 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-3xl font-black text-red-500 uppercase tracking-tight">Network Infrastructure</h4>
                                        {isEditing && (
                                            <button onClick={() => {
                                                const name = window.prompt("Platform (Facebook, Instagram, YouTube, TikTok, Behance):");
                                                if (name && NETWORK_CONFIGS[name]) {
                                                    const newNets = [...(editData.profile.networks || []), { name, handle: '' }];
                                                    setEditData({...editData, profile: {...editData.profile, networks: newNets}});
                                                }
                                            }} className="text-[10px] font-black text-zinc-500 uppercase hover:text-red-500 transition-colors">+ Add Network</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {(isEditing ? (editData.profile?.networks || []) : (targetUser?.profile?.networks || [])).map((net: any, i: number) => {
                                            const cfg = NETWORK_CONFIGS[net.name] || { icon: GlobeAltIcon, baseUrl: '' };
                                            const Icon = cfg.icon;
                                            return (
                                                <div key={i} className="flex flex-col gap-2 relative group">
                                                    {isEditing ? (
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex-1 space-y-2">
                                                                <p className="text-[9px] font-black text-zinc-600 uppercase ml-2">{net.name} Handle</p>
                                                                <input value={net.handle} onChange={e => {
                                                                    const newNets = [...editData.profile.networks];
                                                                    newNets[i].handle = e.target.value.replace('@', '');
                                                                    setEditData({...editData, profile: {...editData.profile, networks: newNets}});
                                                                }} placeholder={`@username`} className="w-full bg-black border border-white/10 rounded-xl p-3 text-[12px] text-white focus:border-red-600 outline-none" />
                                                            </div>
                                                            <button onClick={() => { const newNets = editData.profile.networks.filter((_:any,idx:number)=>idx!==i); setEditData({...editData, profile: {...editData.profile, networks: newNets}}); }} className="p-2 text-red-500 mt-6">×</button>
                                                        </div>
                                                    ) : (
                                                        net.handle && (
                                                            <a href={`${cfg.baseUrl}${net.handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-black/40 rounded-2xl hover:bg-red-600/10 transition-all border border-white/5 group">
                                                                <Icon className="w-6 h-6 text-zinc-500 group-hover:text-red-500" />
                                                                <div className="min-w-0">
                                                                    <span className="text-[10px] font-black text-zinc-400 uppercase group-hover:text-white block">{net.name}</span>
                                                                    <span className="text-[9px] text-zinc-600 block truncate">@{net.handle}</span>
                                                                </div>
                                                            </a>
                                                        )
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Posts Section */}
                            <div className="space-y-8">
                                <h4 className="text-3xl font-black text-white uppercase tracking-tight text-center">Protocol Works</h4>
                                <div className="grid grid-cols-3 gap-2 md:gap-4">
                                    {userPosts.map((post, i) => (
                                        <div key={i} onClick={() => onOpenModal?.(userPosts, i)} className="aspect-square bg-white/5 rounded-xl overflow-hidden group relative cursor-pointer border border-white/5 shadow-lg">
                                            {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center">
                                                <div className="flex gap-4 text-[10px] font-black"><span className="text-red-500">♥ {Object.keys(post.likes || {}).length}</span><span>💬 {Object.keys(post.comments || {}).length}</span></div>
                                                <EyeIcon className="w-6 h-6 mt-3 text-white/40" />
                                            </div>
                                        </div>
                                    ))}
                                    {userPosts.length === 0 && <div className="col-span-3 py-24 text-center opacity-10"><GalleryIcon className="w-20 h-20 mx-auto mb-6" /><p className="text-[12px] font-black uppercase tracking-[0.5em]">No Visual Signals</p></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};