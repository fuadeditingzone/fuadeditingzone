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
    targetSection?: string;
    likes?: Record<string, boolean>;
    comments?: Record<string, Comment>;
}

const PostCaption: React.FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    useEffect(() => {
        if (textRef.current) {
            const el = textRef.current;
            // Strict check for line clamping overflow
            setIsTruncated(el.scrollHeight > el.clientHeight);
        }
    }, [text]);

    return (
        <div className="min-h-[1.5em] font-sans">
            <p 
                ref={textRef}
                className={`text-zinc-400 text-[11px] md:text-[13px] leading-relaxed break-words no-clip ${!isExpanded ? 'clamp-2' : ''}`}
            >
                {text}
            </p>
            {isTruncated && !isExpanded && (
                <button 
                    onClick={() => setIsExpanded(true)} 
                    className="text-zinc-500 font-bold hover:text-white transition-colors text-[10px] md:text-[11px] mt-1 block uppercase tracking-wider"
                >
                    ...read more
                </button>
            )}
        </div>
    );
};

export const ExploreFeed: React.FC<{ onOpenProfile?: (id: string) => void; onOpenModal?: (items: any[], index: number) => void }> = ({ onOpenProfile, onOpenModal }) => {
    const { user, isSignedIn } = useUser();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState('');
    const [caption, setCaption] = useState('');
    const [targetSection, setTargetSection] = useState<string>('Marketplace Only');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [activeCommentsPost, setActiveCommentsPost] = useState<string | null>(null);
    const [newComment, setNewComment] = useState('');
    const [shareToast, setShareToast] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isOwner = user?.username === OWNER_HANDLE;

    useEffect(() => {
        const postsRef = query(ref(db, 'explore_posts'), limitToLast(200));
        const unsubscribe = onValue(postsRef, (snap) => {
            const data = snap.val();
            if (data) {
                const list = Object.entries(data).map(([id, val]: [string, any]) => ({
                    id, 
                    ...(val as any)
                })).sort((a: any, b: any) => b.timestamp - a.timestamp);
                setPosts(list as Post[]);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleDelete = async (postId: string) => {
        if (!window.confirm("Perform Permanent Deletion? This cannot be undone.")) return;
        await remove(ref(db, `explore_posts/${postId}`));
    };

    const handleUpload = async () => {
        if (!user || !caption.trim()) return;
        setIsUploading(true);
        let mediaUrl = "";
        let mediaType: 'image' | 'video' | 'text' = 'text';

        try {
            if (selectedFile) {
                const formData = new FormData();
                formData.append('file', selectedFile);
                formData.append('folder', 'UserPosts');
                const uploadRes = await fetch('https://quiet-haze-1898.fuadeditingzone.workers.dev', { method: 'POST', body: formData });
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
            setTitle(''); setCaption(''); setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err: any) { alert(`Error: ${err.message}`); } finally { setIsUploading(false); }
    };

    const handleLike = async (post: Post, isLiked: boolean) => {
        if (!isSignedIn || !user) return;
        const likeRef = ref(db, `explore_posts/${post.id}/likes/${user.id}`);
        if (isLiked) await remove(likeRef);
        else {
            await set(likeRef, true);
            if (post.userId !== user.id) {
                await push(ref(db, `notifications/${post.userId}`), {
                    type: 'like', fromId: user.id, fromName: user.username || user.fullName, fromAvatar: user.imageUrl, postId: post.id, timestamp: Date.now(), read: false
                });
            }
        }
    };

    const handleComment = async (postId: string) => {
        if (!isSignedIn || !user || !newComment.trim()) return;
        const commentData = { userId: user.id, userName: user.username || user.fullName, userAvatar: user.imageUrl, text: newComment.trim(), timestamp: Date.now() };
        await push(ref(db, `explore_posts/${postId}/comments`), commentData);
        setNewComment('');
    };

    const handleShare = (postId: string) => {
        const url = `${window.location.origin}/marketplace/post/${postId}`;
        navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2000);
    };

    const getBadge = (username: string) => {
        if (username === OWNER_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-owner ml-1"></i>;
        if (username === ADMIN_HANDLE) return <i className="fa-solid fa-circle-check verified-badge-admin ml-1"></i>;
        return null;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-24 font-sans">
            <AnimatePresence>
                {shareToast && (
                    <motion.div initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} exit={{opacity:0, y:20}} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] bg-white text-black px-6 py-3 rounded-full font-bold uppercase text-[10px] tracking-widest shadow-2xl">Signal Copied</motion.div>
                )}
            </AnimatePresence>

            {isSignedIn && (
                <div className="bg-[#0a0a0a] border border-white/10 rounded-[2rem] p-6 md:p-10 shadow-2xl space-y-6 max-w-3xl mx-auto card-fix">
                    <div className="flex gap-4">
                        <img src={user.imageUrl} className="w-12 h-12 rounded-full border border-red-600/30 flex-shrink-0 object-cover" alt="Profile" />
                        <div className="flex-1 space-y-4">
                            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Transmission Subject..." className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-xs outline-none focus:border-red-600/50 font-sans" />
                            {isOwner && (
                                <select value={targetSection} onChange={e => setTargetSection(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-4 text-red-500 text-[10px] font-bold uppercase tracking-widest outline-none focus:border-red-600/50 appearance-none cursor-pointer font-sans">
                                    <option>Marketplace Only</option>
                                    <option>Photo Manipulation</option>
                                    <option>Thumbnail Designs</option>
                                    <option>Banner Designs</option>
                                    <option>VFX</option>
                                </select>
                            )}
                            <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Sync your vision with the network... Use @tags and #mentions" className="w-full bg-black border border-white/5 rounded-xl p-4 text-white text-xs outline-none resize-none h-24 focus:border-red-600/50 font-sans" />
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 pt-6">
                        <div className="flex gap-3">
                            <input type="file" hidden ref={fileInputRef} accept="image/*,video/*" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                            <button onClick={() => fileInputRef.current?.click()} className={`flex items-center gap-3 px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all font-sans ${selectedFile ? 'bg-green-600 text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
                                <PhotoManipulationIcon className="w-4 h-4" /> {selectedFile ? 'Asset Linked' : 'Attach Asset'}
                            </button>
                        </div>
                        <button disabled={isUploading || !caption.trim()} onClick={handleUpload} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-10 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl font-display">
                            {isUploading ? 'Transmitting...' : 'Broadcast'} <SendIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[20px] px-2 md:px-0">
                {posts.map((post, idx) => {
                    const postLikes = Object.keys(post.likes || {}).length;
                    const isLikedByMe = user ? !!post.likes?.[user.id] : false;
                    const isMyPost = user?.id === post.userId;
                    const commentsList = Object.entries(post.comments || {}).map(([id, val]) => ({ id, ...(val as any) }));

                    return (
                        <article key={post.id} className="bg-[#080808] border border-white/5 rounded-xl md:rounded-[2rem] overflow-hidden shadow-xl flex flex-col h-full card-fix">
                            <div className="p-4 flex items-center justify-between bg-black/40">
                                <div className="flex items-center gap-3 cursor-pointer group min-w-0" onClick={() => onOpenProfile?.(post.userId)}>
                                    <img src={post.userAvatar} className="w-8 h-8 rounded-full border border-white/10 object-cover flex-shrink-0" alt="" />
                                    <div className="min-w-0">
                                        <div className="flex items-center">
                                            <p className="text-[10px] font-bold text-white uppercase truncate group-hover:text-red-500 transition-colors font-display">@{post.userName}</p>
                                            {getBadge(post.userName)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {isMyPost && <button onClick={() => handleDelete(post.id)} className="p-2 rounded-full bg-white/5 text-zinc-600 hover:text-red-600 transition-all"><i className="fa-solid fa-trash text-xs"></i></button>}
                                    <button onClick={() => handleShare(post.id)} title="Copy Signal Link" className="p-2 rounded-full bg-white/5 text-zinc-500 hover:text-white transition-all"><CopyIcon className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {post.mediaUrl && (
                                <div 
                                    className="w-full bg-[#050505] flex items-center justify-center relative group overflow-hidden border-b border-white/5 cursor-pointer h-[250px]"
                                    onClick={() => onOpenModal?.(posts, idx)}
                                >
                                    {post.mediaType === 'video' ? (
                                        <video src={post.mediaUrl} className="w-full h-full object-cover" title={post.title || "VFX Project"} />
                                    ) : (
                                        <img src={post.mediaUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.title || post.caption || "Design Asset"} />
                                    )}
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <EyeIcon className="w-8 h-8 text-white/80" />
                                    </div>
                                </div>
                            )}

                            <div className="p-5 space-y-4 flex-1 flex flex-col">
                                {post.title && <h2 className="text-sm font-semibold text-white uppercase tracking-tight truncate flex-shrink-0 font-display no-clip">{post.title}</h2>}
                                <PostCaption text={post.caption} />
                                
                                <div className="mt-auto">
                                    <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                        <button onClick={() => handleLike(post, isLikedByMe)} className={`flex items-center gap-2 transition-all ${isLikedByMe ? 'text-red-600' : 'text-zinc-500 hover:text-white'}`}>
                                            <i className={`fa-${isLikedByMe ? 'solid' : 'regular'} fa-heart text-base`}></i>
                                            <span className="text-[11px] font-bold font-sans">{postLikes}</span>
                                        </button>
                                        <button onClick={() => setActiveCommentsPost(activeCommentsPost === post.id ? null : post.id)} className={`flex items-center gap-2 transition-all ${activeCommentsPost === post.id ? 'text-red-500' : 'text-zinc-500 hover:text-white'}`}>
                                            <ChatBubbleIcon className="w-4 h-4" />
                                            <span className="text-[11px] font-bold font-sans">{commentsList.length}</span>
                                        </button>
                                    </div>

                                    <AnimatePresence>
                                        {activeCommentsPost === post.id && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="pt-4 space-y-4 overflow-hidden border-t border-white/5">
                                                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
                                                    {commentsList.map(c => (
                                                        <div key={c.id} className="flex gap-2 items-start font-sans">
                                                            <img src={c.userAvatar} className="w-6 h-6 rounded-full flex-shrink-0 object-cover" alt="User" />
                                                            <div className="bg-white/5 p-2.5 rounded-xl flex-1 min-w-0">
                                                                <div className="flex items-center">
                                                                    <p className="text-[10px] font-bold text-white uppercase mb-0.5 truncate">@{c.userName}</p>
                                                                    {getBadge(c.userName)}
                                                                </div>
                                                                <p className="text-[12px] text-zinc-400 leading-tight clamp-2 no-clip">{c.text}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                                {isSignedIn && (
                                                    <div className="flex gap-2 items-center font-sans">
                                                        <input value={newComment} onChange={e => setNewComment(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleComment(post.id)} placeholder="Signal in..." className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-2 text-[12px] outline-none focus:border-red-600 text-white font-sans" />
                                                        <button onClick={() => handleComment(post.id)} disabled={!newComment.trim()} className="p-2 bg-red-600 text-white rounded-xl active:scale-90 transition-all"><SendIcon className="w-4 h-4" /></button>
                                                    </div>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </div>
    );
};