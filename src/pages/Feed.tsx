import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Home, User, Plus, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '@/lib/api-client';
import './Feed.css';

interface Post {
  id: string;
  userId: string;
  username: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  challengeTitle: string;
  createdAt: string;
}

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else {
        fetchPosts();
      }
    }
  }, [user, authLoading, navigate]);

  const fetchPosts = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const feedData = await apiClient.getFeed(user.id);
      
      // Transform API data to match our Post interface
      const transformedPosts = feedData.map((post: any) => ({
        id: post.id,
        userId: post.user_id,
        username: post.username || post.user_name,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        challengeTitle: post.challenge_title,
        createdAt: post.created_at
      }));
      
      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // Fallback to mock data if API fails
      setPosts([
        {
          id: '1',
          userId: 'user1',
          username: 'John Doe',
          mediaUrl: 'https://via.placeholder.com/300x200',
          mediaType: 'image',
          challengeTitle: 'Say hi to a stranger',
          createdAt: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          userId: 'user2',
          username: 'Jane Smith',
          mediaUrl: 'https://via.placeholder.com/300x200',
          mediaType: 'video',
          challengeTitle: 'Compliment someone',
          createdAt: '2024-01-15T09:15:00Z'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="feed-loading">
        <div className="feed-loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="feed-container">
      <div className="feed-mobile-frame">
        <div className="feed-layout">
          {/* Header */}
          <div className="feed-header">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="feed-back-button"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="feed-title">Feed</h1>
            <div className="feed-header-spacer"></div>
          </div>

          {/* Posts */}
          <div className="feed-content">
            {posts.length === 0 ? (
              <div className="feed-empty">
                <p className="feed-empty-text">Zatiaľ žiadne príspevky</p>
                <p className="feed-empty-subtext">Splň výzvu a pridaj svoj dokaz!</p>
              </div>
            ) : (
              <div className="feed-posts">
                {posts.map((post) => (
                  <div key={post.id} className="feed-post">
                    <div className="feed-post-header">
                      <span className="feed-post-username">{post.username}</span>
                      <span className="feed-post-challenge">{post.challengeTitle}</span>
                    </div>
                    
                    <div className="feed-post-media">
                      {post.mediaType === 'image' ? (
                        <img 
                          src={post.mediaUrl} 
                          alt="Challenge proof" 
                          className="feed-post-image"
                        />
                      ) : (
                        <video 
                          src={post.mediaUrl} 
                          controls 
                          className="feed-post-video"
                        />
                      )}
                    </div>
                    
                    <div className="feed-post-footer">
                      <span className="feed-post-date">
                        {new Date(post.createdAt).toLocaleDateString('sk-SK')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="feed-bottom-nav">
            <div className="feed-nav-container">
              {/* Left Button (Home/Feed Page - Active) */}
              <button className="feed-nav-button feed-nav-button-active">
                <Home className="feed-nav-icon" />
              </button>

              {/* Middle Button (Challenge Page) */}
              <button
                className="feed-nav-button feed-nav-button-inactive"
                onClick={() => navigate('/')}
              >
                <Plus className="feed-nav-icon" />
              </button>

              {/* Right Button (Profile Page) */}
              <button
                className="feed-nav-button feed-nav-button-inactive"
                onClick={() => navigate('/profile')}
              >
                <User className="feed-nav-icon" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed; 