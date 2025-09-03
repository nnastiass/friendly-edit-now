// FriendProfile.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { apiClient, API_BASE_URL } from '@/lib/api-client';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import './FriendProfile.css';
import './Index.css';

const pastelColors = ['#FFADAD','#FFD6A5','#FDFFB6','#CAFFBF','#9BF6FF','#A0C4FF','#BDB2FF','#FFC6FF'];
const generatePastelColor = (id: string) => id ? pastelColors[id.split('').reduce((acc,c)=>acc+c.charCodeAt(0),0) % pastelColors.length] : pastelColors[0];
const getInitials = (name: string | null) => !name ? 'U' : name.split(' ').map(n=>n[0]).join('').toUpperCase();

interface UserProfile { id: string; username: string|null; full_name: string|null; avatar_url: string|null; streak: number|null; }
interface UserPost { id: string; mediaUrl: string; mediaType: 'image'|'video'; challengeTitle: string; }

const FriendProfile = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const [profile, setProfile] = useState<UserProfile|null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loading, setLoading] = useState(false);

  // New state for fullscreen modal
  const [modalPost, setModalPost] = useState<UserPost | null>(null);

  useEffect(() => { if(friendId) fetchProfileAndPosts(friendId); }, [friendId]);

  const fetchProfileAndPosts = async (id: string) => {
    setLoading(true);
    try {
      const profileData: UserProfile = await apiClient.getProfile(id);
      setProfile(profileData);
      const userPosts = await apiClient.getUserPosts(id);
      setPosts(userPosts.map((p:any)=>({ id:p.id, mediaUrl:p.media_url, mediaType:p.media_type, challengeTitle:p.caption })));
    } catch (err) { console.error(err); toast.error('Nepodarilo sa načítať profil priateľa.'); setProfile(null); setPosts([]); }
    finally { setLoading(false); }
  };

  if(loading) return <div className="friend-profile-container flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 text-white animate-spin"/></div>;
  if(!profile) return <div className="friend-profile-container flex flex-col items-center justify-center min-h-screen"><p className="text-white text-lg">Profil nenájdený.</p><button onClick={()=>navigate(-1)} className="mt-4 text-red-500">Späť</button></div>;

  return (
    <div className="friend-profile-container">
      <div className="friend-profile-main-content">
        <div className="friend-profile-header">
          <Button variant="ghost" size="icon" className="friend-profile-back-button" onClick={()=>navigate(-1)}><ArrowLeft className="h-6 w-6"/></Button>
          <Avatar className="friend-profile-avatar">
            <AvatarImage src={`${API_BASE_URL}${profile.avatar_url||''}`}/>
            <AvatarFallback className="friend-profile-avatar-fallback" style={{backgroundColor: generatePastelColor(profile.id)}}>{getInitials(profile.full_name)}</AvatarFallback>
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
              {post.mediaType==='video' ? <video src={`${API_BASE_URL}${post.mediaUrl}`} className="friend-profile-post-media" muted loop playsInline/> :
                <img src={`${API_BASE_URL}${post.mediaUrl}`} alt={post.challengeTitle||'Photo'} className="friend-profile-post-media"/>}
            </div>
          )) : <p className="w-full text-center text-gray-400 mt-8">Tento používateľ zatiaľ nepridal žiadne príspevky.</p>}
        </div>
      </div>

      {/* Fullscreen modal */}
      {modalPost && (
        <div className="friend-profile-modal">
          <button className="friend-profile-modal-close" onClick={()=>setModalPost(null)}>×</button>
          {modalPost.mediaType==='video' ?
            <video src={`${API_BASE_URL}${modalPost.mediaUrl}`} className="friend-profile-modal-video" autoPlay loop muted playsInline/> :
            <img src={`${API_BASE_URL}${modalPost.mediaUrl}`} className="friend-profile-modal-image" alt={modalPost.challengeTitle}/>}
          <div className="friend-profile-modal-overlay">{modalPost.challengeTitle}</div>
        </div>
      )}
    </div>
  );
};

export default FriendProfile;
