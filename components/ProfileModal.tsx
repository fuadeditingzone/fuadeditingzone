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

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const db = getDatabase(app);

const OWNER_HANDLE = 'fuadeditingzone';
const ADMIN_HANDLE = 'studiomuzammil';

type TabType = 'identity' | 'credentials' | 'networks' | 'posts' | 'social_hub';

export const ProfileModal: React.FC<{ isOpen: boolean; onClose: () => void; viewingUserId?: string | null }> = ({ isOpen, onClose, viewingUserId }) => {
    const { user: clerkUser, isLoaded } = useUser();
    const [activeTab, setActiveTab] = useState<TabType>('posts');
    const [targetUser, setTargetUser] = useState<any>(null);
    const [userPosts, setUserPosts] = useState<any[]>([]);
    const [socialState, setSocialState] = useState({ 
      isFollowing: false, 
      friendStatus: 'none', 
      followers: [] as any[], 
      following: [] as any[] 
    });

    const isViewingOther = !!viewingUserId && viewingUserId !== clerkUser?.id;

    useEffect(() => {
        if (isOpen) {
            const loadId = viewingUserId || clerkUser?.id;
            if (loadId) {
                const userRef = ref(db, `users/${loadId}`);
                onValue(userRef, (snap) => setTargetUser(snap.val()));

                onValue(ref(db, `social/${loadId}/followers`), (snap) => {
                  const data = snap.val() || {};
                  setSocialState(prev => ({ ...prev, followers: Object.keys(data) }));
                });
                onValue(ref(db, `social/${loadId}/following`), (snap) => {
                  const data = snap.val() || {};
                  setSocialState(prev => ({ ...prev, following: Object.keys(data) }));
                });

                const postsQuery = query(ref(db, 'explore_posts'), orderByChild('userId'), equalTo(loadId));
                onValue(postsQuery, (snap) => {
                    const data = snap.val();
                    setUserPosts(data ? Object.values(data).sort((a: any, b: any) => b.timestamp - a.timestamp) : []);
                });
            }
        }
    }, [isOpen, viewingUserId, clerkUser]);

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
                    <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl">
                        <div className="flex items-center gap-4">
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 transition-all"><ChevronLeftIcon className="w-6 h-6 text-white" /></button>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight">{targetUser?.username || clerkUser.username}</h2>
                                {isVerified(targetUser?.username || clerkUser.username) && <i className={`fa-solid fa-circle-check text-xl verified-badge-owner`}></i>}
                            </div>
                        </div>
                        <button onClick={onClose} className="p-3 bg-red-600 rounded-full text-white shadow-xl"><CloseIcon className="w-6 h-6" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-16 space-y-12">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                            <div className={`w-32 h-32 md:w-48 md:h-48 rounded-[2.5rem] border-4 p-1.5 ${isVerified(targetUser?.username) ? 'border-red-600' : 'border-white/10'}`}>
                                <img src={targetUser?.avatar || clerkUser.imageUrl} className="w-full h-full object-cover rounded-[2rem]" alt="" />
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-6">
                                <div className="flex flex-col md:flex-row items-center gap-6">
                                    <h3 className="text-2xl md:text-4xl font-light text-white lowercase">@{targetUser?.username || clerkUser.username}</h3>
                                    <div className="flex gap-3">
                                        {isViewingOther ? (
                                            <>
                                                <button onClick={() => handleAction('follow')} className={`px-8 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${socialState.isFollowing ? 'bg-white/10 text-white' : 'bg-red-600 text-white shadow-xl shadow-red-600/20'}`}>
                                                    {socialState.isFollowing ? 'Following' : 'Follow'}
                                                </button>
                                                <button onClick={() => handleAction('friend')} className="px-8 py-2.5 bg-white/5 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white">
                                                    {socialState.friendStatus === 'accepted' ? 'Linked' : socialState.friendStatus === 'requested' ? 'Pending' : 'Add Friend'}
                                                </button>
                                            </>
                                        ) : (
                                            <button className="px-8 py-2.5 bg-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg">Edit Zone</button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center md:justify-start gap-12 border-y md:border-0 border-white/5 py-4">
                                    <div className="text-center"><p className="text-2xl font-black text-white">{userPosts.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Posts</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-white">{socialState.followers.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Followers</p></div>
                                    <div className="text-center"><p className="text-2xl font-black text-white">{socialState.following.length}</p><p className="text-[9px] text-zinc-500 uppercase font-black">Following</p></div>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-lg md:text-xl font-black text-white">{targetUser?.name || clerkUser.fullName}</p>
                                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed italic">"{targetUser?.profile?.bio || 'Frequency synchronized.'}"</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center border-t border-white/5 pt-4 sticky top-0 bg-[#050505] z-10">
                            {(['posts', 'identity', 'credentials', 'networks'] as TabType[]).map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 md:px-12 py-5 text-[10px] font-black uppercase tracking-widest relative ${activeTab === tab ? 'text-white' : 'text-zinc-600'}`}>
                                    {tab === 'posts' ? 'Portfolio' : tab}
                                    {activeTab === tab && <motion.div layoutId="tabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]" />}
                                </button>
                            ))}
                        </div>

                        <div className="min-h-[400px]">
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
                                <div className="p-8 bg-white/5 rounded-3xl border border-white/10 max-w-2xl mx-auto italic text-lg md:text-2xl text-zinc-300 font-light leading-relaxed">
                                    "{targetUser?.profile?.bio || 'Intelligence identity established.'}"
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};