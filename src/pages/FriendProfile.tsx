// src/components/FriendProfile.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext'; // 👈 add
import './FriendProfile.css';
import './Index.css';

const pastelColors = ['#FFADAD','#FFD6A5','#FDFFB6','#CAFFBF','#9BF6FF','#A0C4FF','#BDB2FF','#FFC6FF'];
const generatePastelColor = (id: string) =>
  id ? pastelColors[id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % pastelColors.length] : pastelColors[0];
const getInitials = (name: string | null) => !name ? 'U' : name.split(' ').map(n => n[0]).join('').toUpperCase();

interface UserProfile { id: string; username: string|null; full_name: string|null; avatar_url: string|null; streak: number|null; }
interface UserPost { id: string; mediaUrl: string; mediaType: 'image'|'video'; challengeTitle: string; }

const FriendProfile = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const { user } = useAuth();                     // 👈 add
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalPost, setModalPost] = useState<UserPost | null>(null);

  // NEW: confirm delete state
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => { if(friendId) fetchProfileAndPosts(friendId); }, [friendId]);

  const fetchProfileAndPosts = async (id: string) => {
    setLoading(true);
    try {
      const profileData: UserProfile = await apiClient.getProfile(id);
      setProfile(profileData);

      // Get this user's posts (you can swap to a dedicated endpoint if you add one)
      const feedPosts = await apiClient.getFeed(id, 1);
      const userPosts = feedPosts.filter((p:any) => p.user_id === id);
      setPosts(userPosts.map((p:any) => ({
        id: p.id,
        mediaUrl: p.media_url,
        mediaType: p.media_type,
        challengeTitle: p.caption,
      })));
    } catch (err) {
      console.error(err);
      toast.error('Nepodarilo sa načítať profil priateľa.');
      setProfile(null);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirm = () => setConfirmOpen(true);
  const closeDeleteConfirm = () => setConfirmOpen(false);

  const doDelete = async () => {
    if (!modalPost || !user) return;
    try {
      await apiClient.deletePost(modalPost.id, { user_id: user.id, username: user.username });
      setPosts(prev => prev.filter(p => p.id !== modalPost.id)); // remove from grid
      setModalPost(null); // close media modal
      setConfirmOpen(false);
      toast.success('Post deleted');
    } catch (e: any) {
      toast.error(e?.message || 'Delete failed');
      setConfirmOpen(false);
    }
  };

  if (loading) return (
    <div className="friend-profile-container flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 text-white animate-spin"/>
    </div>
  );

  if (!profile) return (
    <div className="friend-profile-container flex flex-col items-center justify-center min-h-screen">
      <p className="text-white text-lg">Profil nenájdený.</p>
      <button onClick={()=>navigate(-1)} className="mt-4 text-red-500">Späť</button>
    </div>
  );

  const isOwner = user?.id === profile.id; // 👈 show delete only if viewing own profile

  return (
    <div className="friend-profile-container">
      <div className="friend-profile-main-content">
        <div className="friend-profile-header">
          <Button variant="ghost" size="icon" className="friend-profile-back-button" onClick={()=>navigate(-1)}>
            <ArrowLeft className="h-6 w-6"/>
          </Button>
          <Avatar className="friend-profile-avatar">
            <AvatarImage src={`${API_BASE_URL}${profile.avatar_url||''}`} />
            <AvatarFallback className="friend-profile-avatar-fallback" style={{backgroundColor: generatePastelColor(profile.id)}}>
              {getInitials(profile.full_name)}
            </AvatarFallback>
          </Avatar>
          <h1 className="friend-profile-name">{profile.full_name||'Your Name'}</h1>
          <p className="friend-profile-username">@{profile.username||'username'}</p>
        </div>

        <div className="friend-profile-streak-section">
          <span className="friend-profile-streak-number">{profile.streak||0}</span>
          <p className="friend-profile-streak-label">Day Streak</p>
          <div className="friend-profile-streak-line"></div>
        </div>

        <div className="friend-profile-posts-grid">
          {posts.length > 0 ? posts.map(post => (
            <div key={post.id} className="friend-profile-post-item" onClick={()=>setModalPost(post)}>
              {post.mediaType==='video' ? (
                <video src={`${API_BASE_URL}${post.mediaUrl}`} className="friend-profile-post-media" muted loop autoPlay playsInline />
              ) : (
                <img src={`${API_BASE_URL}${post.mediaUrl}`} alt={post.challengeTitle||'Photo'} className="friend-profile-post-media"/>
              )}
            </div>
          )) : <p className="w-full text-center text-gray-400 mt-8">Tento používateľ zatiaľ nepridal žiadne príspevky.</p>}
        </div>
      </div>

      {/* Fullscreen media modal */}
      {modalPost && (
        <div className="friend-profile-modal" onClick={()=>setModalPost(null)}>
          <button className="friend-profile-modal-close" onClick={(e)=>{ e.stopPropagation(); setModalPost(null); }}>×</button>

          {/* DELETE (top-right) — only owner */}
          {isOwner && (
            <button
              className="friend-profile-delete-btn"
              onClick={(e)=>{ e.stopPropagation(); openDeleteConfirm(); }}
              aria-label="Delete post"
              title="Delete post"
            >
              <Trash2 size={18}/>
            </button>
          )}

          {modalPost.mediaType==='video' ? (
            <video
              src={`${API_BASE_URL}${modalPost.mediaUrl}`}
              className="friend-profile-modal-video"
              autoPlay
              loop
              muted
              playsInline
              onClick={(e)=>e.stopPropagation()}
            />
          ) : (
            <img
              src={`${API_BASE_URL}${modalPost.mediaUrl}`}
              className="friend-profile-modal-image"
              alt={modalPost.challengeTitle}
              onClick={(e)=>e.stopPropagation()}
            />
          )}
          <div className="friend-profile-modal-overlay" onClick={(e)=>e.stopPropagation()}>
            {modalPost.challengeTitle}
          </div>

          {/* Confirm dialog (TU-style) */}
          {confirmOpen && (
            <div className="confirm-backdrop" onClick={closeDeleteConfirm}>
              <div className="confirm-modal" onClick={(e)=>e.stopPropagation()}>
                <h4>Delete this post?</h4>
                <p>This can’t be undone.</p>
                <div className="tu-row confirm-actions">
                  <button className="tu-btn tu-btn--ghost" onClick={closeDeleteConfirm}>Cancel</button>
                  <button className="tu-btn" onClick={doDelete}>Delete</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendProfile;
