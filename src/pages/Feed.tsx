import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Loader2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import './Feed.css';

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

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true); // Default muted
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

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
        const unique = transformedPosts.filter((np: Post) => !prev.some((pp) => pp.id === np.id));
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

  useEffect(() => { if (!authLoading && user) fetchPosts(1); }, [user, authLoading]);
  useEffect(() => { if (page > 1) fetchPosts(page); }, [page]);

  // Smooth scroll + detect current post
  useEffect(() => {
    const handleScroll = () => {
      if (!feedRef.current) return;
      const scrollTop = feedRef.current.scrollTop;
      const clientHeight = feedRef.current.clientHeight;
      const newIndex = Math.round(scrollTop / clientHeight);
      if (newIndex !== currentIndex) setCurrentIndex(newIndex);

      if (scrollTop + clientHeight >= feedRef.current.scrollHeight - clientHeight && !isLoading && hasMore) {
        setPage((p) => p + 1);
      }
    };
    const feed = feedRef.current;
    if (feed) {
      feed.addEventListener('scroll', handleScroll);
      return () => feed.removeEventListener('scroll', handleScroll);
    }
  }, [currentIndex, isLoading, hasMore]);

  // Play/pause videos & mute
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

  if (authLoading) return <div className="flex items-center justify-center min-h-screen bg-black"><Loader2 className="h-8 w-8 text-white animate-spin" /></div>;
  if (!user) { navigate('/auth'); return null; }

  return (
    <div className="feed-container">
      <div className="feed-mobile-frame" ref={feedRef}>
        <div className="feed-layout">
          <div className="feed-overlay-header">
            <button className="feed-back-button" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></button>
            <h1 className="feed-title">Feed</h1>
          </div>

          {posts.length === 0 && !isLoading ? (
            <div className="feed-empty">
              <p className="feed-empty-text">Zatiaľ žiadne video príspevky od priateľov</p>
              <p className="feed-empty-subtext">Ak chceš vidieť obsah, pridaj si priateľov, alebo popros priateľa, aby pridal video.</p>
            </div>
          ) : (
            posts.map((post, idx) => (
              <div key={post.id} className="feed-post-fullscreen">
                {post.mediaType === 'video' ? (
                  <video
                    src={`${API_BASE_URL}${post.mediaUrl}`}
                    className="feed-video"
                    loop
                    playsInline
                    ref={(el) => (videoRefs.current[post.id] = el)}
                  />
                ) : (
                  <img src={`${API_BASE_URL}${post.mediaUrl}`} alt={post.challengeTitle || 'Photo'} className="feed-image" loading="lazy"/>
                )}

                {/* Mute button overlay */}
                {post.mediaType === 'video' && currentIndex === idx && (
                  <button
                    className="feed-mute-button"
                    onClick={() => setIsMuted((prev) => !prev)}
                  >
                    {isMuted ? <VolumeX /> : <Volume2 />}
                  </button>
                )}

                <div className="feed-overlay">
                  <div className="feed-post-info">
                    <div className="feed-post-user-info">
                      {post.avatarUrl && <img src={post.avatarUrl} alt="User avatar" className="feed-avatar" />}
                      <span className="feed-post-username">@{post.username}</span>
                    </div>
                    <p className="feed-post-caption">{post.challengeTitle}</p>
                  </div>
                </div>
              </div>
            ))
          )}

          {isLoading && hasMore && <div className="feed-loading-more"><Loader2 className="h-6 w-6 text-white animate-spin"/></div>}
          {!hasMore && posts.length > 0 && <div className="feed-end-of-feed"><p>You reached the end</p></div>}
        </div>
      </div>
    </div>
  );
};

export default Feed;
