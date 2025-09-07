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
  username: string;
  content: string;
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

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const headerRef = useRef<HTMLHeadingElement>(null);

  const isParticipant =
    !!(user as any)?.isConferenceParticipant ||
    !!(user as any)?.is_conference_participant;

  // Comments sheet drag state
  const [sheetOffset, setSheetOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Pull-to-refresh state
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullPosition, setPullPosition] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const pullStartY = useRef(0);
  const REFRESH_THRESHOLD = 80;

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

  /** Clean refresh that always scrolls to top */
  const handleRefresh = useCallback(async () => {
    if (isRefreshing || !user) return;
    setIsRefreshing(true);

    // Reset pull transform & scroll to top immediately
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
        const uniqueNewPosts = transformedPosts.filter(
          (p) => !existingIds.has(p.id)
        );
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
        (a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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

  /** Pull-to-refresh: only activate if scroller is at the very top */
  const atTop = () => (feedRef.current?.scrollTop ?? 0) <= 0;

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!isRefreshing && atTop()) {
        pullStartY.current = e.touches[0].clientY;
        setIsPulling(true);
      }
    },
    [isRefreshing]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling || pullStartY.current === 0) return;
      // If user left the top while dragging, abort
      if (!atTop()) {
        setIsPulling(false);
        setPullPosition(0);
        return;
      }
      const deltaY = e.touches[0].clientY - pullStartY.current;
      if (deltaY > 0) {
        e.preventDefault(); // allow our custom pull
        setPullPosition(Math.pow(deltaY, 0.85));
      }
    },
    [isPulling]
  );

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

  // Header listeners for pull-to-refresh
  useEffect(() => {
    const headerElement = headerRef.current;
    if (!headerElement) return;

    const opts: AddEventListenerOptions & EventListenerOptions = { passive: false };
    headerElement.addEventListener('touchstart', handleTouchStart, opts);
    headerElement.addEventListener('touchmove', handleTouchMove, opts);
    headerElement.addEventListener('touchend', handleTouchEnd, opts);

    return () => {
      headerElement.removeEventListener('touchstart', handleTouchStart, opts);
      headerElement.removeEventListener('touchmove', handleTouchMove, opts);
      headerElement.removeEventListener('touchend', handleTouchEnd, opts);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Infinite scroll / index tracking
  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current || isCommentsOpen) return;
      const scrollTop = feedRef.current.scrollTop;
      const clientHeight = feedRef.current.clientHeight;

      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);

      if (
        scrollTop + clientHeight >= feedRef.current.scrollHeight - clientHeight &&
        !isLoading &&
        hasMore &&
        !isRefreshing
      ) {
        setPage((p) => p + 1);
      }
    };
    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener('scroll', handleScroll);
      return () => feed.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, isLoading, hasMore, isCommentsOpen, isRefreshing]);

  // Autoplay/pause videos based on index
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      const index = posts.findIndex((p) => p.id === id);
      if (index === currentIndex) {
        video.muted = isMuted;
        video.play().catch(() => {});
      } else {
        video.muted = true;
        video.pause();
      }
    });
  }, [currentIndex, posts, isMuted]);

  if (authLoading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
    );

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
      const comments = await apiClient.getComments(postId);
      setCurrentComments(comments);
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
    if (!commentInput.trim()) return;
    try {
      const active = posts[currentIndex];
      if (!active) return;
      const newComment = await apiClient.addComment(
        active.id,
        user.id,
        commentInput
      );
      setCurrentComments((prev) => [
        ...prev,
        { ...newComment, username: user.username },
      ]);
      setCommentInput('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  /** Clicking Feed should refresh + jump to top */
  const refreshAndScrollTop = useCallback(() => {
    // immediate jump to top + data refresh
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

  /** Bottom nav: if already on /feed, refresh instead of re-navigate */
  const onFeedNavClick = () => {
    if (location.pathname === '/feed') {
      refreshAndScrollTop();
    } else {
      navigate('/feed');
    }
  };

  return (
    <div className="feed-container">
      {latestUserPost && (
        <div
          className="feed-history-button"
          onClick={() => navigate(`/profile/${user.id}`)}
        >
          {latestUserPost.mediaType === 'video' ? (
            <video
              src={`${API_BASE_URL}${latestUserPost.mediaUrl}`}
              poster={`${API_BASE_URL}${latestUserPost.mediaUrl}`}
              className="feed-history-video"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <img
              src={`${API_BASE_URL}${latestUserPost.mediaUrl}`}
              alt={latestUserPost.challengeTitle || 'Latest Post'}
              className="feed-history-video"
            />
          )}
          <div className="feed-history-icon">
            <Clock size={16} />
          </div>
        </div>
      )}

      <div className="feed-overlay-header">
        <h1
          className="feed-title"
          ref={headerRef}
          onClick={refreshAndScrollTop}   // << click title to refresh + top
        >
          Feed
        </h1>
      </div>

      <div className={`feed-pull-indicator ${isRefreshing ? 'refreshing' : ''}`}>
        <Loader2
          size={24}
          style={{
            opacity: isRefreshing ? 1 : Math.min(pullPosition / REFRESH_THRESHOLD, 1),
            transform: isRefreshing ? 'rotate(360deg)' : `rotate(${pullPosition * 3}deg)`,
          }}
        />
      </div>

      <div className="feed-mobile-frame" ref={feedRef}>
        <div
          className="feed-layout"
          style={{
            transform: `translateY(${pullPosition}px)`,
            transition: isPulling ? 'none' : 'transform 0.3s ease',
          }}
        >
          {posts.length === 0 && !isLoading ? (
            <div className="feed-empty">
              <p className="feed-empty-text">No posts from friends yet</p>
              <p className="feed-empty-subtext">
                If you want to see content, add friends, or ask a friend to add a video or photo.
              </p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <div key={post.id} className="feed-post-fullscreen">
                {post.mediaType === 'video' ? (
                  <>
                    <video
                      src={`${API_BASE_URL}${post.mediaUrl}`}
                      className="feed-video"
                      loop
                      autoPlay
                      playsInline
                      ref={(el) => (videoRefs.current[post.id] = el)}
                    />
                    {currentIndex === idx && (
                      <button
                        className="feed-mute-button"
                        onClick={() => setIsMuted((prev) => !prev)}
                      >
                        {isMuted ? <VolumeX /> : <Volume2 />}
                      </button>
                    )}
                  </>
                ) : (
                  <img
                    src={`${API_BASE_URL}${post.mediaUrl}`}
                    alt={post.challengeTitle || 'Photo'}
                    className="feed-image"
                  />
                )}

                <button
                  className="feed-comments-button"
                  onClick={() => openComments(post.id)}
                >
                  <MessageCircle />
                </button>

                <div className="feed-overlay">
                  {post.avatarUrl && (
                    <img src={post.avatarUrl} alt="User avatar" className="feed-avatar" />
                  )}

                  <div className="feed-userline">
                    <span
                      className="feed-post-username"
                      onClick={() => handleProfileClick(post.userId)}
                    >
                      @{post.username}
                    </span>
                    <span className="feed-sep"> · </span>
                    <time
                      className="feed-post-time"
                      dateTime={post.createdAt}
                      title={new Date(post.createdAt).toLocaleString()}
                    >
                      {timeAgo(post.createdAt)}
                    </time>
                  </div>

                  <p className="feed-post-caption">{post.challengeTitle}</p>
                </div>
              </div>
            ))
          )}

          {isLoading && hasMore && (
            <div className="feed-loading-more">
              <Loader2 className="h-6 w-6 text-white animate-spin" />
            </div>
          )}
        </div>
      </div>

      {isCommentsOpen && (
        <div className="feed-comments-backdrop" onClick={animateAndClose}>
          <div
            ref={sheetRef}
            className="feed-comments-modal"
            onClick={(e) => e.stopPropagation()}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translateY(${sheetOffset}px)`,
              transition: isDragging ? 'none' : 'transform 260ms ease',
              touchAction: 'none',
            }}
            tabIndex={-1}
            onKeyDown={(e) => e.key === 'Escape' && animateAndClose()}
          >
            <div
              className="feed-comments-drag-handle"
              onPointerDown={onDragStart}
              onPointerMove={onDragMove}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            >
              <span className="feed-comments-drag-bar" />
            </div>
            <h3 className="feed-comments-title">Comments</h3>
            <div className="feed-comments-list">
              {currentComments.map((c) => (
                <p key={c.id} className="feed-comment">
                  {c.username}: {c.content}
                </p>
              ))}
            </div>
            <div className="feed-comments-input">
              <input
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Add a comment..."
              />
              <button onClick={handleAddComment}>Post</button>
            </div>
          </div>
        </div>
      )}

      <div className="index-bottom-nav">
        <div className="index-nav-container">
          <button
            className="index-nav-button index-nav-button-active"
            onClick={onFeedNavClick}   // << if already on /feed: refresh + top
          >
            <Home className="index-nav-icon" />
          </button>
          {isParticipant && (
            <button
              className="index-nav-button index-nav-button-inactive"
              onClick={() => navigate('/info')}
            >
              <Info className="index-nav-icon" />
            </button>
          )}
          <button
            className="index-nav-button index-nav-button-inactive"
            onClick={() => navigate('/')}
          >
            <Plus className="index-nav-icon" />
          </button>
          <button
            className="index-nav-button index-nav-button-inactive"
            onClick={() => navigate('/profile')}
          >
            <User className="index-nav-icon" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
