import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Loader2,
  Volume2,
  VolumeX,
  Home,
  User,
  Plus,
  Info,
  Clock,
  MessageCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import './Feed.css';
import './Index.css';

// Define the structure for our banner notification
interface BannerNotification {
  message: string;
  type: 'error' | 'info';
}

// --- PAGED SCROLLING (one post per gesture) ---


// --- pastel helpers (unchanged) ---
const pastelColors = [
  '#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'
];

const generatePastelColor = (id: string | null): string => {
  if (!id) return pastelColors[0];
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

const getInitials = (name: string | null): string => {
  if (!name) return 'U';
  const parts = name.split(' ').filter(Boolean);
  if (parts.length > 1) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return parts[0] ? parts[0][0].toUpperCase() : 'U';
};

interface Post {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  challengeTitle: string;
  createdAt: string;
}

interface Comment {
  id: string;
  userId: string;
  username: string;
  content: string;
  avatarUrl: string | null;
}

function timeAgo(input: string | Date) {
  const ms = Date.now() - new Date(input).getTime();
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [latestUserPost, setLatestUserPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [banner, setBanner] = useState<BannerNotification | null>(null);

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const headerRef = useRef<HTMLHeadingElement>(null);

  const isParticipant =
    !!(user as any)?.isConferenceParticipant ||
    !!(user as any)?.is_conference_participant;

  const [sheetOffset, setSheetOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const pullStartY = useRef(0);
  const REFRESH_THRESHOLD = 80;

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    el.style.scrollPaddingTop = '60px';
    el.style.paddingTop = '0px';
  }, []);

  useEffect(() => {
    if (!posts.length) return;
    const el = feedRef.current;
    if (!el) return;
    queueMicrotask(() => {
      el.scrollTop = 0;
    });
  }, [posts.length]);

  // Effect to automatically hide the banner after 5 seconds
  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => {
        setBanner(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  const animateAndClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setSheetOffset(window.innerHeight);
  };

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== sheetRef.current) return;
    if (isClosing) {
      setIsClosing(false);
      setSheetOffset(0);
      closeComments();
    }
  };

  const onDragStart = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    setSheetOffset(Math.max(0, delta));
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const CLOSE_THRESHOLD = 120;
    if (sheetOffset > CLOSE_THRESHOLD) {
      animateAndClose();
    } else {
      setSheetOffset(0);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isCommentsOpen ? 'hidden' : '';
  }, [isCommentsOpen]);

  const fetchPosts = useCallback(async (currentPage: number) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const feedPosts = await apiClient.getFeed(user.id, currentPage);
      const transformedPosts = feedPosts.map((p: any) => ({
        id: p.id,
        userId: p.user_id ?? p.userId,
        username: p.username,
        avatarUrl: p.avatar_url,
        mediaUrl: p.media_url,
        mediaType: p.media_type,
        challengeTitle: p.caption,
        createdAt: p.created_at,
      }));
      setPosts((prev) => {
        const unique = transformedPosts.filter(
          (np: Post) => !prev.some((pp) => pp.id === np.id)
        );
        return [...prev, ...unique];
      });
      if (feedPosts.length < 10) setHasMore(false);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !user) return;
    setIsRefreshing(true);
    setPullPosition(0);
    requestAnimationFrame(() => {
      const scroller = feedRef.current;
      if (scroller) {
        scroller.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentIndex(0);
      }
    });
    try {
      const feedPosts = await apiClient.getFeed(user.id, 1);
      const transformedPosts: Post[] = feedPosts.map((p: any) => ({
        id: p.id,
        userId: p.user_id ?? p.userId,
        username: p.username,
        avatarUrl: p.avatar_url,
        mediaUrl: p.media_url,
        mediaType: p.media_type,
        challengeTitle: p.caption,
        createdAt: p.created_at,
      }));
      setPosts((currentPosts) => {
        const existingIds = new Set(currentPosts.map((p) => p.id));
        const uniqueNewPosts = transformedPosts.filter((p) => !existingIds.has(p.id));
        return [...uniqueNewPosts, ...currentPosts];
      });
      setPage(1);
      setHasMore(true);
    } catch (error) {
      console.error('Failed to refresh feed:', error);
    } finally {
      setIsRefreshing(false);
      setPullPosition(0);
    }
  }, [isRefreshing, user]);

  const fetchLatestUserPost = useCallback(async () => {
    if (!user) return;
    try {
      const feedPosts = await apiClient.getFeed(user.id, 1);
      const myPosts = feedPosts.filter((p: any) => p.user_id === user.id);
      if (myPosts.length === 0) return;
      const latest = myPosts.sort(
        (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
      setLatestUserPost({
        id: latest.id,
        userId: user.id,
        username: user.username,
        avatarUrl: latest.avatar_url,
        mediaUrl: latest.media_url,
        mediaType: latest.media_type,
        challengeTitle: latest.caption,
        createdAt: latest.created_at,
      });
    } catch (err) {
      console.error('Failed to fetch latest user post', err);
    }
  }, [user]);

  const atTop = () => (feedRef.current?.scrollTop ?? 0) <= 0;

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (!isRefreshing && atTop()) {
      pullStartY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  }, [isRefreshing]);


  // --- PAGED SCROLLING (one post per gesture) ---
  const pagingLockRef = useRef(false);
  const touchStartYRef = useRef(0);

  const clampIndex = (idx: number) => Math.max(0, Math.min(idx, posts.length - 1));

  const snapTo = useCallback((targetIndex: number) => {
    const el = feedRef.current;
    if (!el) return;
    const clamped = clampIndex(targetIndex);

    pagingLockRef.current = true;
    setCurrentIndex(clamped);

    el.scrollTo({
      top: clamped * el.clientHeight,
      behavior: 'smooth',
    });

    // unlock after the snap finishes
    window.setTimeout(() => {
      pagingLockRef.current = false;
    }, 450);
  }, [posts.length]);

  const pageNext = useCallback(() => {
    const next = clampIndex(currentIndex + 1);
    if (next !== currentIndex) {
      snapTo(next);
    }
  }, [currentIndex, posts.length, hasMore, isLoading, isRefreshing, snapTo]);


  const pagePrev = useCallback(() => {
    const prev = clampIndex(currentIndex - 1);
    if (prev !== currentIndex) {
      snapTo(prev);
    }
  }, [currentIndex, snapTo]);

// Enable one-post-per-gesture paging
useEffect(() => {
  const el = feedRef.current;
  if (!el) return;

  const onWheel = (e: WheelEvent) => {
    // prevent native free-scrolling
    e.preventDefault();
    if (pagingLockRef.current) return;
    const dy = e.deltaY;
    if (Math.abs(dy) < 15) return; // ignore tiny scrolls
    if (dy > 0) pageNext();
    else pagePrev();
  };

  const onTouchStart = (e: TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: TouchEvent) => {
    // stop native scroll so we control paging
    e.preventDefault();
  };

  const onTouchEnd = (e: TouchEvent) => {
    const endY = e.changedTouches[0].clientY;
    const dy = endY - touchStartYRef.current;
    const THRESH = 40; // swipe threshold in px

    if (Math.abs(dy) < THRESH) {
      // small swipe -> snap back to current
      snapTo(currentIndex);
      return;
    }
    if (dy < 0) pageNext(); // swiped up => next
    else pagePrev();        // swiped down => prev
  };

  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('touchstart', onTouchStart, { passive: false });
  el.addEventListener('touchmove', onTouchMove, { passive: false });
  el.addEventListener('touchend', onTouchEnd, { passive: false });

  return () => {
    el.removeEventListener('wheel', onWheel as any);
    el.removeEventListener('touchstart', onTouchStart as any);
    el.removeEventListener('touchmove', onTouchMove as any);
    el.removeEventListener('touchend', onTouchEnd as any);
  };
}, [currentIndex, pageNext, pagePrev, snapTo]);


  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || pullStartY.current === 0) return;
    if (!atTop()) {
      setIsPulling(false);
      setPullPosition(0);
      return;
    }
    const deltaY = e.touches[0].clientY - pullStartY.current;
    if (deltaY > 0) {
      e.preventDefault();
      setPullPosition(Math.pow(deltaY, 0.85));
    }
  }, [isPulling]);

  const handleTouchEnd = useCallback(() => {
    if (!isPulling) return;
    setIsPulling(false);
    pullStartY.current = 0;
    if (pullPosition > REFRESH_THRESHOLD && atTop()) {
      handleRefresh();
    } else {
      setPullPosition(0);
    }
  }, [isPulling, pullPosition, handleRefresh]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchPosts(1);
      fetchLatestUserPost();
    }
  }, [user, authLoading, fetchPosts, fetchLatestUserPost]);

  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
     if (isCommentsOpen || isPulling) return;
      e.preventDefault();
      if (pagingLockRef.current) return;
      const dy = e.deltaY;
      if (Math.abs(dy) < 15) return;
      if (dy > 0) pageNext();
      else pagePrev();
    };

    const onTouchStart = (e: TouchEvent) => {
     if (isCommentsOpen) return;
      touchStartYRef.current = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
     if (isCommentsOpen || isPulling) return;
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
     if (isCommentsOpen || isPulling) return;
      const endY = e.changedTouches[0].clientY;
      const dy = endY - touchStartYRef.current;
      const THRESH = 40;
      if (Math.abs(dy) < THRESH) { snapTo(currentIndex); return; }
      if (dy < 0) pageNext(); else pagePrev();
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('wheel', onWheel as any);
      el.removeEventListener('touchstart', onTouchStart as any);
      el.removeEventListener('touchmove', onTouchMove as any);
      el.removeEventListener('touchend', onTouchEnd as any);
    };
  }, [currentIndex, pageNext, pagePrev, snapTo, isCommentsOpen, isPulling]);


  // With paging, we drive index ourselves; just prefetch when near the end
  useEffect(() => {
    if (currentIndex >= posts.length - 3 && hasMore && !isLoading && !isRefreshing) {
      setPage((p) => p + 1);
    }
  }, [currentIndex, posts.length, hasMore, isLoading, isRefreshing]);


  useEffect(() => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video) {
        video.muted = true;
        video.pause();
      }
    });
    const currentVideo = videoRefs.current[posts[currentIndex]?.id];
    if (currentVideo) {
      currentVideo.muted = isMuted;
      currentVideo.play().catch(() => {});
    }
  }, [currentIndex, posts, isMuted]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleProfileClick = (posterId: string) => {
    navigate(`/profile/${posterId}`);
  };

  const openComments = async (postId: string) => {
    setIsCommentsOpen(true);
    setSheetOffset(window.innerHeight);
    requestAnimationFrame(() => setSheetOffset(0));
    try {
      const commentsData = await apiClient.getComments(postId);
      const transformedComments = commentsData.map((c: any) => ({
        id: c.id,
        userId: c.user_id,
        username: c.username,
        content: c.content,
        avatarUrl: c.avatar_url,
      }));
      setCurrentComments(transformedComments);
    } catch {
      setCurrentComments([]);
    }
  };

  const closeComments = () => {
    setIsCommentsOpen(false);
    setCurrentComments([]);
    setCommentInput('');
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !user) return;
    try {
      const activePost = posts[currentIndex];
      if (!activePost) return;
      const newCommentData = await apiClient.addComment(activePost.id, user.id, commentInput);

      if (newCommentData.message) {
        setBanner({ type: 'info', message: newCommentData.message });
        setCommentInput('');
      } else {
        const newComment: Comment = {
          id: newCommentData.id,
          userId: user.id,
          content: newCommentData.content,
          username: user.username,
          avatarUrl: (user as any).avatarUrl ?? null,
        };
        setCurrentComments((prev) => [...prev, newComment]);
        setCommentInput('');
      }
    } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Too many comment requests. Try again later';
        setBanner({ type: 'error', message: errorMessage });
    }
  };

  const refreshAndScrollTop = useCallback(() => {
    setPullPosition(0);
    requestAnimationFrame(() => {
      const scroller = feedRef.current;
      if (scroller) {
        scroller.scrollTo({ top: 0, behavior: 'smooth' });
        setCurrentIndex(0);
      }
    });
    handleRefresh();
  }, [handleRefresh]);

  const onFeedNavClick = () => {
    if (location.pathname === '/feed') {
      refreshAndScrollTop();
    } else {
      navigate('/feed');
    }
  };

  return (
    <div className="feed-container">
      {/* ✅ ADDED: Banner Notification JSX */}
      <div className="feed-banner-root">
        <div
          className={`feed-banner ${banner ? `feed-banner--visible feed-banner--${banner.type}` : ''}`}
        >
          <span className="feed-banner-text">{banner?.message}</span>
          <button onClick={() => setBanner(null)} className="feed-banner-close" aria-label="Close">
            &times;
          </button>
        </div>
      </div>

      {latestUserPost && (
        <div className="feed-history-button" onClick={() => navigate(`/profile/${user.id}`)}>
          {latestUserPost.mediaType === 'video' ? (
            <video src={`${API_BASE_URL}${latestUserPost.mediaUrl}`} className="feed-history-video" muted loop autoPlay playsInline />
          ) : (
            <img src={`${API_BASE_URL}${latestUserPost.mediaUrl}`} alt={latestUserPost.challengeTitle || 'Latest Post'} className="feed-history-video" />
          )}
          <div className="feed-history-icon"><Clock size={16} /></div>
        </div>
      )}

      <div className="feed-overlay-header">
        <h1 className="feed-title" ref={headerRef} onClick={refreshAndScrollTop}>Feed</h1>
      </div>

      <div className={`feed-pull-indicator ${isRefreshing ? 'refreshing' : ''}`}>
        <Loader2 size={24} style={{ opacity: isRefreshing ? 1 : Math.min(pullPosition / REFRESH_THRESHOLD, 1), transform: `rotate(${isRefreshing ? '0' : pullPosition * 3}deg)` }} />
      </div>

      <div className="feed-mobile-frame" ref={feedRef}>
        <div className="feed-layout" style={{ transform: `translateY(${pullPosition}px)`, transition: isPulling ? 'none' : 'transform 0.3s ease' }}>
          {posts.length === 0 && !isLoading ? (
            <div className="feed-empty">
              <p className="feed-empty-text">No posts from friends yet</p>
              <p className="feed-empty-subtext">Add friends to see their content here.</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <div key={post.id} className="feed-post-fullscreen">
                {post.mediaType === 'video' ? (
                  <>
                    <video src={`${API_BASE_URL}${post.mediaUrl}`} className="feed-video" loop playsInline ref={(el) => (videoRefs.current[post.id] = el)} />
                    {currentIndex === idx && ( <button className="feed-mute-button" onClick={() => setIsMuted((prev) => !prev)}> {isMuted ? <VolumeX /> : <Volume2 />} </button> )}
                  </>
                ) : (
                  <img src={`${API_BASE_URL}${post.mediaUrl}`} alt={post.challengeTitle || 'Photo'} className="feed-image" />
                )}
                <button className="feed-comments-button" onClick={() => openComments(post.id)}>
                  <MessageCircle />
                </button>
                <div className="feed-overlay">
                  {post.avatarUrl && <img src={post.avatarUrl} alt="User avatar" className="feed-avatar" />}
                  <div className="feed-userline">
                    <span className="feed-post-username" onClick={() => navigate(`/profile/${post.userId}`)}> @{post.username} </span>
                    <span className="feed-sep"> · </span>
                    <time className="feed-post-time" dateTime={post.createdAt} title={new Date(post.createdAt).toLocaleString()}> {timeAgo(post.createdAt)} </time>
                  </div>
                  <p className="feed-post-caption">{post.challengeTitle}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && hasMore && ( <div className="feed-loading-more"> <Loader2 className="h-6 w-6 text-white animate-spin" /> </div> )}
        </div>
      </div>

      {isCommentsOpen && (
        <div className="feed-comments-backdrop" onClick={animateAndClose}>
          <div ref={sheetRef} className="feed-comments-modal" onClick={(e) => e.stopPropagation()} onTransitionEnd={handleTransitionEnd} style={{ transform: `translateY(${sheetOffset}px)`, transition: isDragging ? 'none' : 'transform 260ms ease', touchAction: 'none', }} tabIndex={-1} onKeyDown={(e) => e.key === 'Escape' && animateAndClose()} >
            <div className="feed-comments-drag-handle" onPointerDown={onDragStart} onPointerMove={onDragMove} onPointerUp={onDragEnd} onPointerCancel={onDragEnd} >
              <span className="feed-comments-drag-bar" />
            </div>
            <h3 className="feed-comments-title">Comments</h3>
            <div className="feed-comments-list">
              {currentComments.map((c) => (
                <div key={c.id} className="feed-comment">
                  {c.avatarUrl ? ( <img src={c.avatarUrl} alt={`${c.username}'s avatar`} className="feed-comment-avatar" /> ) : ( <div className="feed-comment-avatar-placeholder" style={{ backgroundColor: generatePastelColor(c.userId) }} > {getInitials(c.username)} </div> )}
                  <div className="feed-comment-body">
                    <span className="feed-comment-username">@{c.username}</span>
                    <p className="feed-comment-content">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="feed-comments-input-area">
              <input className="feed-comments-input-field" value={commentInput} onChange={(e) => setCommentInput(e.target.value)} placeholder="Add a comment..." onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
              <button className="feed-comments-submit-button" onClick={handleAddComment}> Post </button>
            </div>
          </div>
        </div>
      )}

      <div className="index-bottom-nav">
        <div className="index-nav-container">
          <button className="index-nav-button index-nav-button-active" onClick={onFeedNavClick}> <Home className="index-nav-icon" /> </button>
          {isParticipant && (
  <button
    className="index-nav-button index-nav-button-inactive"
    onClick={() => navigate('/info')}
  >
    <span className="index-nav-text">TU</span>
  </button>
)}
          <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/')}> <Plus className="index-nav-icon" /> </button>
          <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/profile')}> <User className="index-nav-icon" /> </button>
        </div>
      </div>
    </div>
  );
};

export default Feed;