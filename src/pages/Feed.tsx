// src/components/Feed.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
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
import { useNavigate } from 'react-router-dom';
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
  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const isParticipant =
    !!(user as any)?.isConferenceParticipant ||
    !!(user as any)?.is_conference_participant;
  // --- NEW state & refs near your other useState/useRef lines ---
  const [sheetOffset, setSheetOffset] = useState(0);       // px dragged down
  const [isDragging, setIsDragging] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const dragStartY = useRef(0);
  const sheetRef = useRef<HTMLDivElement>(null);

  // --- helper: animate close then unmount ---
  const animateAndClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setSheetOffset(window.innerHeight); // slide sheet down offscreen
  };

  // When the transform transition finishes, actually close (unmount)
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== sheetRef.current) return;
    if (isClosing) {
      setIsClosing(false);
      setSheetOffset(0);
      closeComments();
    }
  };


  // --- pointer/drag handlers ---
  const onDragStart = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartY.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onDragMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientY - dragStartY.current;
    setSheetOffset(Math.max(0, delta)); // only allow dragging downward
  };

  const onDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const CLOSE_THRESHOLD = 120; // px
    if (sheetOffset > CLOSE_THRESHOLD) {
      animateAndClose(); // animate out then unmount
    } else {
      setSheetOffset(0); // snap back to open
    }
  };


  useEffect(() => {
    document.body.style.overflow = isCommentsOpen ? 'hidden' : '';
  }, [isCommentsOpen]);

  const fetchPosts = async (currentPage: number) => {
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
  };

  const fetchLatestUserPost = async () => {
    if (!user) return;
    try {
      // Fetch first feed page
      const feedPosts = await apiClient.getFeed(user.id, 1);

      // Include only current user's posts
      const myPosts = feedPosts.filter((p: any) => p.user_id === user.id);

      if (myPosts.length === 0) return;

      // Pick the latest by createdAt
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
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchPosts(1);
      fetchLatestUserPost();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (page > 1) fetchPosts(page);
  }, [page]);

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
        hasMore
      ) {
        setPage((p) => p + 1);
      }
    };
    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener('scroll', handleScroll);
      return () => feed.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, isLoading, hasMore, isCommentsOpen]);

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
    requestAnimationFrame(() => setSheetOffset(0)); // <- this one is enough
;
;
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
      const newComment = await apiClient.addComment(
        posts[currentIndex].id,
        user.id,
        commentInput
      );
      setCurrentComments((prev) => [...prev, { ...newComment, username: user.username }]);
      setCommentInput('');
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  return (
    <div className="feed-container">
      {/* Latest User Post (History) */}
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

      {/* Feed posts */}
      <div className="feed-mobile-frame" ref={feedRef} style={{ paddingBottom: '64px' }}>
        <div className="feed-layout">
          <div className="feed-overlay-header">
            <h1 className="feed-title">Feed</h1>
          </div>

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
                      <button className="feed-mute-button" onClick={() => setIsMuted((prev) => !prev)}>
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

                <button className="feed-comments-button" onClick={() => openComments(post.id)}>
                  <MessageCircle />
                </button>

                <div className="feed-overlay">
                  {post.avatarUrl && <img src={post.avatarUrl} alt="User avatar" className="feed-avatar" />}
                  <span className="feed-post-username" onClick={() => handleProfileClick(post.userId)}>@{post.username}</span>
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

      {/* Comments modal */}
      {isCommentsOpen && (
        <div
          className="feed-comments-backdrop"
          onClick={animateAndClose} // animate close on backdrop click
        >
          <div
            ref={sheetRef}
            className="feed-comments-modal"
            onClick={(e) => e.stopPropagation()}
            onTransitionEnd={handleTransitionEnd}
            style={{
              transform: `translateY(${sheetOffset}px)`,
              transition: isDragging ? 'none' : 'transform 260ms ease',
              touchAction: 'none', // helps prevent scroll-jank on mobile
            }}
            // allow closing with ESC
            tabIndex={-1}
            onKeyDown={(e) => e.key === 'Escape' && animateAndClose()}
          >
            {/* drag handle area (grabbable) */}
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


      {/* Bottom navigation */}
      <div className="index-bottom-nav">
        <div className="index-nav-container">
          <button className="index-nav-button index-nav-button-active" onClick={() => navigate('/feed')}><Home className="index-nav-icon"/></button>
          {isParticipant && <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/info')}><Info className="index-nav-icon"/></button>}
          <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/')}><Plus className="index-nav-icon"/></button>
          <button className="index-nav-button index-nav-button-inactive" onClick={() => navigate('/profile')}><User className="index-nav-icon"/></button>
        </div>
      </div>
    </div>
  );
};

export default Feed;
