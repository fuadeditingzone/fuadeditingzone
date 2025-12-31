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
        if (username === OWNER_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-owner ml-1 text-xs"></i>;
        if (username === ADMIN_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-admin ml-1 text-xs"></i>;
        return null;
    };

    if (!isLoaded || !clerkUser || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000000] flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="relative w-full h-full md:h-fit md:max-h-[92vh] md:max-w-3xl md:rounded-[2.5rem] bg-[#050505] border-white/5 border-0 md:border flex flex-col overflow-hidden shadow-2xl">
                    
                    {/* Compact Header */}
                    <div className="p-4 md:p-6 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <button onClick={() => userListMode ? setUserListMode(null) : onClose()} className="p-1.5 rounded-full hover:bg-white/5 transition-all text-white"><ChevronLeftIcon className="w-5 h-5" /></button>
                            <div className="flex items-center">
                                <h2 className="text-base md:text-lg font-light text-white uppercase tracking-tight">{targetUser?.username || clerkUser.username}</h2>
                                {getVerifiedBadge(targetUser?.username || clerkUser.username)}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isMyOwnProfile && (
                                <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-4 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-white/5 text-zinc-400 hover:text-white border border-white/5'}`}>
                                    {isEditing ? 'Sync' : 'Edit'}
                                </button>
                            )}
                            <button onClick={onClose} className="p-2 bg-red-600 rounded-full text-white shadow-lg"><CloseIcon className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        <div className="p-5 md:p-8 space-y-8">
                            {/* Profile Info Row */}
                            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                                <div className={`w-28 h-28 md:w-32 md:h-32 rounded-[2rem] border-2 p-1 flex-shrink-0 ${targetUser?.username === OWNER_HANDLE ? 'border-red-600/50' : targetUser?.username === ADMIN_HANDLE ? 'border-blue-600/50' : 'border-white/10'}`}>
                                    <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[1.8rem]" alt="" />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-col md:flex-row items-center gap-3 mb-4">
                                        <h3 className="text-xl font-light text-white lowercase">@{targetUser?.username || clerkUser.username}</h3>
                                        <div className="flex gap-2">
                                            {isViewingOther ? (
                                                <>
                                                    <button onClick={() => handleAction('follow')} className={`px-5 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-md'}`}>
                                                        {socialState.isFollowing ? 'Following' : 'Follow'}
                                                    </button>
                                                    <button onClick={() => handleAction('friend')} className={`px-5 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest transition-all ${socialState.friendStatus === 'accepted' ? 'bg-green-600/20 text-green-500 border border-green-600/30' : 'bg-white/5 border border-white/10 text-white'}`}>
                                                        {socialState.friendStatus === 'accepted' ? 'Friends' : socialState.friendStatus === 'pending' ? 'Accept' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}
                                                    </button>
                                                    <button onClick={() => onMessageUser?.(viewingUserId!)} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-lg font-bold text-[9px] uppercase tracking-widest text-white hover:bg-white/10">
                                                        Message
                                                    </button>
                                                </>
                                            ) : (
                                                !isEditing && <button onClick={() => setIsEditing(true)} className="px-5 py-1.5 bg-white/10 rounded-lg font-bold text-[9px] uppercase tracking-widest text-white">Edit Profile</button>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-center md:justify-start gap-8 mb-4">
                                        <div className="text-center md:text-left"><p className="text-lg font-bold text-white">{userPosts.length}</p><p className="text-[8px] text-zinc-500 uppercase font-black">Posts</p></div>
                                        <button onClick={() => setUserListMode('followers')} className="text-center md:text-left"><p className="text-lg font-bold text-white">{socialState.followers.length}</p><p className="text-[8px] text-zinc-500 uppercase font-black">Followers</p></button>
                                        <button onClick={() => setUserListMode('following')} className="text-center md:text-left"><p className="text-lg font-bold text-white">{socialState.following.length}</p><p className="text-[8px] text-zinc-500 uppercase font-black">Following</p></button>
                                    </div>
                                    <div className="space-y-2">
                                        {isEditing ? (
                                            <>
                                                <input value={editData.name || ''} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Display Identity" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white font-medium text-xs outline-none focus:border-red-600" />
                                                <textarea value={editData.profile?.bio || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, bio: e.target.value}})} placeholder="Bio signal..." className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-zinc-400 text-[11px] italic outline-none h-16 resize-none" />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-xs font-bold text-white uppercase tracking-wider">{targetUser?.name || clerkUser.fullName}</p>
                                                <p className="text-zinc-400 text-[11px] font-light italic leading-relaxed">"{targetUser?.profile?.bio || 'No active status signal.'}"</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Identity Compressed Section */}
                            <div className="bg-white/5 rounded-[1.5rem] border border-white/5 p-6 space-y-8">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-light text-red-500 uppercase tracking-widest">Location</h4>
                                        {isEditing ? (
                                            <input value={editData.profile?.origin || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, origin: e.target.value}})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-[11px]" />
                                        ) : (
                                            <p className="text-white font-medium text-xs">{targetUser?.profile?.origin || 'Location Classified'}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-light text-red-500 uppercase tracking-widest">Expertise</h4>
                                        {isEditing ? (
                                            <input value={editData.profile?.profession || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, profession: e.target.value}})} className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-white text-[11px]" />
                                        ) : (
                                            <p className="text-white font-medium text-xs">{targetUser?.profile?.profession || 'Visual Artist'}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <h4 className="text-sm font-light text-red-500 uppercase tracking-widest">Skills</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(isEditing ? (editData.profile?.skills || []) : (targetUser?.profile?.skills || [])).map((s: string, i: number) => (
                                            <span key={i} className="px-3 py-1.5 bg-black border border-white/10 rounded-lg text-[9px] font-medium text-zinc-300 uppercase tracking-widest flex items-center gap-1.5">
                                                {s} {isEditing && <button onClick={() => setEditData({...editData, profile: {...editData.profile, skills: editData.profile.skills.filter((_:any,idx:number)=>idx!==i)}})} className="text-red-500 font-bold ml-0.5">×</button>}
                                            </span>
                                        ))}
                                        {isEditing && <button onClick={() => { const s = window.prompt("Enter core capability:"); if(s) setEditData({...editData, profile: {...editData.profile, skills: [...(editData.profile.skills||[]), s]}}); }} className="px-3 py-1.5 bg-red-600/10 border border-red-600/20 text-red-500 rounded-lg text-[9px] font-bold uppercase">+ Add</button>}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-sm font-light text-red-500 uppercase tracking-widest">Links & Socials</h4>
                                        {isMyOwnProfile && isEditing && (
                                            <button onClick={() => {
                                                const name = window.prompt("Platform (Facebook, Instagram, YouTube, TikTok, Behance):");
                                                if (name && NETWORK_CONFIGS[name]) {
                                                    const newNets = [...(editData.profile.networks || []), { name, handle: '' }];
                                                    setEditData({...editData, profile: {...editData.profile, networks: newNets}});
                                                }
                                            }} className="text-[9px] font-bold text-zinc-500 uppercase hover:text-red-500 transition-colors">+ Add</button>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {(isEditing ? (editData.profile?.networks || []) : (targetUser?.profile?.networks || [])).map((net: any, i: number) => {
                                            const cfg = NETWORK_CONFIGS[net.name] || { icon: GlobeAltIcon, baseUrl: '' };
                                            const Icon = cfg.icon;
                                            return (
                                                <div key={i} className="flex flex-col gap-1 relative group">
                                                    {isEditing ? (
                                                        <div className="flex gap-2 items-center">
                                                            <div className="flex-1 space-y-1">
                                                                <p className="text-[8px] font-bold text-zinc-600 uppercase ml-1">{net.name}</p>
                                                                <input value={net.handle} onChange={e => {
                                                                    const newNets = [...editData.profile.networks];
                                                                    newNets[i].handle = e.target.value.replace('@', '');
                                                                    setEditData({...editData, profile: {...editData.profile, networks: newNets}});
                                                                }} placeholder={`@handle`} className="w-full bg-black border border-white/10 rounded-lg p-2 text-[10px] text-white focus:border-red-600 outline-none" />
                                                            </div>
                                                            <button onClick={() => { const newNets = editData.profile.networks.filter((_:any,idx:number)=>idx!==i); setEditData({...editData, profile: {...editData.profile, networks: newNets}}); }} className="p-1 text-red-500 mt-4">×</button>
                                                        </div>
                                                    ) : (
                                                        net.handle && (
                                                            <a href={`${cfg.baseUrl}${net.handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-black/40 rounded-xl hover:bg-red-600/10 transition-all border border-white/5 group">
                                                                <Icon className="w-4 h-4 text-zinc-500 group-hover:text-red-500" />
                                                                <div className="min-w-0">
                                                                    <span className="text-[9px] font-bold text-zinc-400 uppercase group-hover:text-white block">{net.name}</span>
                                                                    <span className="text-[8px] text-zinc-600 block truncate">@{net.handle}</span>
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
                            <div className="space-y-4">
                                <h4 className="text-base font-light text-white uppercase tracking-widest text-center">Protocol Works</h4>
                                <div className="grid grid-cols-3 gap-1.5 md:gap-3">
                                    {userPosts.map((post, i) => (
                                        <div key={i} onClick={() => onOpenModal?.(userPosts, i)} className="aspect-square bg-white/5 rounded-lg overflow-hidden group relative cursor-pointer border border-white/5 shadow-md">
                                            {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center">
                                                <div className="flex gap-3 text-[9px] font-bold"><span className="text-red-500">♥ {Object.keys(post.likes || {}).length}</span><span>💬 {Object.keys(post.comments || {}).length}</span></div>
                                            </div>
                                        </div>
                                    ))}
                                    {userPosts.length === 0 && <div className="col-span-3 py-16 text-center opacity-10"><GalleryIcon className="w-12 h-12 mx-auto mb-4" /><p className="text-[10px] font-bold uppercase tracking-[0.3em]">No Visual Signals</p></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};