import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, SignInButton } from '@clerk/clerk-react';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getDatabase, ref, push, onValue, query, limitToLast, set, update, get, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import { siteConfig } from '../config';
import { PhotoManipulationIcon, SendIcon, CopyIcon, PlayIcon, SparklesIcon, CloseIcon, CheckCircleIcon, ChatBubbleIcon, EyeIcon } from './Icons';

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

interface Comment {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: number;
}

interface Post {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'text';
    title?: string;
    caption: string;
    tags: string[];
    timestamp: number;
    targetSection?: string; // For owner to promote to portfolio
    likes?: Record<string, boolean>;
    comments?: Record<string, Comment>;
}

export const ExploreFeed: React.FC<{ onOpenProfile?: (id: string) => void }> = ({ onOpenProfile }) => {
    const { user, isSignedIn } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [targetSection, setTargetSection] = useState<string>('Marketplace Only');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isOwner = user?.username === OWNER_HANDLE;

    useEffect(() => {
        const postsRef = query(ref(db, 'explore_posts'), limitToLast(200));
        const unsubscribe = onValue(postsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id, 
                    ...val
                })).sort((a, b) => b.timestamp - a.timestamp);
                setPosts(list);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (postId: string) => {
        if (!window.confirm("Abort Transmission: Permanently delete this post?")) return;
        await remove(ref(db, `explore_posts/${postId}`));
    };

    const handleUpload = async () => {
        if (!user || !caption.trim()) return;

        const today = new Date().toISOString().split('T')[0];
        const userPostCountRef = ref(db, `post_limits/${user.id}/${today}`);
        const currentCountSnap = await get(userPostCountRef);
        const currentCount = currentCountSnap.val() || 0;

        if (currentCount >= 5 && !isOwner) {
            alert("Signal Overflow: Daily transmission limit reached (5 posts).");
            return;
        }

        setIsUploading(true);
        let mediaUrl = "";
        let mediaType: 'image' | 'video' | 'text' = 'text';

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('folder', 'UserPosts');

                const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Upload link failed');
                const result = await uploadRes.json();
                mediaUrl = result.url;
                mediaType = selectedFile.type.startsWith('video') ? 'video' : 'image';
            }

            const tags = caption.match(/#\w+/g) || [];
            const postData = {
                userId: user.id,
                userName: user.username || user.fullName,
                userAvatar: user.imageUrl,
                mediaUrl,
                mediaType,
                title: title.trim(),
                caption: caption.trim(),
                tags,
                timestamp: Date.now(),
                targetSection: isOwner ? targetSection : 'Marketplace Only'
            };

            await push(ref(db, 'explore_posts'), postData);
            await set(userPostCountRef, currentCount + 1);
            
            setTitle('');
            setCaption('');
            setTargetSection('Marketplace Only');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) {
            alert(`Protocol Error: ${err.message}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleLike = async (postId: string, isLiked: boolean) => {
        if (!isSignedIn || !user) return;
        const likeRef = ref(db, `explore_posts/${postId}/likes/${user.id}`);
        if (isLiked) await remove(likeRef);
        else await set(likeRef, true);
    };

    const handleComment = async (postId: string) => {
        if (!isSignedIn || !user || !newComment.trim()) return;
        const commentData = {
            userId: user.id,
            userName: user.username || user.fullName,
            userAvatar: user.imageUrl,
            text: newComment.trim(),
            timestamp: Date.now()
        };
        await push(ref(db, `explore_posts/${postId}/comments`), commentData);
        setNewComment('');
    };

    const renderCaption = (text: string) => {
        const parts = text.split(/(@\w+|#\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                const handle = part.substring(1);
                return <span key={i} onClick={() => onOpenProfile?.(handle)} className="mention-link">{part}</span>;
            } else if (part.startsWith('#')) {
                return <span key={i} className="text-red-500 font-bold">{part}</span>;
            }
            return part;
        });
    };

    const isVerified = (username: string) => username === OWNER_HANDLE || username === ADMIN_HANDLE;

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            {/* Create Post Section - Compact */}
            {isSignedIn && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 shadow-2xl space-y-4 max-w-2xl mx-auto">
                    <div className="flex gap-4">
                        <img src={user.imageUrl} className="w-10 h-10 rounded-full border border-red-600/30" alt="" />
                        <div className="flex-1 space-y-3">
                            <input 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Post Title (Optional)"
                                className="w-full bg-black border border-white/5 rounded-xl p-3 text-white text-xs outline-none focus:border-red-600/50"
                            />
                            {isOwner && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-1">Portfolio Destination:</label>
                                    <select 
                                        value={targetSection}
                                        onChange={(e) => setTargetSection(e.target.value)}
                                        className="w-full bg-black border border-white/5 rounded-xl p-3 text-white text-xs outline-none focus:border-red-600/50 appearance-none cursor-pointer"
                                    >
                                        <option>Marketplace Only</option>
                                        <option>Photo Manipulation</option>
                                        <option>Thumbnail Designs</option>
                                        <option>Banner Designs</option>
                                        <option>VFX</option>
                                    </select>
                                </div>
                            )}
                            <textarea 
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Transmit intel... Use @mentions or #hashtags"
                                className="w-full bg-black border border-white/5 rounded-xl p-3 text-white text-xs outline-none resize-none h-20 focus:border-red-600/50"
                            />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-4">
                        <div className="flex gap-2">
                            <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${selectedFile ? 'bg-green-600/20 text-green-500' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                <PhotoManipulationIcon className="w-3.5 h-3.5" />
                                {selectedFile ? 'Ready' : 'Media'}
                            </button>
                        </div>
                        
                        <button disabled={isUploading || !caption.trim()} onClick={handleUpload} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2">
                            {isUploading ? 'Syncing...' : 'Broadcast'}
                            <SendIcon className="w-3 h-3" />
                        </button>
                    </div>
                </div>
            )}

            {/* Marketplace Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
                {posts.length === 0 ? (
                    <div className="col-span-full text-center py-20 opacity-20 flex flex-col items-center gap-4">
                        <SparklesIcon className="w-16 h-16" />
                        <p className="font-black uppercase tracking-[0.4em] text-xs">Waiting for Intel</p>
                    </div>
                ) : (
                    posts.map((post) => {
                        const postLikes = Object.keys(post.likes || {}).length;
                        const isLikedByMe = user ? !!post.likes?.[user.id] : false;
                        const isMyPost = user?.id === post.userId;
                        const commentsList = Object.entries(post.comments || {}).map(([id, val]) => ({ id, ...val }));

                        return (
                            <motion.div key={post.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#080808] border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl flex flex-col h-fit">
                                <div className="p-3 md:p-5 flex items-center justify-between bg-black/40">
                                    <div className="flex items-center gap-2 md:gap-3 cursor-pointer group min-w-0" onClick={() => onOpenProfile?.(post.userId)}>
                                        <img src={post.userAvatar} className="w-7 h-7 md:w-9 md:h-9 rounded-full border border-white/10 group-hover:border-red-600 transition-colors object-cover flex-shrink-0" alt="" />
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1">
                                                <p className="text-[9px] md:text-[11px] font-black text-white uppercase group-hover:text-red-500 transition-colors truncate">@{post.userName}</p>
                                                {isVerified(post.userName) && (
                                                    <i className={`fa-solid fa-circle-check text-[10px] md:text-[12px] flex-shrink-0 ${post.userName === OWNER_HANDLE ? 'verified-badge-owner' : 'verified-badge-admin'}`} style={{ transform: 'translateY(-1px)' }}></i>
                                                )}
                                            </div>
                                            <p className="text-[7px] md:text-[8px] text-zinc-600 uppercase font-bold">{new Date(post.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 md:gap-2 flex-shrink-0">
                                        {isMyPost && (
                                            <button onClick={() => handleDelete(post.id)} className="p-1.5 md:p-2 rounded-full bg-white/5 text-zinc-600 hover:text-red-600 transition-all">
                                                <i className="fa-solid fa-trash text-[10px] md:text-xs"></i>
                                            </button>
                                        )}
                                        <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`); }} className="p-1.5 md:p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-all">
                                            <CopyIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                        </button>
                                    </div>
                                </div>

                                {post.mediaType !== 'text' && post.mediaUrl && (
                                    <div className="aspect-square bg-black flex items-center justify-center relative group overflow-hidden border-b border-white/5">
                                        {post.mediaType === 'video' ? (
                                            <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
                                        ) : (
                                            <img src={post.mediaUrl} className="w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-105" alt="" />
                                        )}
                                        {post.targetSection && post.targetSection !== 'Marketplace Only' && (
                                            <div className="absolute top-2 left-2 bg-red-600/80 backdrop-blur px-2 py-1 rounded text-[7px] font-black text-white uppercase tracking-widest shadow-lg">Featured: {post.targetSection}</div>
                                        )}
                                    </div>
                                )}

                                <div className="p-4 md:p-6 space-y-3 md:space-y-4">
                                    {post.title && <h3 className="text-sm md:text-lg font-black text-white uppercase tracking-tight truncate">{post.title}</h3>}
                                    <p className="text-zinc-300 text-[10px] md:text-[12px] leading-relaxed line-clamp-3">
                                        {renderCaption(post.caption)}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 md:gap-6 pt-3 md:pt-4 border-t border-white/5">
                                        <button onClick={() => handleLike(post.id, isLikedByMe)} className={`flex items-center gap-1 md:gap-1.5 transition-all ${isLikedByMe ? 'text-red-600' : 'text-zinc-500 hover:text-white'}`}>
                                            <i className={`fa-${isLikedByMe ? 'solid' : 'regular'} fa-heart text-base md:text-lg`}></i>
                                            <span className="text-[10px] md:text-xs font-black">{postLikes}</span>
                                        </button>
                                        <button onClick={() => setActiveCommentsPost(activeCommentsPost === post.id ? null : post.id)} className={`flex items-center gap-1 md:gap-1.5 transition-all ${activeCommentsPost === post.id ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}>
                                            <ChatBubbleIcon className="w-4 h-4 md:w-5 md:h-5" />
                                            <span className="text-[10px] md:text-xs font-black">{commentsList.length}</span>
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {activeCommentsPost === post.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 space-y-4 overflow-hidden">
                                                <div className="space-y-3 max-h-[150px] md:max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                                    {commentsList.map((c) => (
                                                        <div key={c.id} className="flex gap-2 items-start">
                                                            <img src={c.userAvatar} className="w-6 h-6 md:w-7 md:h-7 rounded-full flex-shrink-0 object-cover" alt="" />
                                                            <div className="bg-white/5 p-2 md:p-3 rounded-xl md:rounded-2xl flex-1 min-w-0">
                                                                <p className="text-[8px] md:text-[9px] font-black text-white uppercase mb-0.5 truncate">@{c.userName}</p>
                                                                <p className="text-[10px] md:text-[11px] text-zinc-400 break-words">{c.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                
                                                {isSignedIn && (
                                                    <div className="flex gap-2 items-center">
                                                        <input 
                                                            value={newComment}
                                                            onChange={(e) => setNewComment(e.target.value)}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleComment(post.id)}
                                                            placeholder="Intel..."
                                                            className="flex-1 bg-black border border-white/10 rounded-lg md:rounded-xl px-3 md:px-4 py-1.5 md:py-2 text-[10px] md:text-xs outline-none focus:border-red-600 text-white"
                                                        />
                                                        <button onClick={() => handleComment(post.id)} disabled={!newComment.trim()} className="p-1.5 md:p-2 bg-red-600 text-white rounded-lg md:rounded-xl hover:bg-red-700 disabled:opacity-50">
                                                            <SendIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </div>
    );
};