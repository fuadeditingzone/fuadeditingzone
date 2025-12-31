import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push, query, orderByChild, equalTo, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { 
  CloseIcon, CheckCircleIcon, UserCircleIcon, SparklesIcon, GlobeAltIcon, 
  CopyIcon, InstagramIcon, FacebookIcon, ChevronRightIcon, TikTokIcon, 
  BehanceIcon, GalleryIcon, ChevronLeftIcon, PlayIcon, PhotoManipulationIcon, 
  SendIcon, YouTubeIcon, BriefcaseIcon, ThumbnailIcon, VfxIcon 
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

type TabType = 'posts' | 'identity' | 'credentials' | 'networks';

const NETWORK_ICONS: Record<string, any> = {
    'Facebook': FacebookIcon,
    'Instagram': InstagramIcon,
    'YouTube': YouTubeIcon,
    'TikTok': TikTokIcon,
    'Behance': BehanceIcon,
    'Portfolio': GlobeAltIcon
};

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; viewingUserId?: string | null }> = ({ isOpen, onClose, viewingUserId }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>('posts');
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

    const isViewingOther = !!viewingUserId && viewingUserId !== clerkUser?.id;
    const currentProfileId = viewingUserId || clerkUser?.id;

    useEffect(() => {
        if (isOpen && currentProfileId) {
            const userRef = ref(db, `users/${currentProfileId}`);
            const unsubUser = onValue(userRef, (snap) => {
                const data = snap.val() || {};
                setTargetUser(data);
                
                // Initialize default profile data if missing
                const initializedData = {
                    ...data,
                    profile: {
                        bio: 'Intelligence identity established.',
                        origin: 'Sylhet, Bangladesh',
                        profession: 'Visual Architecture',
                        skills: ['After Effects Master', 'Photoshop Expert', 'Premiere Pro', 'Cinema 4D', 'AI Integration', 'Color Science', 'Cinematography'],
                        experience: [
                            { role: 'Senior VFX Editor @ FEZ', years: '2020 - Present', desc: 'Leading visual synchronization for high-tier creators globally.' },
                            { role: 'Lead Graphic Architect', years: '2018 - 2020', desc: 'Crafting digital experiences.' }
                        ],
                        networks: [
                            { name: 'Facebook', url: 'https://facebook.com/fuadeditingzone' },
                            { name: 'Instagram', url: 'https://instagram.com/fuadeditingzone' },
                            { name: 'YouTube', url: 'https://youtube.com/@fuadeditingzone' },
                            { name: 'TikTok', url: 'https://tiktok.com/@fuadeditingzone' },
                            { name: 'Behance', url: 'https://behance.net/fuadeditingzone' },
                            { name: 'Portfolio', url: 'https://fuadeditingzone.pages.dev' }
                        ],
                        ...data.profile
                    }
                };
                
                if (!isEditing) setEditData(initializedData);
            });

            const unsubFollowers = onValue(ref(db, `social/${currentProfileId}/followers`), (snap) => {
              const data = snap.val() || {};
              setSocialState(prev => ({ ...prev, followers: Object.keys(data) }));
            });
            const unsubFollowing = onValue(ref(db, `social/${currentProfileId}/following`), (snap) => {
              const data = snap.val() || {};
              setSocialState(prev => ({ ...prev, following: Object.keys(data) }));
            });

            const postsQuery = query(ref(db, 'explore_posts'), orderByChild('userId'), equalTo(currentProfileId));
            const unsubPosts = onValue(postsQuery, (snap) => {
                const data = snap.val();
                setUserPosts(data ? Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) : []);
            });

            return () => {
                unsubUser();
                unsubFollowers();
                unsubFollowing();
                unsubPosts();
            };
        }
    }, [isOpen, currentProfileId, isEditing]);

    // Live list resolver
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
        } else {
            setResolvedUserList([]);
        }
    }, [userListMode, socialState.followers, socialState.following, isOpen]);

    useEffect(() => {
        if (!isViewingOther || !clerkUser || !viewingUserId) return;
        const followRef = ref(db, `social/${clerkUser.id}/following/${viewingUserId}`);
        const friendRef = ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`);
        const reqSentRef = ref(db, `social/${clerkUser.id}/requests/sent/${viewingUserId}`);
        
        onValue(followRef, (snap) => setSocialState(prev => ({ ...prev, isFollowing: snap.exists() })));
        onValue(friendRef, (snap) => {
            if (snap.exists()) setSocialState(prev => ({ ...prev, friendStatus: 'accepted' }));
            else {
              onValue(reqSentRef, (s) => setSocialState(prev => ({ ...prev, friendStatus: s.exists() ? 'requested' : 'none' })));
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
            }
        } else {
            await set(ref(db, `social/${clerkUser.id}/requests/sent/${viewingUserId}`), { timestamp: Date.now() });
            await set(ref(db, `social/${viewingUserId}/requests/received/${clerkUser.id}`), { timestamp: Date.now() });
        }
    };

    const handleSaveProfile = async () => {
        if (!clerkUser) return;
        await update(ref(db, `users/${clerkUser.id}`), editData);
        setIsEditing(false);
    };

    const isVerified = (username: string) => username === OWNER_HANDLE || username === ADMIN_HANDLE;

    if (!isLoaded || !clerkUser || !isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[2000000] flex items-center justify-center">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/98 backdrop-blur-3xl" />
                
                <motion.div 
                    initial={{ opacity: 0, y: 50 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 50 }} 
                    className="relative w-full h-full md:h-[94vh] md:max-w-6xl md:rounded-[3rem] bg-[#050505] border-white/5 border-0 md:border flex flex-col overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl flex-shrink-0">
                        <div className="flex items-center gap-4">
                            <button onClick={() => userListMode ? setUserListMode(null) : onClose()} className="p-2 rounded-full hover:bg-white/5 transition-all text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{targetUser?.username || clerkUser.username}</h2>
                                {isVerified(targetUser?.username || clerkUser.username) && <i className="fa-solid fa-circle-check text-xl verified-badge-owner"></i>}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {!isViewingOther && (
                                <button 
                                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} 
                                    className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${isEditing ? 'bg-green-600 text-white shadow-xl' : 'bg-white/5 text-zinc-400 hover:text-white'}`}
                                >
                                    {isEditing ? 'Sync Changes' : 'Edit Zone'}
                                </button>
                            )}
                            <button onClick={onClose} className="p-3 bg-red-600 rounded-full text-white shadow-xl"><CloseIcon className="w-6 h-6" /></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {/* Resolve User Lists (Followers/Following View) */}
                        <AnimatePresence>
                            {userListMode && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 100 }} 
                                    animate={{ opacity: 1, x: 0 }} 
                                    exit={{ opacity: 0, x: 100 }}
                                    className="absolute inset-0 z-[60] bg-[#050505] p-8"
                                >
                                    <div className="flex items-center gap-4 mb-10">
                                        <button onClick={() => setUserListMode(null)} className="p-2 rounded-full bg-white/5 text-white"><ChevronLeftIcon className="w-6 h-6" /></button>
                                        <h3 className="text-2xl font-black text-white uppercase tracking-widest">{userListMode} List</h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {resolvedUserList.length === 0 ? (
                                            <div className="col-span-full py-20 text-center opacity-20">
                                                <p className="text-xl font-black uppercase tracking-widest">No operators found in this sector.</p>
                                            </div>
                                        ) : (
                                            resolvedUserList.map((u, i) => (
                                                <div key={i} className="flex items-center gap-4 p-5 bg-white/5 border border-white/5 rounded-2xl">
                                                    <img src={u.avatar || u.imageUrl} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-black uppercase text-sm truncate">{u.name}</p>
                                                        <p className="text-zinc-500 font-bold text-[10px] uppercase">@{u.username}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Main Profile View */}
                        <div className="p-6 md:p-16 space-y-12">
                            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                                <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-4 p-1.5 flex-shrink-0 ${isVerified(targetUser?.username || clerkUser.username) ? 'border-red-600' : 'border-white/10'}`}>
                                    <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2rem]" alt="" />
                                </div>

                                <div className="flex-1 text-center md:text-left space-y-6">
                                    <div className="flex flex-col md:flex-row items-center gap-6">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-2">
                                                <input 
                                                    value={editData.username || ''} 
                                                    onChange={e => setEditData({...editData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                                                    placeholder="Operator Handle"
                                                    className="bg-black border border-white/10 rounded-xl px-4 py-2 text-red-500 font-black lowercase outline-none focus:border-red-600"
                                                />
                                            </div>
                                        ) : (
                                            <h3 className="text-2xl md:text-4xl font-light text-white lowercase">@{targetUser?.username || clerkUser.username}</h3>
                                        )}
                                        
                                        <div className="flex gap-3">
                                            {isViewingOther ? (
                                                <>
                                                    <button onClick={() => handleAction('follow')} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl shadow-red-600/20'}`}>
                                                        {socialState.isFollowing ? 'Following' : 'Follow'}
                                                    </button>
                                                    <button onClick={() => handleAction('friend')} className="px-8 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white">
                                                        {socialState.friendStatus === 'accepted' ? 'Linked' : socialState.friendStatus === 'pending' ? 'Accept' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}
                                                    </button>
                                                </>
                                            ) : (
                                                !isEditing && <button onClick={() => setIsEditing(true)} className="px-8 py-2.5 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg">Edit Zone</button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center md:justify-start gap-12 border-y md:border-0 border-white/5 py-4">
                                        <div className="text-center"><p className="text-2xl font-black text-white">{userPosts.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Posts</p></div>
                                        <button onClick={() => setUserListMode('followers')} className="text-center hover:scale-105 transition-transform"><p className="text-2xl font-black text-white">{socialState.followers.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Followers</p></button>
                                        <button onClick={() => setUserListMode('following')} className="text-center hover:scale-105 transition-transform"><p className="text-2xl font-black text-white">{socialState.following.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Following</p></button>
                                    </div>

                                    <div className="space-y-4">
                                        {isEditing ? (
                                            <>
                                                <input 
                                                    value={editData.name || ''} 
                                                    onChange={e => setEditData({...editData, name: e.target.value})}
                                                    placeholder="Operator Name"
                                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white font-black uppercase outline-none focus:border-red-600"
                                                />
                                                <textarea 
                                                    value={editData.profile?.bio || ''} 
                                                    onChange={e => setEditData({...editData, profile: {...editData.profile, bio: e.target.value}})}
                                                    placeholder="Signal Status / Bio"
                                                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-zinc-400 text-sm italic outline-none focus:border-red-600 h-24 resize-none"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-lg md:text-xl font-black text-white">{targetUser?.name || clerkUser.fullName}</p>
                                                <p className="text-zinc-400 text-sm md:text-base leading-relaxed italic">"{targetUser?.profile?.bio || 'Frequency synchronized.'}"</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Tabs Navigation */}
                            <div className="flex justify-center border-t border-white/5 pt-4 sticky top-0 bg-[#050505] z-10">
                                {(['posts', 'identity', 'credentials', 'networks'] as TabType[]).map(tab => (
                                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-12 py-5 text-[10px] font-black uppercase tracking-widest relative ${activeTab === tab ? 'text-white' : 'text-zinc-600'}`}>
                                        {tab === 'posts' ? 'Portfolio' : tab}
                                        {activeTab === tab && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_100px_rgba(220,38,38,0.5)]" />}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="min-h-[400px] pb-20">
                                {activeTab === 'posts' && (
                                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                                        {userPosts.length === 0 ? (
                                            <div className="col-span-full py-20 text-center flex flex-col items-center gap-4 opacity-20">
                                                <GalleryIcon className="w-16 h-16" />
                                                <p className="text-[10px] font-black uppercase tracking-widest">No Signals Captured</p>
                                            </div>
                                        ) : (
                                            userPosts.map((post, i) => (
                                                <div key={i} className="aspect-square bg-white/5 rounded-xl overflow-hidden group relative cursor-pointer border border-white/5 shadow-lg">
                                                    {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
                                                        <div className="flex gap-4">
                                                            <div className="text-[10px] font-black text-red-500"><i className="fa-solid fa-heart"></i> {Object.keys(post.likes || {}).length}</div>
                                                            <div className="text-[10px] font-black text-white"><i className="fa-solid fa-comment"></i> {Object.keys(post.comments || {}).length}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                                
                                {activeTab === 'identity' && (
                                    <div className="max-w-3xl mx-auto space-y-8">
                                        <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/10 italic text-xl md:text-3xl text-zinc-300 font-light leading-relaxed text-center">
                                            "{targetUser?.profile?.bio || 'Intelligence identity established.'}"
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-6 bg-[#080808] border border-white/5 rounded-2xl">
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 block">Operator Origin</span>
                                                {isEditing ? (
                                                    <input value={editData.profile?.origin || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, origin: e.target.value}})} className="w-full bg-black border border-white/5 p-2 rounded text-white" />
                                                ) : (
                                                    <p className="text-white font-bold">{targetUser?.profile?.origin || 'Sylhet, Bangladesh'}</p>
                                                )}
                                            </div>
                                            <div className="p-6 bg-[#080808] border border-white/5 rounded-2xl">
                                                <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-2 block">Current Focus</span>
                                                {isEditing ? (
                                                    <input value={editData.profile?.profession || ''} onChange={e => setEditData({...editData, profile: {...editData.profile, profession: e.target.value}})} className="w-full bg-black border border-white/5 p-2 rounded text-white" />
                                                ) : (
                                                    <p className="text-white font-bold">{targetUser?.profile?.profession || 'Visual Architecture'}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'credentials' && (
                                    <div className="max-w-4xl mx-auto space-y-12">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <BriefcaseIcon className="w-4 h-4 text-red-600" /> Professional Experience
                                                </h4>
                                                <div className="space-y-4">
                                                    {(isEditing ? (editData.profile?.experience || []) : (targetUser?.profile?.experience || [])).map((exp: any, i: number) => (
                                                        <div key={i} className="p-5 bg-white/5 rounded-2xl border-l-2 border-red-600 relative">
                                                            {isEditing ? (
                                                                <div className="space-y-2">
                                                                    <input value={exp.role} onChange={e => {
                                                                        const newExp = [...editData.profile.experience];
                                                                        newExp[i].role = e.target.value;
                                                                        setEditData({...editData, profile: {...editData.profile, experience: newExp}});
                                                                    }} className="w-full bg-black border border-white/5 p-1 rounded text-xs text-white uppercase font-black" placeholder="Role" />
                                                                    <input value={exp.years} onChange={e => {
                                                                        const newExp = [...editData.profile.experience];
                                                                        newExp[i].years = e.target.value;
                                                                        setEditData({...editData, profile: {...editData.profile, experience: newExp}});
                                                                    }} className="w-full bg-black border border-white/5 p-1 rounded text-[10px] text-zinc-500 uppercase" placeholder="Years" />
                                                                    <button onClick={() => {
                                                                        const newExp = editData.profile.experience.filter((_: any, idx: number) => idx !== i);
                                                                        setEditData({...editData, profile: {...editData.profile, experience: newExp}});
                                                                    }} className="absolute top-2 right-2 text-red-500">×</button>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <p className="text-white font-black text-sm uppercase">{exp.role}</p>
                                                                    <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">{exp.years}</p>
                                                                    <p className="text-zinc-400 text-xs mt-3 leading-relaxed font-medium">{exp.desc}</p>
                                                                </>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {isEditing && (
                                                        <button onClick={() => setEditData({...editData, profile: {...editData.profile, experience: [...(editData.profile.experience || []), {role: '', years: '', desc: ''}]}})} className="w-full py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase text-zinc-500">+ Add Position</button>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="space-y-6">
                                                <h4 className="text-xs font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                                    <SparklesIcon className="w-4 h-4 text-red-600" /> Verified Skillsets
                                                </h4>
                                                <div className="flex flex-wrap gap-3">
                                                    {(isEditing ? (editData.profile?.skills || []) : (targetUser?.profile?.skills || [])).map((skill: string, i: number) => (
                                                        <span key={i} className="px-5 py-2.5 bg-black border border-white/5 text-zinc-300 font-black text-[9px] uppercase tracking-widest rounded-xl hover:border-red-600/50 transition-colors relative">
                                                            {skill}
                                                            {isEditing && <button onClick={() => setEditData({...editData, profile: {...editData.profile, skills: editData.profile.skills.filter((_: any, idx: number) => idx !== i)}})} className="ml-2 text-red-500">×</button>}
                                                        </span>
                                                    ))}
                                                    {isEditing && (
                                                        <button onClick={() => {
                                                            const s = window.prompt('Enter skill name:');
                                                            if (s) setEditData({...editData, profile: {...editData.profile, skills: [...(editData.profile.skills || []), s]}});
                                                        }} className="px-5 py-2.5 bg-white/5 text-zinc-500 font-black text-[9px] uppercase rounded-xl">+ Add Skill</button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'networks' && (
                                    <div className="max-w-2xl mx-auto space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(isEditing ? (editData.profile?.networks || []) : (targetUser?.profile?.networks || [])).map((net: any, i: number) => {
                                                const Icon = NETWORK_ICONS[net.name] || GlobeAltIcon;
                                                return (
                                                    <div key={i} className="group relative flex items-center gap-4 p-5 bg-[#080808] border border-white/5 rounded-2xl hover:border-red-600/30 hover:bg-white/5 transition-all">
                                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                                                            <Icon className="w-6 h-6 text-zinc-400 group-hover:text-red-500" />
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            {isEditing ? (
                                                                <div className="space-y-1">
                                                                    <input value={net.name} onChange={e => {
                                                                        const newNet = [...editData.profile.networks];
                                                                        newNet[i].name = e.target.value;
                                                                        setEditData({...editData, profile: {...editData.profile, networks: newNet}});
                                                                    }} className="w-full bg-black border border-white/5 p-1 rounded text-[10px] text-white font-black uppercase" />
                                                                    <input value={net.url} onChange={e => {
                                                                        const newNet = [...editData.profile.networks];
                                                                        newNet[i].url = e.target.value;
                                                                        setEditData({...editData, profile: {...editData.profile, networks: newNet}});
                                                                    }} className="w-full bg-black border border-white/5 p-1 rounded text-[8px] text-zinc-500" />
                                                                </div>
                                                            ) : (
                                                                <a href={net.url} target="_blank" rel="noopener noreferrer" className="block">
                                                                    <p className="text-white font-black uppercase text-xs tracking-widest">{net.name}</p>
                                                                    <p className="text-zinc-600 text-[8px] font-bold uppercase truncate">{net.url.replace('https://', '')}</p>
                                                                </a>
                                                            )}
                                                        </div>
                                                        {isEditing ? (
                                                            <button onClick={() => setEditData({...editData, profile: {...editData.profile, networks: editData.profile.networks.filter((_: any, idx: number) => idx !== i)}})} className="text-red-500">×</button>
                                                        ) : <ChevronRightIcon className="w-4 h-4 text-zinc-800 group-hover:text-white" />}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {isEditing && (
                                            <button onClick={() => setEditData({...editData, profile: {...editData.profile, networks: [...(editData.profile.networks || []), {name: 'New Link', url: 'https://'}]}})} className="w-full py-3 bg-white/5 rounded-2xl text-[10px] font-black uppercase text-zinc-500">+ Add Network Link</button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};