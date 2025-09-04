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
import './Index.css'; // bottom-nav styles

interface Post {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string;
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
  const [isClosingComments, setIsClosingComments] = useState(false);
  const [currentComments, setCurrentComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState('');

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const commentsRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);

  const isParticipant =
    !!(user as any)?.isConferenceParticipant ||
    !!(user as any)?.is_conference_participant;

  // Disable background scroll when comments are open
  useEffect(() => {
    if (isCommentsOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [isCommentsOpen]);

  // Fetch feed posts
  const fetchPosts = async (currentPage: number) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const newPosts = await apiClient.getFeed(user.id, currentPage);
      const transformedPosts = newPosts.map((post: any) => ({
        id: post.id,
        userId: post.user_id ?? post.userId,
        username: post.username,
        avatarUrl: post.avatar_url,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        challengeTitle: post.caption,
        createdAt: post.created_at,
      }));
      setPosts((prev) => {
        const unique = transformedPosts.filter(
          (np: Post) => !prev.some((pp) => pp.id === np.id)
        );
        return [...prev, ...unique];
      });
      if (newPosts.length < 10) setHasMore(false);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch latest user post
  const fetchLatestUserPost = async () => {
    if (!user) return;
    try {
      const userPosts: any[] = await apiClient.getUserPosts(user.id);
      if (userPosts.length > 0) {
        const latest = userPosts[userPosts.length - 1];
        setLatestUserPost({
          id: latest.id,
          userId: user.id,
          username: user.username,
          avatarUrl: user.avatar_url,
          mediaUrl: latest.media_url,
          mediaType: latest.media_type,
          challengeTitle: latest.caption,
          createdAt: latest.created_at,
        });
      }
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

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current || isCommentsOpen) return;
      const scrollTop = feedRef.current.scrollTop;
      const clientHeight = feedRef.current.clientHeight;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);

      if (
        scrollTop + clientHeight >=
          feedRef.current.scrollHeight - clientHeight &&
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

  // Video playback
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

  // --- DEBUGGING LOG ---
  // This will log the posts array to your browser console every time it updates.
  console.log("Current posts state:", posts);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaY = e.touches[0].clientY - startY.current;
    if (deltaY > 100) {
      closeComments();
    }
  };

  // Open / close comments
  const openComments = async (postId: string) => {
    if (!user) return;
    setIsCommentsOpen(true);
    try {
      const comments = await apiClient.getComments(postId);
      setCurrentComments(comments);
    } catch (err) {
      console.error(err);
      setCurrentComments([]);
    }
  };

  const closeComments = () => {
    setIsClosingComments(true);
    setTimeout(() => {
      setIsCommentsOpen(false);
      setIsClosingComments(false);
      setCurrentComments([]);
      setCommentInput('');
    }, 300); // match CSS animation duration
  };

  const handleAddComment = async () => {
    if (!commentInput.trim() || !user) return;
    try {
      const newComment = await apiClient.addComment(
        posts[currentIndex].id,
        user.id,
        commentInput
      );

      // Enrich locally so it shows immediately
      const enrichedComment: Comment = {
        ...newComment,
        username: user.username,   // add from current user
      };

      setCurrentComments((prev) => [...prev, enrichedComment]);
      setCommentInput('');
    } catch (err) {
      console.error('Failed to post comment', err);
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

      <div
        className="feed-mobile-frame"
        ref={feedRef}
        style={{ paddingBottom: '64px' }}
      >
        <div className="feed-layout">
          <div className="feed-overlay-header">

            <h1 className="feed-title">Feed</h1>
          </div>

          {posts.length === 0 && !isLoading ? (
            <div className="feed-empty">
              <p className="feed-empty-text">
                No posts from friends yet
              </p>
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
                    {/* The mute button is now inside the video's render block */}
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
                    loading="lazy"
                    // --- DEBUGGING HANDLER ---
                    // This will log an error to the console if the image URL fails to load.
                    onError={(e) => {
                      console.error(`Failed to load image for post ID ${post.id}. URL: ${e.currentTarget.src}`);
                    }}
                  />
                )}

                <button
                  className="feed-comments-button"
                  onClick={() => openComments(post.id)}
                >
                  <MessageCircle />
                </button>

                <div className="feed-overlay">
                  <div
                    className="feed-post-info"
                    onClick={() => handleProfileClick(post.userId)}
                  >
                    {post.avatarUrl && (
                      <img
                        src={post.avatarUrl}
                        alt="User avatar"
                        className="feed-avatar"
                      />
                    )}
                    <span className="feed-post-username">
                      @{post.username}
                    </span>
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
          {!hasMore && posts.length > 0 && (
            <div className="feed-end-of-feed">
              <p>You reached the end</p>
            </div>
          )}
        </div>
      </div>

      {/* Comments Modal + Backdrop */}
      {isCommentsOpen && (
        <div
          className={`feed-comments-backdrop ${isClosingComments ? 'closing' : ''}`}
          onClick={closeComments}
        >
          <div
            className="feed-comments-modal"
            ref={commentsRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="feed-comments-drag-handle"></div>
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

      {/* Bottom Navigation */}
      <div className="index-bottom-nav">
        <div className="index-nav-container">
          <button
            className="index-nav-button index-nav-button-active"
            onClick={() => navigate('/feed')}
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


