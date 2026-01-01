import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, update, onValue, set, remove, push, query, orderByChild, equalTo, get } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { 
  CloseIcon, GlobeAltIcon, ChevronLeftIcon, InstagramIcon, FacebookIcon, 
  YouTubeIcon, TikTokIcon, BehanceIcon, GalleryIcon, CopyIcon, SparklesIcon, CheckCircleIcon, ChatBubbleIcon
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
    const [copyToast, setCopyToast] = useState(false);
    
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
                        bio: 'Identity active on FEZ Network.',
                        origin: 'Sylhet, BD',
                        profession: 'Creative Architect',
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
            const fPath = `social/${viewingUserId}/followers/${clerkUser.id}`;
            if (socialState.isFollowing) { await remove(ref(db, path)); await remove(ref(db, fPath)); }
            else { await set(ref(db, path), true); await set(ref(db, fPath), true); await push(ref(db, `notifications/${viewingUserId}`), { type: 'follow', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false }); }
        } else {
            if (socialState.friendStatus === 'accepted') { if (window.confirm(`Unfriend @${targetUser?.username}?`)) { await remove(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`)); await remove(ref(db, `social/${viewingUserId}/friends/${clerkUser.id}`)); } }
            else if (socialState.friendStatus === 'pending') { await remove(ref(db, `social/${clerkUser.id}/requests/received/${viewingUserId}`)); await remove(ref(db, `social/${viewingUserId}/requests/sent/${clerkUser.id}`)); await set(ref(db, `social/${clerkUser.id}/friends/${viewingUserId}`), true); await set(ref(db, `social/${viewingUserId}/friends/${clerkUser.id}`), true); await push(ref(db, `notifications/${viewingUserId}`), { type: 'friend_accepted', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false }); }
            else if (socialState.friendStatus === 'none') { await set(ref(db, `social/${clerkUser.id}/requests/sent/${viewingUserId}`), { timestamp: Date.now() }); await set(ref(db, `social/${clerkUser.id}/requests/received/${clerkUser.id}`), { timestamp: Date.now() }); await push(ref(db, `notifications/${viewingUserId}`), { type: 'friend_request', fromId: clerkUser.id, fromName: clerkUser.username || clerkUser.fullName, fromAvatar: clerkUser.imageUrl, timestamp: Date.now(), read: false }); }
        }
    };

    const handleCopyProfile = () => {
        const username = targetUser?.username || clerkUser?.username;
        const url = `${window.location.origin}/@${username}`;
        navigator.clipboard.writeText(url);
        setCopyToast(true);
        setTimeout(() => setCopyToast(false), 2000);
    };

    const handleSaveProfile = async () => { if (isMyOwnProfile) { await update(ref(db, `users/${clerkUser?.id}`), editData); setIsEditing(false); } };
    const getVerifiedBadge = (u: string) => (u === OWNER_HANDLE ? <i className="fa-solid fa-circle-check verified-badge-owner ml-1 text-sm"></i> : u === ADMIN_HANDLE ? <i className="fa-solid fa-circle-check verified-badge-admin ml-1 text-sm"></i> : null);

    if (!isOpen || !isLoaded || !clerkUser) return null;

    return (
        <AnimatePresence>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                className="fixed inset-0 z-[1000000] bg-black overflow-y-auto no-scrollbar"
            >
                <div className="min-h-screen bg-black flex flex-col items-center">
                    {/* Immersive Header Background */}
                    <div className="w-full h-[250px] md:h-[400px] relative bg-[#050505] overflow-hidden border-b border-white/5">
                        <div className="absolute inset-0 opacity-20 grayscale pointer-events-none">
                            <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover blur-2xl" alt="" />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                        
                        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-20">
                            <button onClick={onClose} className="p-3 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-white hover:bg-red-600 transition-all shadow-2xl active:scale-90">
                                <ChevronLeftIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Profile Stats Floating Container */}
                    <div className="w-full max-w-5xl px-4 -mt-32 md:-mt-48 relative z-10 pb-20">
                        <div className="bg-[#0c0c0c] border border-white/10 rounded-[2.5rem] p-6 md:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] backdrop-blur-xl">
                            <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mb-12">
                                <div className={`w-32 h-32 md:w-44 md:h-44 rounded-[2.5rem] border-4 p-1 flex-shrink-0 -mt-16 md:-mt-32 shadow-2xl relative group ${targetUser?.username === OWNER_HANDLE ? 'border-red-600' : targetUser?.username === ADMIN_HANDLE ? 'border-blue-600' : 'border-white/10'}`}>
                                    <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2.2rem]" alt="" />
                                    {isMyOwnProfile && (
                                        <div className="absolute inset-0 bg-black/60 rounded-[2.2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
                                            <span className="text-[10px] font-black uppercase text-white">Change Avatar</span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 text-center md:text-left space-y-4">
                                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight uppercase">
                                                {targetUser?.username || clerkUser.username}
                                                {getVerifiedBadge(targetUser?.username || clerkUser.username)}
                                            </h1>
                                            <button onClick={handleCopyProfile} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-zinc-500 hover:text-red-500 transition-colors" title="Copy Profile Link">
                                                <CopyIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <div className="flex justify-center md:justify-start gap-2">
                                            {isViewingOther ? (
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => handleAction('follow')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl ${socialState.isFollowing ? 'bg-white/5 border border-white/10 text-white' : 'bg-red-600 text-white hover:bg-red-700'}`}>
                                                        {socialState.isFollowing ? 'Following' : 'Follow'}
                                                    </button>
                                                    <button onClick={() => handleAction('friend')} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${socialState.friendStatus === 'accepted' ? 'bg-green-600/10 border border-green-600/20 text-green-500' : 'bg-white/5 border border-white/10 text-white'}`}>
                                                        {socialState.friendStatus === 'accepted' ? 'Friends' : socialState.friendStatus === 'pending' ? 'Accept Request' : socialState.friendStatus === 'requested' ? 'Pending Signal' : 'Request Sync'}
                                                    </button>
                                                    <button onClick={() => onMessageUser?.(viewingUserId!)} className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-white">
                                                        <ChatBubbleIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)} className={`px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all ${isEditing ? 'bg-green-600 text-white' : 'bg-red-600 text-white shadow-xl hover:bg-red-700'}`}>
                                                    {isEditing ? 'Sync Changes' : 'Update Profile'}
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-center md:justify-start gap-10">
                                        <div className="text-center md:text-left"><p className="text-xl md:text-2xl font-black text-white leading-none">{userPosts.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Posts</p></div>
                                        <div className="text-center md:text-left"><p className="text-xl md:text-2xl font-black text-white leading-none">{socialState.followers.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Followers</p></div>
                                        <div className="text-center md:text-left"><p className="text-xl md:text-2xl font-black text-white leading-none">{socialState.following.length}</p><p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Following</p></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 border-t border-white/5 pt-12">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Biography</h4>
                                        {isEditing ? (
                                            <textarea value={editData.profile?.bio} onChange={e => setEditData({...editData, profile: {...editData.profile, bio: e.target.value}})} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-white outline-none focus:border-red-600 resize-none h-32 font-sans" />
                                        ) : (
                                            <p className="text-sm text-zinc-400 font-medium leading-relaxed italic no-clip">
                                                "{targetUser?.profile?.bio || 'Active participant in the FEZ Zone creative frequency.'}"
                                            </p>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Information</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase">Expertise</span>
                                                {isEditing ? <input value={editData.profile?.profession} onChange={e => setEditData({...editData, profile: {...editData.profile, profession: e.target.value}})} className="bg-transparent text-right text-xs font-bold text-white outline-none border-b border-red-600/30" /> : <span className="text-xs font-bold text-white">{targetUser?.profile?.profession || 'Visual Artist'}</span>}
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase">Origin</span>
                                                {isEditing ? <input value={editData.profile?.origin} onChange={e => setEditData({...editData, profile: {...editData.profile, origin: e.target.value}})} className="bg-transparent text-right text-xs font-bold text-white outline-none border-b border-red-600/30" /> : <span className="text-xs font-bold text-white">{targetUser?.profile?.origin || 'Global'}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-red-600 uppercase tracking-[0.4em]">Connect</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {(isEditing ? editData.profile?.networks : targetUser?.profile?.networks)?.map((net: any, i: number) => {
                                                const cfg = NETWORK_CONFIGS[net.name] || { icon: GlobeAltIcon, baseUrl: '' };
                                                if(!isEditing && !net.handle) return null;
                                                return isEditing ? (
                                                    <div key={i} className="bg-black/30 border border-white/10 rounded-xl p-3">
                                                        <p className="text-[8px] text-zinc-600 font-black mb-1">{net.name}</p>
                                                        <input value={net.handle} onChange={e => { const n = [...editData.profile.networks]; n[i].handle = e.target.value; setEditData({...editData, profile: {...editData.profile, networks: n}}); }} className="bg-transparent text-[10px] text-white w-full outline-none font-sans" placeholder="Handle" />
                                                    </div>
                                                ) : (
                                                    <a key={i} href={`${cfg.baseUrl}${net.handle}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-red-600/10 transition-all group">
                                                        <cfg.icon className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest truncate">{net.name}</span>
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-6">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                                        <h3 className="text-sm font-black text-white uppercase tracking-[0.5em]">Creative Archive</h3>
                                        <GalleryIcon className="w-5 h-5 text-zinc-700" />
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                                        {userPosts.map((post, i) => (
                                            <motion.div 
                                                key={i} 
                                                whileHover={{ y: -5 }}
                                                onClick={() => onOpenModal?.(userPosts, i)} 
                                                className="aspect-square bg-white/5 rounded-2xl overflow-hidden group relative cursor-pointer border border-white/10 shadow-lg"
                                            >
                                                {post.mediaType === 'video' ? <video src={post.mediaUrl} className="w-full h-full object-cover" /> : <img src={post.mediaUrl} className="w-full h-full object-cover" alt="" />}
                                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center p-4">
                                                    <div className="flex gap-6 text-[10px] font-black text-white uppercase tracking-widest">
                                                        <span className="flex items-center gap-2"><i className="fa-solid fa-heart text-red-600"></i> {Object.keys(post.likes || {}).length}</span>
                                                        <span className="flex items-center gap-2"><i className="fa-solid fa-comment text-zinc-400"></i> {Object.keys(post.comments || {}).length}</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                        {userPosts.length === 0 && (
                                            <div className="col-span-full py-32 text-center bg-white/5 rounded-[2.5rem] border border-white/10">
                                                <SparklesIcon className="w-12 h-12 text-zinc-800 mx-auto mb-6" />
                                                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-600">Archive Protocol Offline</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <AnimatePresence>
                    {copyToast && (
                        <motion.div 
                            initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[1000001] bg-white text-black px-10 py-4 rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl"
                        >
                            Profile URL Copied
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </AnimatePresence>
    );
};